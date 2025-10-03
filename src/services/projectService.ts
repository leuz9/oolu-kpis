import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { notificationService } from './notificationService';
import type { Project } from '../types';

const COLLECTION_NAME = 'projects';

export const projectService = {
  async getProjects() {
    try {
      const projectsSnapshot = await getDocs(collection(db, COLLECTION_NAME));
      return projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  async addProject(project: Omit<Project, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...project,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      // Notify members
      try {
        const members = (project as any).members as string[] | undefined;
        if (Array.isArray(members)) {
          await Promise.all(members.map(userId => notificationService.createNotification({
            userId,
            title: 'Added to Project',
            message: `You were added to project "${(project as any).name || docRef.id}".`,
            type: 'project',
            priority: 'low',
            link: '/projects'
          } as any)));
        }
      } catch {}
      return {
        id: docRef.id,
        ...project
      } as Project;
    } catch (error) {
      console.error('Error adding project:', error);
      throw error;
    }
  },

  async updateProject(id: string, project: Partial<Project>) {
    try {
      const projectRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(projectRef, {
        ...project,
        updatedAt: new Date().toISOString()
      });
      // Notify members on significant updates
      try {
        const current = (await getDocs(collection(db, COLLECTION_NAME))).docs.find(d => d.id === id)?.data() as any;
        const members = current?.members as string[] | undefined;
        if (Array.isArray(members)) {
          await Promise.all(members.map(userId => notificationService.createNotification({
            userId,
            title: 'Project Updated',
            message: `Project "${current?.name || id}" has new updates.`,
            type: 'project',
            priority: 'low',
            link: '/projects'
          } as any)));
        }
      } catch {}
      return {
        id,
        ...project
      };
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  async deleteProject(id: string) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }
};