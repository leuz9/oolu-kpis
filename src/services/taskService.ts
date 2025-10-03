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
import { notificationService } from './notificationService';
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

      // Notify assignee if different from creator
      try {
        if (task.assignee && task.assignee !== user.uid) {
          await notificationService.createNotification({
            userId: task.assignee,
            title: 'New Task Assigned',
            message: `${task.title || 'A task'} has been assigned to you.`,
            type: 'project',
            priority: 'medium',
            link: '/tasks'
          } as any);
        }
      } catch {}

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
      // Notifications for state changes
      try {
        const assignee = (task as any).assignee as string | undefined;
        const status = (task as any).status as string | undefined;
        if (assignee) {
          await notificationService.createNotification({
            userId: assignee,
            title: 'Task Updated',
            message: `A task assigned to you has been updated${status ? ` (status: ${status})` : ''}.`,
            type: 'project',
            priority: 'low',
            link: '/tasks'
          } as any);
        }
      } catch {}
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

      // Notify assignee
      try {
        const current = (await getDoc(taskRef)).data() as any;
        const assignee = current?.assignee as string | undefined;
        const title = current?.title || 'Task';
        if (assignee && assignee !== user.uid) {
          await notificationService.createNotification({
            userId: assignee,
            title: 'New Task Comment',
            message: `New comment on "${title}".`,
            type: 'project',
            priority: 'low',
            link: '/tasks'
          } as any);
        }
      } catch {}

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
        subtasks: arrayUnion({ id: subtaskId, completed }),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating subtask:', error);
      throw error;
    }
  }
};