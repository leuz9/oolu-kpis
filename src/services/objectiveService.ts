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
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { kpiService } from './kpiService';
import type { Objective, KPI } from '../types';

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
      throw new Error('Failed to fetch objectives');
    }
  },

  async addObjective(objective: Omit<Objective, 'id'>) {
    try {
      const batch = writeBatch(db);
      
      // Create objective document
      const objectiveRef = doc(collection(db, COLLECTION_NAME));
      const objectiveData = {
        ...objective,
        progress: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      batch.set(objectiveRef, objectiveData);
      
      // Update parent objective if exists
      if (objective.parentId) {
        const parentRef = doc(db, COLLECTION_NAME, objective.parentId);
        batch.update(parentRef, {
          updatedAt: serverTimestamp()
        });
      }
      
      await batch.commit();
      
      return {
        id: objectiveRef.id,
        ...objectiveData
      } as Objective;
    } catch (error) {
      console.error('Error adding objective:', error);
      throw new Error('Failed to create objective');
    }
  },

  async updateObjective(id: string, objective: Partial<Objective>) {
    try {
      const batch = writeBatch(db);
      const objectiveRef = doc(db, COLLECTION_NAME, id);
      
      // Get current objective data
      const objectiveDoc = await getDoc(objectiveRef);
      if (!objectiveDoc.exists()) {
        throw new Error('Objective not found');
      }
      
      const currentObjective = objectiveDoc.data() as Objective;
      
      // Prepare update data with server timestamp
      const updateData = {
        ...objective,
        updatedAt: serverTimestamp()
      };
      
      batch.update(objectiveRef, updateData);
      
      // Update parent objective if exists
      if (currentObjective.parentId) {
        const parentRef = doc(db, COLLECTION_NAME, currentObjective.parentId);
        batch.update(parentRef, {
          updatedAt: serverTimestamp()
        });
      }
      
      await batch.commit();
      
      // Recalculate progress for parent if exists
      if (currentObjective.parentId) {
        await this.calculateProgress(currentObjective.parentId);
      }
      
      return {
        id,
        ...currentObjective,
        ...objective
      } as Objective;
    } catch (error) {
      console.error('Error updating objective:', error);
      throw new Error('Failed to update objective');
    }
  },

  async archiveObjective(id: string) {
    try {
      const batch = writeBatch(db);
      const objectiveRef = doc(db, COLLECTION_NAME, id);
      
      // Get objective data
      const objectiveDoc = await getDoc(objectiveRef);
      if (!objectiveDoc.exists()) {
        throw new Error('Objective not found');
      }
      
      const objective = objectiveDoc.data() as Objective;
      
      // Archive objective
      batch.update(objectiveRef, {
        status: 'archived',
        updatedAt: serverTimestamp()
      });
      
      // Update parent objective if exists
      if (objective.parentId) {
        const parentRef = doc(db, COLLECTION_NAME, objective.parentId);
        batch.update(parentRef, {
          updatedAt: serverTimestamp()
        });
      }
      
      await batch.commit();
      
      // Recalculate parent progress if exists
      if (objective.parentId) {
        await this.calculateProgress(objective.parentId);
      }
    } catch (error) {
      console.error('Error archiving objective:', error);
      throw new Error('Failed to archive objective');
    }
  },

  async calculateProgress(objectiveId: string): Promise<number> {
    try {
      const batch = writeBatch(db);
      const objectiveRef = doc(db, COLLECTION_NAME, objectiveId);
      const objectiveDoc = await getDoc(objectiveRef);
      
      if (!objectiveDoc.exists()) {
        throw new Error('Objective not found');
      }

      const objective = objectiveDoc.data() as Objective;
      
      // Calculate progress based on KPIs
      let kpiProgress = 0;
      let kpiCount = 0;
      if (objective.kpiIds?.length > 0) {
        const kpis = await kpiService.getKPIsByObjective(objectiveId);
        if (kpis.length > 0) {
          kpiProgress = kpis.reduce((sum, kpi) => sum + (kpi.progress || 0), 0);
          kpiCount = kpis.length;
        }
      }

      // Get child objectives
      const childObjectivesQuery = query(
        collection(db, COLLECTION_NAME),
        where('parentId', '==', objectiveId)
      );
      const childObjectivesSnapshot = await getDocs(childObjectivesQuery);
      const childObjectives = childObjectivesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Objective[];

      // Calculate progress including child objectives
      let totalProgress = kpiProgress;
      let totalCount = kpiCount;

      if (childObjectives.length > 0) {
        const childProgress = childObjectives.reduce((sum, child) => sum + (child.progress || 0), 0);
        totalProgress += childProgress;
        totalCount += childObjectives.length;
      }

      // Calculate final progress
      const progress = totalCount > 0 ? Math.round(totalProgress / totalCount) : 0;

      // Update objective progress
      batch.update(objectiveRef, {
        progress,
        updatedAt: serverTimestamp(),
        status: progress >= 90 ? 'on-track' : progress >= 60 ? 'at-risk' : 'behind'
      });

      await batch.commit();

      // Update parent objective if exists
      if (objective.parentId) {
        await this.calculateProgress(objective.parentId);
      }

      return progress;
    } catch (error) {
      console.error('Error calculating objective progress:', error);
      throw new Error('Failed to calculate progress');
    }
  },

  async linkKPI(objectiveId: string, kpiId: string) {
    try {
      const batch = writeBatch(db);
      
      // Update objective
      const objectiveRef = doc(db, COLLECTION_NAME, objectiveId);
      batch.update(objectiveRef, {
        kpiIds: arrayUnion(kpiId),
        updatedAt: serverTimestamp()
      });
      
      // Update KPI
      const kpiRef = doc(db, 'kpis', kpiId);
      batch.update(kpiRef, {
        objectiveIds: arrayUnion(objectiveId),
        updatedAt: serverTimestamp()
      });
      
      await batch.commit();

      // Calculate new progress
      const progress = await this.calculateProgress(objectiveId);

      return progress;
    } catch (error) {
      console.error('Error linking KPI to objective:', error);
      throw new Error('Failed to link KPI');
    }
  },

  async unlinkKPI(objectiveId: string, kpiId: string) {
    try {
      const batch = writeBatch(db);
      
      // Update objective
      const objectiveRef = doc(db, COLLECTION_NAME, objectiveId);
      batch.update(objectiveRef, {
        kpiIds: arrayRemove(kpiId),
        updatedAt: serverTimestamp()
      });
      
      // Update KPI
      const kpiRef = doc(db, 'kpis', kpiId);
      batch.update(kpiRef, {
        objectiveIds: arrayRemove(objectiveId),
        updatedAt: serverTimestamp()
      });
      
      await batch.commit();

      // Recalculate progress
      const progress = await this.calculateProgress(objectiveId);

      return progress;
    } catch (error) {
      console.error('Error unlinking KPI from objective:', error);
      throw new Error('Failed to unlink KPI');
    }
  }
};