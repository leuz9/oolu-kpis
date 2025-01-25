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
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getAuth } from 'firebase/auth';
import type { Event, Resource } from '../types';

const EVENTS_COLLECTION = 'events';
const RESOURCES_COLLECTION = 'resources';

export const planningService = {
  // Events
  async getEvents() {
    try {
      const eventsSnapshot = await getDocs(collection(db, EVENTS_COLLECTION));
      return eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  async addEvent(event: Omit<Event, 'id'>) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const docRef = await addDoc(collection(db, EVENTS_COLLECTION), {
        ...event,
        owner: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return {
        id: docRef.id,
        ...event,
        owner: user.uid
      } as Event;
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  },

  async updateEvent(id: string, event: Partial<Event>) {
    try {
      const eventRef = doc(db, EVENTS_COLLECTION, id);
      await updateDoc(eventRef, {
        ...event,
        updatedAt: Timestamp.now()
      });
      return {
        id,
        ...event
      };
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  async deleteEvent(id: string) {
    try {
      await deleteDoc(doc(db, EVENTS_COLLECTION, id));
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  },

  async getEventsByDateRange(start: string, end: string) {
    try {
      const q = query(
        collection(db, EVENTS_COLLECTION),
        where('start', '>=', start),
        where('start', '<=', end),
        orderBy('start', 'asc')
      );
      const eventsSnapshot = await getDocs(q);
      return eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];
    } catch (error) {
      console.error('Error fetching events by date range:', error);
      throw error;
    }
  },

  // Resources
  async getResources() {
    try {
      const resourcesSnapshot = await getDocs(collection(db, RESOURCES_COLLECTION));
      return resourcesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Resource[];
    } catch (error) {
      console.error('Error fetching resources:', error);
      throw error;
    }
  },

  async addResource(resource: Omit<Resource, 'id'>) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const docRef = await addDoc(collection(db, RESOURCES_COLLECTION), {
        ...resource,
        owner: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return {
        id: docRef.id,
        ...resource,
        owner: user.uid
      } as Resource;
    } catch (error) {
      console.error('Error adding resource:', error);
      throw error;
    }
  },

  async updateResource(id: string, resource: Partial<Resource>) {
    try {
      const resourceRef = doc(db, RESOURCES_COLLECTION, id);
      await updateDoc(resourceRef, {
        ...resource,
        updatedAt: Timestamp.now()
      });
      return {
        id,
        ...resource
      };
    } catch (error) {
      console.error('Error updating resource:', error);
      throw error;
    }
  },

  async deleteResource(id: string) {
    try {
      await deleteDoc(doc(db, RESOURCES_COLLECTION, id));
    } catch (error) {
      console.error('Error deleting resource:', error);
      throw error;
    }
  },

  async getResourceAvailability(resourceId: string, start: string, end: string) {
    try {
      const resourceRef = doc(db, RESOURCES_COLLECTION, resourceId);
      const q = query(
        collection(db, EVENTS_COLLECTION),
        where('resources', 'array-contains', resourceId),
        where('start', '>=', start),
        where('start', '<=', end)
      );
      const eventsSnapshot = await getDocs(q);
      return eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];
    } catch (error) {
      console.error('Error fetching resource availability:', error);
      throw error;
    }
  }
};