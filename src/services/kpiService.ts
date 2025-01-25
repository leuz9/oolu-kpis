import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, arrayUnion, arrayRemove, getDoc, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';
import { objectiveService } from './objectiveService';
import type { KPI } from '../types';

const COLLECTION_NAME = 'kpis';

export const kpiService = {
  async getKPIs() {
    try {
      const kpisSnapshot = await getDocs(collection(db, COLLECTION_NAME));
      return kpisSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as KPI[];
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      throw error;
    }
  },

  async addKPI(kpi: Omit<KPI, 'id'>) {
    try {
      const batch = writeBatch(db);
      
      // Create KPI document
      const kpiRef = doc(collection(db, COLLECTION_NAME));
      const kpiData = {
        ...kpi,
        objectiveIds: kpi.objectiveIds || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      batch.set(kpiRef, kpiData);
      
      // Update objectives if any are linked
      if (kpiData.objectiveIds.length > 0) {
        for (const objectiveId of kpiData.objectiveIds) {
          const objectiveRef = doc(db, 'objectives', objectiveId);
          batch.update(objectiveRef, {
            kpiIds: arrayUnion(kpiRef.id),
            updatedAt: new Date().toISOString()
          });
        }
      }
      
      await batch.commit();
      
      return {
        id: kpiRef.id,
        ...kpiData
      } as KPI;
    } catch (error) {
      console.error('Error adding KPI:', error);
      throw error;
    }
  },

  async updateKPI(id: string, kpi: Partial<KPI>) {
    try {
      const batch = writeBatch(db);
      const kpiRef = doc(db, COLLECTION_NAME, id);
      
      // Get current KPI data to check for objective changes
      const currentKpiDoc = await getDoc(kpiRef);
      const currentKpi = currentKpiDoc.data() as KPI;
      
      // Handle objective changes if objectiveIds is being updated
      if (kpi.objectiveIds) {
        const removedObjectives = currentKpi.objectiveIds?.filter(
          objId => !kpi.objectiveIds?.includes(objId)
        ) || [];
        
        const addedObjectives = kpi.objectiveIds.filter(
          objId => !currentKpi.objectiveIds?.includes(objId)
        );
        
        // Update removed objectives
        for (const objectiveId of removedObjectives) {
          const objectiveRef = doc(db, 'objectives', objectiveId);
          batch.update(objectiveRef, {
            kpiIds: arrayRemove(id),
            updatedAt: new Date().toISOString()
          });
        }
        
        // Update added objectives
        for (const objectiveId of addedObjectives) {
          const objectiveRef = doc(db, 'objectives', objectiveId);
          batch.update(objectiveRef, {
            kpiIds: arrayUnion(id),
            updatedAt: new Date().toISOString()
          });
        }
      }
      
      // Update KPI document
      batch.update(kpiRef, {
        ...kpi,
        updatedAt: new Date().toISOString()
      });
      
      await batch.commit();

      // Recalculate progress for all linked objectives
      if (currentKpi.objectiveIds?.length) {
        await Promise.all(
          currentKpi.objectiveIds.map(objectiveId => 
            objectiveService.calculateProgress(objectiveId)
          )
        );
      }
      
      return {
        id,
        ...kpi
      };
    } catch (error) {
      console.error('Error updating KPI:', error);
      throw error;
    }
  },

  async deleteKPI(id: string) {
    try {
      const batch = writeBatch(db);
      const kpiRef = doc(db, COLLECTION_NAME, id);
      
      // Get KPI data to remove references
      const kpiDoc = await getDoc(kpiRef);
      const kpi = kpiDoc.data() as KPI;
      
      // Remove KPI from all linked objectives
      if (kpi.objectiveIds?.length) {
        for (const objectiveId of kpi.objectiveIds) {
          const objectiveRef = doc(db, 'objectives', objectiveId);
          batch.update(objectiveRef, {
            kpiIds: arrayRemove(id),
            updatedAt: new Date().toISOString()
          });
        }
      }
      
      // Delete KPI document
      batch.delete(kpiRef);
      
      await batch.commit();
    } catch (error) {
      console.error('Error deleting KPI:', error);
      throw error;
    }
  },

  async getKPIsByObjective(objectiveId: string) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('objectiveIds', 'array-contains', objectiveId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as KPI[];
    } catch (error) {
      console.error('Error getting KPIs by objective:', error);
      throw error;
    }
  },

  async getUnlinkedKPIs() {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('objectiveIds', '==', [])
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as KPI[];
    } catch (error) {
      console.error('Error getting unlinked KPIs:', error);
      throw error;
    }
  }
};