import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { UserSettings } from '../types';

const COLLECTION_NAME = 'settings';

export const settingsService = {
  async getUserSettings(userId: string) {
    try {
      const settingsDoc = await getDoc(doc(db, COLLECTION_NAME, userId));
      if (!settingsDoc.exists()) {
        // Create default settings if they don't exist
        const defaultSettings: UserSettings = {
          notifications: {
            email: true,
            push: false,
            desktop: true,
            objectives: true,
            kpis: true,
            projects: true,
            team: true
          },
          theme: {
            mode: 'light',
            primaryColor: 'indigo',
            sidebarCollapsed: false
          },
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h'
        };
        await setDoc(doc(db, COLLECTION_NAME, userId), defaultSettings);
        return defaultSettings;
      }
      return settingsDoc.data() as UserSettings;
    } catch (error) {
      console.error('Error fetching user settings:', error);
      throw error;
    }
  },

  async updateUserSettings(userId: string, settings: Partial<UserSettings>) {
    try {
      const settingsRef = doc(db, COLLECTION_NAME, userId);
      await updateDoc(settingsRef, settings);
      return settings;
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }
};