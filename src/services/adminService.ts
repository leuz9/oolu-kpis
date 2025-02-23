import { 
  collection, 
  doc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { getAuth, deleteUser } from 'firebase/auth';
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

  async updateUser(userId: string, data: Partial<User>) {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      
      // Prepare update data
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };

      // Remove sensitive fields that shouldn't be updated directly
      delete updateData.id;
      delete updateData.email;
      delete updateData.createdAt;

      await updateDoc(userRef, updateData);

      return { id: userId, ...data };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async deleteUser(userId: string) {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, USERS_COLLECTION, userId));
      
      // Delete from Firebase Auth
      const auth = getAuth();
      const user = auth.currentUser;
      if (user && user.uid === userId) {
        await deleteUser(user);
      }
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
        updatedAt: serverTimestamp()
      });

      // Update all users with this role to have the new permissions
      const usersQuery = query(collection(db, USERS_COLLECTION), where('role', '==', roleId));
      const usersSnapshot = await getDocs(usersQuery);
      
      const batch = db.batch();
      usersSnapshot.docs.forEach(userDoc => {
        batch.update(userDoc.ref, {
          permissions: role.permissions
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