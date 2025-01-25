import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, arrayUnion, arrayRemove, getDoc, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Objective, KeyResult } from '../types';

const COLLECTION_NAME = 'objectives';

export const objectiveService = {
  async getObjectives() {
    try {
      const objectivesSnapshot = await getDocs(collection(db, COLLECTION_NAME));
      return objectivesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Objective[];
    } catch (error) {
      console.error('Error fetching objectives:', error);
      throw error;
    }
  },

  async addObjective(objective: Omit<Objective, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...objective,
        kpiIds: objective.kpiIds || [], // Ensure kpiIds is initialized
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return {
        id: docRef.id,
        ...objective
      } as Objective;
    } catch (error) {
      console.error('Error adding objective:', error);
      throw error;
    }
  },

  async updateObjective(id: string, objective: Partial<Objective>) {
    try {
      const objectiveRef = doc(db, COLLECTION_NAME, id);
      
      // Get current objective data to check for KPI changes
      const currentObjectiveDoc = await getDoc(objectiveRef);
      const currentObjective = currentObjectiveDoc.data() as Objective;
      
      // Handle KPI changes if kpiIds is being updated
      if (objective.kpiIds) {
        const removedKpis = currentObjective.kpiIds?.filter(
          kpiId => !objective.kpiIds?.includes(kpiId)
        ) || [];
        
        const addedKpis = objective.kpiIds.filter(
          kpiId => !currentObjective.kpiIds?.includes(kpiId)
        );
        
        // Update removed KPIs
        for (const kpiId of removedKpis) {
          const kpiRef = doc(db, 'kpis', kpiId);
          await updateDoc(kpiRef, {
            objectiveIds: arrayRemove(id)
          });
        }
        
        // Update added KPIs
        for (const kpiId of addedKpis) {
          const kpiRef = doc(db, 'kpis', kpiId);
          await updateDoc(kpiRef, {
            objectiveIds: arrayUnion(id)
          });
        }
      }

      await updateDoc(objectiveRef, {
        ...objective,
        updatedAt: new Date().toISOString()
      });
      
      return {
        id,
        ...objective
      };
    } catch (error) {
      console.error('Error updating objective:', error);
      throw error;
    }
  },

  async archiveObjective(id: string) {
    try {
      const objectiveRef = doc(db, COLLECTION_NAME, id);
      
      // Get current objective data
      const objectiveDoc = await getDoc(objectiveRef);
      const objective = objectiveDoc.data() as Objective;
      
      // Remove objective reference from all linked KPIs
      if (objective.kpiIds?.length) {
        for (const kpiId of objective.kpiIds) {
          const kpiRef = doc(db, 'kpis', kpiId);
          await updateDoc(kpiRef, {
            objectiveIds: arrayRemove(id)
          });
        }
      }

      await updateDoc(objectiveRef, {
        status: 'archived',
        kpiIds: [], // Clear KPI links when archiving
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error archiving objective:', error);
      throw error;
    }
  },

  async linkKPI(objectiveId: string, kpiId: string) {
    try {
      const batch = writeBatch(db);
      
      // Update objective
      const objectiveRef = doc(db, COLLECTION_NAME, objectiveId);
      batch.update(objectiveRef, {
        kpiIds: arrayUnion(kpiId),
        updatedAt: new Date().toISOString()
      });
      
      // Update KPI
      const kpiRef = doc(db, 'kpis', kpiId);
      batch.update(kpiRef, {
        objectiveIds: arrayUnion(objectiveId),
        updatedAt: new Date().toISOString()
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error linking KPI to objective:', error);
      throw error;
    }
  },

  async unlinkKPI(objectiveId: string, kpiId: string) {
    try {
      const batch = writeBatch(db);
      
      // Update objective
      const objectiveRef = doc(db, COLLECTION_NAME, objectiveId);
      batch.update(objectiveRef, {
        kpiIds: arrayRemove(kpiId),
        updatedAt: new Date().toISOString()
      });
      
      // Update KPI
      const kpiRef = doc(db, 'kpis', kpiId);
      batch.update(kpiRef, {
        objectiveIds: arrayRemove(objectiveId),
        updatedAt: new Date().toISOString()
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error unlinking KPI from objective:', error);
      throw error;
    }
  }
};