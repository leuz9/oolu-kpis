import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ROLES } from '../config/roles';
import type { User, UserRole, TeamMember } from '../types';

const USER_COLLECTION = 'users';
const TEAM_COLLECTION = 'team';

export const userService = {
  async createUser(userId: string, data: Partial<User>) {
    try {
      const defaultRole: UserRole = 'employee';
      const timestamp = new Date().toISOString();
      const employeePermissions = ROLES[defaultRole].permissions;

      const userData = {
        id: userId,
        email: data.email,
        displayName: data.displayName,
        role: defaultRole,
        department: '',
        photoURL: data.photoURL || null,
        authProvider: data.authProvider || 'password',
        isAdmin: false,
        createdAt: timestamp,
        lastLogin: timestamp,
        permissions: employeePermissions,
        customClaims: {
          role: defaultRole,
          permissions: employeePermissions,
          isAdmin: false
        }
      };

      await setDoc(doc(db, USER_COLLECTION, userId), userData);
      return userData;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async getOrCreateSSOUser(
    userId: string,
    data: Pick<User, 'email' | 'displayName'> & {
      photoURL?: string | null;
      authProvider: 'google.com' | 'microsoft.com';
    }
  ) {
    const userRef = doc(db, USER_COLLECTION, userId);
    const existingUser = await getDoc(userRef);
    const timestamp = new Date().toISOString();

    if (existingUser.exists()) {
      await updateDoc(userRef, {
        lastLogin: timestamp,
        authProvider: data.authProvider,
        ...(data.displayName ? { displayName: data.displayName } : {}),
        ...(data.photoURL ? { photoURL: data.photoURL } : {})
      });

      return {
        id: existingUser.id,
        ...existingUser.data(),
        lastLogin: timestamp,
        authProvider: data.authProvider,
        ...(data.displayName ? { displayName: data.displayName } : {}),
        ...(data.photoURL ? { photoURL: data.photoURL } : {})
      } as User;
    }

    const defaultRole: UserRole = 'employee';
    const employeePermissions = ROLES[defaultRole].permissions;
    const userData: User = {
      id: userId,
      email: data.email,
      displayName: data.displayName || data.email.split('@')[0],
      role: defaultRole,
      department: '',
      photoURL: data.photoURL || null,
      isAdmin: false,
      countryIds: [],
      createdAt: timestamp,
      lastLogin: timestamp,
      authProvider: data.authProvider,
      permissions: employeePermissions,
      customClaims: {
        role: defaultRole,
        permissions: employeePermissions,
        isAdmin: false
      }
    };

    await setDoc(userRef, userData);
    return userData;
  },

  async getUserByEmail(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const usersQuery = query(
      collection(db, USER_COLLECTION),
      where('email', '==', normalizedEmail)
    );
    const snapshot = await getDocs(usersQuery);

    if (snapshot.empty) return null;

    const userDoc = snapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() } as User;
  },

  async getUserForMicrosoftEmail(microsoftEmail: string) {
    const normalizedEmail = microsoftEmail.trim().toLowerCase();
    const mappedUsersQuery = query(
      collection(db, USER_COLLECTION),
      where('microsoftEmail', '==', normalizedEmail)
    );
    const mappedUsers = await getDocs(mappedUsersQuery);

    if (!mappedUsers.empty) {
      const userDoc = mappedUsers.docs[0];
      return { id: userDoc.id, ...userDoc.data() } as User;
    }

    const localPart = normalizedEmail.split('@')[0];
    return this.getUserByEmail(`${localPart}@ignite.solar`);
  },

  async getUser(userId: string) {
    try {
      const userDoc = await getDoc(doc(db, USER_COLLECTION, userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      return { id: userDoc.id, ...userDoc.data() } as User;
    } catch (error: unknown) {
      // Only log non-"User not found" errors to avoid console spam
      if (!(error instanceof Error) || error.message !== 'User not found') {
        console.error('Error getting user:', error);
      }
      throw error;
    }
  },

  async getAllUsers() {
    try {
      // Add query to exclude superadmin users
      const q = query(
        collection(db, USER_COLLECTION),
        where('role', '!=', 'superadmin')
      );
      const usersSnapshot = await getDocs(q);
      return usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  },

  async updateUser(userId: string, data: Partial<User>) {
    try {
      // Check if user exists and is not a superadmin
      const userDoc = await getDoc(doc(db, USER_COLLECTION, userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data() as User;
      if (userData.role === 'superadmin') {
        throw new Error('Cannot modify superadmin users');
      }

      const userRef = doc(db, USER_COLLECTION, userId);
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString()
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
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async updateLastLogin(userId: string) {
    try {
      const userRef = doc(db, USER_COLLECTION, userId);
      await updateDoc(userRef, {
        lastLogin: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  },

  async updateLastSeen(userId: string) {
    try {
      const userRef = doc(db, USER_COLLECTION, userId);
      await updateDoc(userRef, {
        lastSeen: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating last seen:', error);
      throw error;
    }
  },

  async deleteUser(userId: string) {
    try {
      // Check if user is superadmin
      const userDoc = await getDoc(doc(db, USER_COLLECTION, userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data() as User;
      if (userData.role === 'superadmin') {
        throw new Error('Cannot delete superadmin users');
      }

      await deleteDoc(doc(db, USER_COLLECTION, userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  async linkTeamMember(userId: string, teamMemberId: string) {
    try {
      // Check if user is superadmin
      const userDoc = await getDoc(doc(db, USER_COLLECTION, userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data() as User;
      if (userData.role === 'superadmin') {
        throw new Error('Cannot modify superadmin users');
      }

      const userRef = doc(db, USER_COLLECTION, userId);
      await updateDoc(userRef, { teamMemberId });

      const teamMemberRef = doc(db, TEAM_COLLECTION, teamMemberId);
      await updateDoc(teamMemberRef, { userId });
    } catch (error) {
      console.error('Error linking team member:', error);
      throw error;
    }
  },

  async getTeamMember(userId: string): Promise<TeamMember | null> {
    try {
      const q = query(collection(db, TEAM_COLLECTION), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as TeamMember;
    } catch (error) {
      console.error('Error getting team member:', error);
      throw error;
    }
  }
};
