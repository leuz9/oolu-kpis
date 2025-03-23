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
import type { Report } from '../types';

const COLLECTION_NAME = 'reports';

export const reportService = {
  async getReports() {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
      const reportsSnapshot = await getDocs(q);
      return reportsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Report[];
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  },

  async createReport(report: Omit<Report, 'id' | 'createdAt' | 'lastGenerated' | 'status'>) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...report,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        lastGenerated: null,
        status: 'scheduled'
      });

      return {
        id: docRef.id,
        ...report,
        createdBy: user.uid,
        status: 'scheduled'
      } as Report;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  },

  async updateReport(id: string, data: Partial<Report>) {
    try {
      const reportRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(reportRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return {
        id,
        ...data
      };
    } catch (error) {
      console.error('Error updating report:', error);
      throw error;
    }
  },

  async deleteReport(id: string) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  },

  async generateReport(id: string) {
    try {
      const reportRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(reportRef, {
        status: 'generated',
        lastGenerated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }
};