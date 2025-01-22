import { collection, doc, getDocs, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { getAuth, updateUser, deleteUser } from 'firebase/auth';
import { db } from '../config/firebase';
import type { User, Role } from '../types';

const USERS_COLLECTION = 'users';
const ROLES_COLLECTION = 'roles';

export const adminService = {
  async getUsers() {
    try {
      const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
      return usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  async updateUserRole(userId: string, role: string, isAdmin: boolean) {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(userRef, { 
        role,
        isAdmin
      });
      
      // Update custom claims in Firebase Auth
      const auth = getAuth();
      await auth.setCustomUserClaims(userId, { admin: isAdmin });
      
      return { role, isAdmin };
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  async deleteUser(userId: string) {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, USERS_COLLECTION, userId));
      
      // Delete from Firebase Auth
      const auth = getAuth();
      await auth.deleteUser(userId);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  async updateRole(roleId: string, role: Role) {
    try {
      const roleRef = doc(db, ROLES_COLLECTION, roleId);
      await updateDoc(roleRef, {
        permissions: role.permissions,
        updatedAt: new Date().toISOString()
      });

      // Update all users with this role to have the new permissions
      const usersQuery = query(collection(db, USERS_COLLECTION), where('role', '==', roleId));
      const usersSnapshot = await getDocs(usersQuery);
      
      const batch = db.batch();
      usersSnapshot.docs.forEach(userDoc => {
        batch.update(userDoc.ref, {
          permissions: role.permissions,
          'customClaims.permissions': role.permissions
        });
      });
      await batch.commit();

      return role;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }
};