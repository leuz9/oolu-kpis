import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getAuth } from 'firebase/auth';

const TICKETS_COLLECTION = 'support_tickets';
const ARTICLES_COLLECTION = 'support_articles';

export const supportService = {
  // Support Tickets
  async getTickets() {
    try {
      const q = query(
        collection(db, TICKETS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      const ticketsSnapshot = await getDocs(q);
      return ticketsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  },

  async getTicketsByUser(userId: string) {
    try {
      const q = query(
        collection(db, TICKETS_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const ticketsSnapshot = await getDocs(q);
      return ticketsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      throw error;
    }
  },

  async createTicket(ticketData: any) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const docRef = await addDoc(collection(db, TICKETS_COLLECTION), {
        ...ticketData,
        userId: user.uid,
        userEmail: user.email,
        status: 'open',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return {
        id: docRef.id,
        ...ticketData,
        userId: user.uid,
        userEmail: user.email,
        status: 'open'
      };
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  },

  async updateTicket(ticketId: string, data: any) {
    try {
      const ticketRef = doc(db, TICKETS_COLLECTION, ticketId);
      await updateDoc(ticketRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return {
        id: ticketId,
        ...data
      };
    } catch (error) {
      console.error('Error updating ticket:', error);
      throw error;
    }
  },

  async deleteTicket(ticketId: string) {
    try {
      await deleteDoc(doc(db, TICKETS_COLLECTION, ticketId));
    } catch (error) {
      console.error('Error deleting ticket:', error);
      throw error;
    }
  },

  // Knowledge Base Articles
  async getArticles() {
    try {
      const q = query(
        collection(db, ARTICLES_COLLECTION),
        orderBy('lastUpdated', 'desc')
      );
      const articlesSnapshot = await getDocs(q);
      return articlesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }
  },

  async getArticlesByCategory(category: string) {
    try {
      const q = query(
        collection(db, ARTICLES_COLLECTION),
        where('category', '==', category),
        orderBy('lastUpdated', 'desc')
      );
      const articlesSnapshot = await getDocs(q);
      return articlesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching articles by category:', error);
      throw error;
    }
  },

  async updateArticleRating(articleId: string, helpful: boolean, userId: string) {
    try {
      const articleRef = doc(db, ARTICLES_COLLECTION, articleId);
      const updateData = helpful
        ? { helpful: increment(1), [`ratings.${userId}`]: 'helpful' }
        : { notHelpful: increment(1), [`ratings.${userId}`]: 'not_helpful' };
      
      await updateDoc(articleRef, updateData);
    } catch (error) {
      console.error('Error updating article rating:', error);
      throw error;
    }
  }
};