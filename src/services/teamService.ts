import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { userService } from './userService';
import type { TeamMember, User } from '../types';

const COLLECTION_NAME = 'team';

export const teamService = {
  async getTeamMembers() {
    try {
      const teamSnapshot = await getDocs(collection(db, COLLECTION_NAME));
      return teamSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TeamMember[];
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  },

  async addTeamMember(teamMember: Omit<TeamMember, 'id'>) {
    try {
      const timestamp = new Date().toISOString();
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...teamMember,
        createdAt: timestamp,
        updatedAt: timestamp,
        status: 'active'
      });

      // If this team member is associated with a user, link them
      if (teamMember.userId) {
        await userService.linkTeamMember(teamMember.userId, docRef.id);
      }

      return {
        id: docRef.id,
        ...teamMember,
        createdAt: timestamp,
        updatedAt: timestamp
      } as TeamMember;
    } catch (error) {
      console.error('Error adding team member:', error);
      throw error;
    }
  },

  async updateTeamMember(id: string, teamMember: Partial<TeamMember>) {
    try {
      const teamMemberRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(teamMemberRef, {
        ...teamMember,
        updatedAt: new Date().toISOString()
      });
      return {
        id,
        ...teamMember
      };
    } catch (error) {
      console.error('Error updating team member:', error);
      throw error;
    }
  },

  async deleteTeamMember(id: string) {
    try {
      const teamMemberRef = doc(db, COLLECTION_NAME, id);
      const teamMemberDoc = await getDoc(teamMemberRef);
      const teamMember = teamMemberDoc.data() as TeamMember;

      // If this team member is linked to a user, update the user
      if (teamMember.userId) {
        const userRef = doc(db, 'users', teamMember.userId);
        await updateDoc(userRef, {
          teamMemberId: null
        });
      }

      await deleteDoc(teamMemberRef);
    } catch (error) {
      console.error('Error deleting team member:', error);
      throw error;
    }
  },

  async getTeamMemberByUserId(userId: string): Promise<TeamMember | null> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as TeamMember;
    } catch (error) {
      console.error('Error getting team member by user ID:', error);
      throw error;
    }
  }
};