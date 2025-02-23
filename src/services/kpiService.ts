import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  arrayUnion, 
  arrayRemove, 
  getDoc, 
  writeBatch,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { objectiveService } from './objectiveService';
import { getAuth } from 'firebase/auth';
import type { KPI } from '../types';

const COLLECTION_NAME = 'kpis';

export const kpiService = {
  async getKPIs() {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
      const kpisSnapshot = await getDocs(q);
      return kpisSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as KPI[];
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      throw new Error('Failed to fetch KPIs');
    }
  },

  async getKPIsByObjective(objectiveId: string) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('objectiveIds', 'array-contains', objectiveId)
      );
      const kpisSnapshot = await getDocs(q);
      return kpisSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as KPI[];
    } catch (error) {
      console.error('Error fetching KPIs by objective:', error);
      throw new Error('Failed to fetch KPIs for objective');
    }
  },

  async getUnlinkedKPIs() {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('objectiveIds', '==', [])
      );
      const kpisSnapshot = await getDocs(q);
      return kpisSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as KPI[];
    } catch (error) {
      console.error('Error fetching unlinked KPIs:', error);
      throw new Error('Failed to fetch unlinked KPIs');
    }
  },

  async addKPI(kpi: Omit<KPI, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...kpi,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return {
        id: docRef.id,
        ...kpi
      } as KPI;
    } catch (error) {
      console.error('Error adding KPI:', error);
      throw new Error('Failed to create KPI');
    }
  },

  async updateKPI(id: string, kpi: Partial<KPI>) {
    try {
      const kpiRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(kpiRef, {
        ...kpi,
        updatedAt: serverTimestamp()
      });
      return {
        id,
        ...kpi
      };
    } catch (error) {
      console.error('Error updating KPI:', error);
      throw new Error('Failed to update KPI');
    }
  },

  async deleteKPI(id: string) {
    try {
      const auth = getAuth();
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      const batch = writeBatch(db);
      const kpiRef = doc(db, COLLECTION_NAME, id);
      
      // Get KPI data to remove references
      const kpiDoc = await getDoc(kpiRef);
      if (!kpiDoc.exists()) {
        throw new Error('KPI not found');
      }
      
      const kpi = kpiDoc.data() as KPI;
      
      // Remove KPI from all linked objectives
      if (kpi.objectiveIds?.length) {
        for (const objectiveId of kpi.objectiveIds) {
          const objectiveRef = doc(db, 'objectives', objectiveId);
          batch.update(objectiveRef, {
            kpiIds: arrayRemove(id),
            updatedAt: serverTimestamp()
          });
        }
      }
      
      // Delete KPI document
      batch.delete(kpiRef);
      
      await batch.commit();

      // Recalculate progress for affected objectives
      if (kpi.objectiveIds?.length) {
        await Promise.all(
          kpi.objectiveIds.map(objectiveId =>
            objectiveService.calculateProgress(objectiveId)
          )
        );
      }
    } catch (error: any) {
      console.error('Error deleting KPI:', error);
      if (error.code === 'permission-denied') {
        throw new Error('You do not have permission to delete KPIs');
      }
      throw new Error('Failed to delete KPI');
    }
  },

  async addContributor(kpiId: string, userId: string) {
    try {
      const kpiRef = doc(db, COLLECTION_NAME, kpiId);
      await updateDoc(kpiRef, {
        contributors: arrayUnion(userId),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding contributor:', error);
      throw new Error('Failed to add contributor');
    }
  },

  async removeContributor(kpiId: string, userId: string) {
    try {
      const kpiRef = doc(db, COLLECTION_NAME, kpiId);
      await updateDoc(kpiRef, {
        contributors: arrayRemove(userId),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error removing contributor:', error);
      throw new Error('Failed to remove contributor');
    }
  },

  async getKPIsByContributor(userId: string) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('contributors', 'array-contains', userId)
      );
      const kpisSnapshot = await getDocs(q);
      return kpisSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as KPI[];
    } catch (error) {
      console.error('Error fetching KPIs by contributor:', error);
      throw new Error('Failed to fetch KPIs');
    }
  }
};