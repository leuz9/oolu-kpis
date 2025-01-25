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
import type { Integration } from '../types';

const COLLECTION_NAME = 'integrations';

export const integrationService = {
  async getIntegrations() {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
      const integrationsSnapshot = await getDocs(q);
      return integrationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Integration[];
    } catch (error) {
      console.error('Error fetching integrations:', error);
      throw error;
    }
  },

  async addIntegration(integration: Omit<Integration, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...integration,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return {
        id: docRef.id,
        ...integration,
        createdBy: user.uid
      } as Integration;
    } catch (error) {
      console.error('Error adding integration:', error);
      throw error;
    }
  },

  async updateIntegration(id: string, data: Partial<Integration>) {
    try {
      const integrationRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(integrationRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return {
        id,
        ...data
      };
    } catch (error) {
      console.error('Error updating integration:', error);
      throw error;
    }
  },

  async deleteIntegration(id: string) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting integration:', error);
      throw error;
    }
  },

  async updateIntegrationStatus(id: string, status: Integration['status']) {
    try {
      const integrationRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(integrationRef, {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating integration status:', error);
      throw error;
    }
  },

  async getIntegrationsByType(type: Integration['type']) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('type', '==', type),
        orderBy('createdAt', 'desc')
      );
      const integrationsSnapshot = await getDocs(q);
      return integrationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Integration[];
    } catch (error) {
      console.error('Error fetching integrations by type:', error);
      throw error;
    }
  }
};