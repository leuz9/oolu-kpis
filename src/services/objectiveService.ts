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
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { notificationService } from './notificationService';
import { getAuth } from 'firebase/auth';
import type { Objective } from '../types';

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

  // Real-time listener for objectives
  subscribeToObjectives(callback: (objectives: Objective[]) => void) {
    const q = query(collection(db, COLLECTION_NAME));
    
    return onSnapshot(q, (snapshot) => {
      const objectives = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Objective[];
      callback(objectives);
    }, (error) => {
      console.error('Error in objectives subscription:', error);
    });
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

      // Notify owner and contributors about the update (best-effort)
      try {
        const ownerId = (currentObjective as any).ownerId as string | undefined;
        const title = (currentObjective as any).title || id;
        if (ownerId) {
          await notificationService.createNotification({
            userId: ownerId,
            title: 'Objective Updated',
            message: `Objective "${title}" was updated.`,
            type: 'objective',
            priority: 'low',
            link: '/objectives'
          } as any);
        }
        const contributors = (currentObjective as any).contributors as string[] | undefined;
        if (Array.isArray(contributors)) {
          await Promise.all(contributors.map(userId => notificationService.createNotification({
            userId,
            title: 'Objective Updated',
            message: `Objective "${title}" was updated.`,
            type: 'objective',
            priority: 'low',
            link: '/objectives'
          } as any)));
        }
      } catch (e) {
        // non-blocking
      }
      
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

      // Notify owner (best-effort)
      try {
        const ownerId = (objective as any).ownerId as string | undefined;
        const title = (objective as any).title || id;
        if (ownerId) {
          await notificationService.createNotification({
            userId: ownerId,
            title: 'Objective Archived',
            message: `Objective "${title}" was archived.`,
            type: 'objective',
            priority: 'low',
            link: '/objectives'
          } as any);
        }
      } catch {}
      
      // Recalculate parent progress if exists
      if (objective.parentId) {
        await this.calculateProgress(objective.parentId);
      }
    } catch (error) {
      console.error('Error archiving objective:', error);
      throw new Error('Failed to archive objective');
    }
  },

  async updateProgress(objectiveId: string, progress: number, comment: string, keyResultUpdates?: Record<string, number>) {
    try {
      const batch = writeBatch(db);
      const objectiveRef = doc(db, COLLECTION_NAME, objectiveId);
      
      // Get current objective data
      const objectiveDoc = await getDoc(objectiveRef);
      if (!objectiveDoc.exists()) {
        throw new Error('Objective not found');
      }
      
      const currentObjective = objectiveDoc.data() as Objective;
      
      // Update objective progress
      batch.update(objectiveRef, {
        progress,
        updatedAt: serverTimestamp(),
        status: progress >= 90 ? 'on-track' : progress >= 60 ? 'at-risk' : 'behind'
      });
      
      // Update key results if provided
      if (keyResultUpdates && currentObjective.keyResults) {
        const updatedKeyResults = currentObjective.keyResults.map(kr => {
          const newCurrent = keyResultUpdates[kr.id] || kr.current;
          return {
            ...kr,
            current: newCurrent,
            progress: Math.min(100, Math.round((newCurrent / kr.target) * 100)),
            lastUpdated: new Date().toISOString()
          };
        });
        
        batch.update(objectiveRef, {
          keyResults: updatedKeyResults
        });
      }
      
      // Add progress update to history
      const progressUpdate = {
        progress,
        comment,
        updatedAt: new Date().toISOString(),
        updatedBy: getAuth().currentUser?.uid || 'unknown'
      };
      
      batch.update(objectiveRef, {
        progressHistory: arrayUnion(progressUpdate)
      });
      
      await batch.commit();
      
      // Update parent objective if exists
      if (currentObjective.parentId) {
        await this.calculateProgress(currentObjective.parentId);
      }
      
      // Notify owner and contributors about progress update (best-effort)
      try {
        const ownerId = (currentObjective as any).ownerId as string | undefined;
        const title = (currentObjective as any).title || objectiveId;
        const contributors = (currentObjective as any).contributors as string[] | undefined;
        const notifyUsers = new Set<string>();
        if (ownerId) notifyUsers.add(ownerId);
        if (Array.isArray(contributors)) contributors.forEach(id => notifyUsers.add(id));
        if (notifyUsers.size > 0) {
          await Promise.all(Array.from(notifyUsers).map(userId => notificationService.createNotification({
            userId,
            title: 'Objective Progress Updated',
            message: `"${title}" progress is now ${progress}%.`,
            type: 'objective',
            priority: 'medium',
            link: '/objectives'
          } as any)));
        }
      } catch {}
      
      return {
        id: objectiveId,
        ...currentObjective,
        progress,
        keyResults: keyResultUpdates ? currentObjective.keyResults?.map(kr => {
          const newCurrent = keyResultUpdates[kr.id] || kr.current;
          return {
            ...kr,
            current: newCurrent,
            progress: Math.min(100, Math.round((newCurrent / kr.target) * 100)),
            lastUpdated: new Date().toISOString()
          };
        }) : currentObjective.keyResults
      } as Objective;
    } catch (error) {
      console.error('Error updating objective progress:', error);
      throw new Error('Failed to update progress');
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

      let progress = 0;

      if (childObjectives.length > 0) {
        // Calculate based on child objectives
        const childProgress = childObjectives.reduce((sum, child) => sum + (child.progress || 0), 0);
        progress = Math.round(childProgress / childObjectives.length);
        console.log(`Parent objective ${objectiveId}: ${childObjectives.length} children, avg progress: ${progress}%`);
      } else if (objective.keyResults && objective.keyResults.length > 0) {
        // Calculate based on key results
        const keyResultsProgress = objective.keyResults.reduce((sum, kr) => {
          const krProgress = Math.min(100, Math.round((kr.current / kr.target) * 100));
          return sum + krProgress;
        }, 0);
        progress = Math.round(keyResultsProgress / objective.keyResults.length);
        console.log(`Objective ${objectiveId}: ${objective.keyResults.length} key results, avg progress: ${progress}%`);
      } else {
        // Use direct progress (should be set manually)
        progress = objective.progress || 0;
        console.log(`Objective ${objectiveId}: direct progress: ${progress}%`);
      }

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


  async deleteObjective(id: string) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get user data to check role
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      
      if (userData?.role !== 'superadmin') {
        throw new Error('Only superadmin can delete objectives');
      }

      const batch = writeBatch(db);
      const objectiveRef = doc(db, COLLECTION_NAME, id);
      
      // Get objective data
      const objectiveDoc = await getDoc(objectiveRef);
      if (!objectiveDoc.exists()) {
        throw new Error('Objective not found');
      }
      
      const objective = objectiveDoc.data() as Objective;
      
      // Delete all child objectives recursively
      const childrenQuery = query(
        collection(db, COLLECTION_NAME),
        where('parentId', '==', id)
      );
      const childrenSnapshot = await getDocs(childrenQuery);
      
      // Add child objective deletions to batch
      childrenSnapshot.docs.forEach(childDoc => {
        batch.delete(childDoc.ref);
      });

      // Unlink from parent if exists
      if (objective.parentId) {
        const parentRef = doc(db, COLLECTION_NAME, objective.parentId);
        batch.update(parentRef, {
          updatedAt: serverTimestamp()
        });
      }

      
      // Delete the objective
      batch.delete(objectiveRef);
      
      await batch.commit();

      // Recalculate parent progress if exists
      if (objective.parentId) {
        await this.calculateProgress(objective.parentId);
      }

      // Notify owner
      try {
        const ownerId = (objective as any).ownerId as string | undefined;
        const title = (objective as any).title || id;
        if (ownerId) {
          await notificationService.createNotification({
            userId: ownerId,
            title: 'Objective Deleted',
            message: `Objective "${title}" was deleted.`,
            type: 'objective',
            priority: 'high',
            link: '/objectives'
          } as any);
        }
      } catch {}
    } catch (error: any) {
      console.error('Error deleting objective:', error);
      if (error.message === 'Only superadmin can delete objectives') {
        throw error;
      }
      throw new Error('Failed to delete objective');
    }
  }
};