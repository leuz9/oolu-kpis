import { 
  collection, 
  doc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp,
  getDoc 
} from 'firebase/firestore';
import { getAuth, deleteUser } from 'firebase/auth';
import { db } from '../config/firebase';
import type { User, Role } from '../types';

const USERS_COLLECTION = 'users';
const ROLES_COLLECTION = 'roles';

export const adminService = {
  async getUsers() {
    try {
      // Add query to exclude superadmin users
      const q = query(
        collection(db, USERS_COLLECTION),
        where('role', '!=', 'superadmin')
      );
      const usersSnapshot = await getDocs(q);
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
      // First check if target user is a superadmin
      const userRef = doc(db, USERS_COLLECTION, userId);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data() as User;
      if (userData.role === 'superadmin') {
        throw new Error('Cannot modify superadmin users');
      }
      
      // Prepare update data
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };

      // Remove sensitive fields that shouldn't be updated directly
      delete updateData.id;
      delete updateData.email;
      delete updateData.createdAt;
      delete updateData.customClaims;

      // Prevent changing role to superadmin
      if (updateData.role === 'superadmin') {
        throw new Error('Cannot assign superadmin role');
      }

      await updateDoc(userRef, updateData);

      return { id: userId, ...data };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async deleteUser(userId: string) {
    try {
      // Check if target user is a superadmin
      const userRef = doc(db, USERS_COLLECTION, userId);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data() as User;
      if (userData.role === 'superadmin') {
        throw new Error('Cannot delete superadmin users');
      }

      // Delete from Firestore
      await deleteDoc(userRef);
      
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
      // Prevent modifying superadmin role
      if (roleId === 'superadmin') {
        throw new Error('Cannot modify superadmin role');
      }

      const roleRef = doc(db, ROLES_COLLECTION, roleId);
      await updateDoc(roleRef, {
        permissions: role.permissions,
        updatedAt: serverTimestamp()
      });

      // Update all users with this role to have the new permissions
      const q = query(
        collection(db, USERS_COLLECTION), 
        where('role', '==', roleId),
        // Exclude superadmin users from role updates
        where('role', '!=', 'superadmin')
      );
      const usersSnapshot = await getDocs(q);
      
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