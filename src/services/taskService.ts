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
import type { Task } from '../types';

const COLLECTION_NAME = 'tasks';

export const taskService = {
  async getTasks() {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
      const tasksSnapshot = await getDocs(q);
      return tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  async getTasksByProject(projectId: string) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );
      const tasksSnapshot = await getDocs(q);
      return tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
    } catch (error) {
      console.error('Error fetching project tasks:', error);
      throw error;
    }
  },

  async getTasksByAssignee(userId: string) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('assignee', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const tasksSnapshot = await getDocs(q);
      return tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      throw error;
    }
  },

  async addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const timestamp = new Date().toISOString();
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...task,
        createdBy: user.uid,
        createdAt: timestamp,
        updatedAt: timestamp
      });

      return {
        id: docRef.id,
        ...task,
        createdBy: user.uid,
        createdAt: timestamp,
        updatedAt: timestamp
      } as Task;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  },

  async updateTask(id: string, task: Partial<Task>) {
    try {
      const taskRef = doc(db, COLLECTION_NAME, id);
      const timestamp = new Date().toISOString();
      await updateDoc(taskRef, {
        ...task,
        updatedAt: timestamp
      });
      return {
        id,
        ...task,
        updatedAt: timestamp
      };
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  async deleteTask(id: string) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  async addComment(taskId: string, content: string) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const taskRef = doc(db, COLLECTION_NAME, taskId);
      const comment = {
        id: Date.now().toString(),
        content,
        userId: user.uid,
        createdAt: new Date().toISOString()
      };

      await updateDoc(taskRef, {
        comments: arrayUnion(comment),
        updatedAt: new Date().toISOString()
      });

      return comment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  async updateSubtask(taskId: string, subtaskId: string, completed: boolean) {
    try {
      const taskRef = doc(db, COLLECTION_NAME, taskId);
      await updateDoc(taskRef, {
        'subtasks': arrayRemove({ id: subtaskId, completed: !completed }),
        'subtasks': arrayUnion({ id: subtaskId, completed }),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating subtask:', error);
      throw error;
    }
  }
};