import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
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
      await updateDoc(objectiveRef, {
        status: 'archived',
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error archiving objective:', error);
      throw error;
    }
  },

  async addKeyResult(objectiveId: string, keyResult: Omit<KeyResult, 'id'>) {
    try {
      const objectiveRef = doc(db, COLLECTION_NAME, objectiveId);
      const newKeyResult = {
        id: `kr-${Date.now()}`,
        ...keyResult,
        createdAt: new Date().toISOString()
      };
      
      await updateDoc(objectiveRef, {
        keyResults: arrayUnion(newKeyResult),
        updatedAt: new Date().toISOString()
      });
      
      return newKeyResult;
    } catch (error) {
      console.error('Error adding key result:', error);
      throw error;
    }
  },

  async updateKeyResult(objectiveId: string, keyResult: KeyResult) {
    try {
      const objectiveRef = doc(db, COLLECTION_NAME, objectiveId);
      const objective = (await getDoc(objectiveRef)).data() as Objective;
      
      const updatedKeyResults = objective.keyResults.map(kr =>
        kr.id === keyResult.id ? keyResult : kr
      );
      
      await updateDoc(objectiveRef, {
        keyResults: updatedKeyResults,
        updatedAt: new Date().toISOString()
      });
      
      return keyResult;
    } catch (error) {
      console.error('Error updating key result:', error);
      throw error;
    }
  }
};