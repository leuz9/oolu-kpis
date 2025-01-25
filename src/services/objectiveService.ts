import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, arrayUnion, arrayRemove, getDoc, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';
import { kpiService } from './kpiService';
import type { Objective, KeyResult, KPI } from '../types';

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

  async calculateProgress(objectiveId: string): Promise<number> {
    try {
      const objectiveRef = doc(db, COLLECTION_NAME, objectiveId);
      const objectiveDoc = await getDoc(objectiveRef);
      
      if (!objectiveDoc.exists()) {
        console.error('Objective not found:', objectiveId);
        return 0;
      }

      const objective = objectiveDoc.data() as Objective;
      
      // Check if objective has kpiIds array
      if (!objective.kpiIds || !Array.isArray(objective.kpiIds) || objective.kpiIds.length === 0) {
        console.log('No KPIs linked to objective:', objectiveId);
        return 0;
      }

      // Get all linked KPIs
      const kpis = await kpiService.getKPIsByObjective(objectiveId);
      
      if (!kpis.length) {
        console.log('No KPIs found for objective:', objectiveId);
        return 0;
      }

      // Calculate average progress
      const totalProgress = kpis.reduce((sum, kpi) => {
        // Ensure KPI has valid progress value
        const progress = typeof kpi.progress === 'number' ? kpi.progress : 0;
        return sum + progress;
      }, 0);
      
      const averageProgress = Math.round(totalProgress / kpis.length);

      // Update objective progress
      await updateDoc(objectiveRef, {
        progress: averageProgress,
        updatedAt: new Date().toISOString()
      });

      return averageProgress;
    } catch (error) {
      console.error('Error calculating objective progress:', error);
      return 0; // Return 0 progress on error
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

      // Calculate new progress after linking KPI
      await this.calculateProgress(objectiveId);
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

      // Recalculate progress after unlinking KPI
      await this.calculateProgress(objectiveId);
    } catch (error) {
      console.error('Error unlinking KPI from objective:', error);
      throw error;
    }
  }
};