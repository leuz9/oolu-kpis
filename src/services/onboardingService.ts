import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { OnboardingProgress } from '../types';

const COLLECTION_NAME = 'onboarding_progress';

export const onboardingService = {
  async getProgress(userId: string) {
    try {
      const docRef = doc(db, COLLECTION_NAME, userId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        // Create initial progress
        const initialProgress: OnboardingProgress = {
          userId,
          completedSteps: [],
          startedAt: new Date().toISOString(),
          dismissed: false
        };
        await setDoc(docRef, initialProgress);
        return initialProgress;
      }
      
      return docSnap.data() as OnboardingProgress;
    } catch (error) {
      console.error('Error getting onboarding progress:', error);
      throw error;
    }
  },

  async updateProgress(userId: string, data: Partial<OnboardingProgress>) {
    try {
      const docRef = doc(db, COLLECTION_NAME, userId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating onboarding progress:', error);
      throw error;
    }
  },

  async completeStep(userId: string, stepId: string) {
    try {
      const docRef = doc(db, COLLECTION_NAME, userId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Onboarding progress not found');
      }
      
      const progress = docSnap.data() as OnboardingProgress;
      const completedSteps = [...new Set([...progress.completedSteps, stepId])];
      
      await updateDoc(docRef, {
        completedSteps,
        lastStep: stepId,
        updatedAt: serverTimestamp(),
        ...(completedSteps.length === progress.completedSteps.length + 1 && {
          completedAt: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error completing onboarding step:', error);
      throw error;
    }
  },

  async dismissOnboarding(userId: string) {
    try {
      const docRef = doc(db, COLLECTION_NAME, userId);
      await updateDoc(docRef, {
        dismissed: true,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error dismissing onboarding:', error);
      throw error;
    }
  },

  async resetOnboarding(userId: string) {
    try {
      const docRef = doc(db, COLLECTION_NAME, userId);
      await setDoc(docRef, {
        userId,
        completedSteps: [],
        startedAt: new Date().toISOString(),
        dismissed: false,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      throw error;
    }
  }
};