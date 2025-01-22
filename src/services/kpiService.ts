import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { KPI, KPIHistory } from '../types';

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
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...kpi,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return {
        id: docRef.id,
        ...kpi
      } as KPI;
    } catch (error) {
      console.error('Error adding KPI:', error);
      throw error;
    }
  },

  async updateKPI(id: string, kpi: Partial<KPI>) {
    try {
      const kpiRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(kpiRef, {
        ...kpi,
        updatedAt: new Date().toISOString()
      });
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
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting KPI:', error);
      throw error;
    }
  },

  async addKPIHistory(id: string, value: number) {
    try {
      const kpiRef = doc(db, COLLECTION_NAME, id);
      const historyEntry: KPIHistory = {
        date: new Date().toISOString(),
        value
      };
      
      await updateDoc(kpiRef, {
        history: arrayUnion(historyEntry),
        value,
        lastUpdated: new Date().toISOString()
      });
      
      return historyEntry;
    } catch (error) {
      console.error('Error adding KPI history:', error);
      throw error;
    }
  }
};