import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
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