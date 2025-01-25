import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION_NAME = 'departments';

export const departmentService = {
  async getDepartments() {
    try {
      const departmentsSnapshot = await getDocs(collection(db, COLLECTION_NAME));
      return departmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  },

  async getDepartment(id: string) {
    try {
      const departmentDoc = await getDoc(doc(db, COLLECTION_NAME, id));
      if (!departmentDoc.exists()) {
        throw new Error('Department not found');
      }
      return {
        id: departmentDoc.id,
        ...departmentDoc.data()
      };
    } catch (error) {
      console.error('Error fetching department:', error);
      throw error;
    }
  },

  async addDepartment(department: any) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...department,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return {
        id: docRef.id,
        ...department
      };
    } catch (error) {
      console.error('Error adding department:', error);
      throw error;
    }
  },

  async updateDepartment(id: string, department: any) {
    try {
      const departmentRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(departmentRef, {
        ...department,
        updatedAt: serverTimestamp()
      });
      return {
        id,
        ...department
      };
    } catch (error) {
      console.error('Error updating department:', error);
      throw error;
    }
  },

  async deleteDepartment(id: string) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting department:', error);
      throw error;
    }
  },

  async getDepartmentsByManager(managerId: string) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('manager', '==', managerId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching departments by manager:', error);
      throw error;
    }
  },

  async updateDepartmentKPIs(id: string, kpis: any[]) {
    try {
      const departmentRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(departmentRef, {
        kpis,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating department KPIs:', error);
      throw error;
    }
  },

  async updateDepartmentTeams(id: string, teams: any[]) {
    try {
      const departmentRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(departmentRef, {
        teams,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating department teams:', error);
      throw error;
    }
  }
};