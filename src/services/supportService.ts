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
  serverTimestamp,
  increment,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getAuth } from 'firebase/auth';
import type { SupportTicket, SupportArticle } from '../types';

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
      })) as SupportTicket[];
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
      })) as SupportTicket[];
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      throw error;
    }
  },

  async getTicket(ticketId: string) {
    try {
      const ticketDoc = await getDoc(doc(db, TICKETS_COLLECTION, ticketId));
      if (!ticketDoc.exists()) {
        throw new Error('Ticket not found');
      }
      return { id: ticketDoc.id, ...ticketDoc.data() } as SupportTicket;
    } catch (error) {
      console.error('Error fetching ticket:', error);
      throw error;
    }
  },

  async createTicket(ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'userEmail'>) {
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
      } as SupportTicket;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  },

  async updateTicket(ticketId: string, data: Partial<SupportTicket>) {
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

  async addTicketComment(ticketId: string, content: string) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const ticketRef = doc(db, TICKETS_COLLECTION, ticketId);
      const comment = {
        id: Date.now().toString(),
        content,
        userId: user.uid,
        userEmail: user.email,
        createdAt: new Date().toISOString()
      };

      await updateDoc(ticketRef, {
        comments: arrayUnion(comment),
        updatedAt: serverTimestamp()
      });

      return comment;
    } catch (error) {
      console.error('Error adding ticket comment:', error);
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
      })) as SupportArticle[];
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
      })) as SupportArticle[];
    } catch (error) {
      console.error('Error fetching articles by category:', error);
      throw error;
    }
  },

  async getArticle(articleId: string) {
    try {
      const articleDoc = await getDoc(doc(db, ARTICLES_COLLECTION, articleId));
      if (!articleDoc.exists()) {
        throw new Error('Article not found');
      }
      return { id: articleDoc.id, ...articleDoc.data() } as SupportArticle;
    } catch (error) {
      console.error('Error fetching article:', error);
      throw error;
    }
  },

  async updateArticleRating(articleId: string, helpful: boolean) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const articleRef = doc(db, ARTICLES_COLLECTION, articleId);
      const updateData = helpful
        ? { 
            helpful: increment(1),
            [`ratings.${user.uid}`]: 'helpful'
          }
        : { 
            notHelpful: increment(1),
            [`ratings.${user.uid}`]: 'not_helpful'
          };
      
      await updateDoc(articleRef, updateData);
    } catch (error) {
      console.error('Error updating article rating:', error);
      throw error;
    }
  },

  async searchArticles(query: string) {
    try {
      // Note: In a production environment, you would want to use a proper search service
      // like Algolia or Elasticsearch. This is a simple implementation for demo purposes.
      const articlesSnapshot = await getDocs(collection(db, ARTICLES_COLLECTION));
      const articles = articlesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SupportArticle[];

      return articles.filter(article => 
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.content.toLowerCase().includes(query.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    } catch (error) {
      console.error('Error searching articles:', error);
      throw error;
    }
  }
};