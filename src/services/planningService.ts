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
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getAuth } from 'firebase/auth';
import type { Event, Resource, EventReport } from '../types';

const EVENTS_COLLECTION = 'events';
const RESOURCES_COLLECTION = 'resources';
const EVENT_REPORTS_COLLECTION = 'event_reports';

export const planningService = {
  // Existing methods...
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

  // New methods for event reports
  async createEventReport(eventId: string, report: Omit<EventReport, 'id' | 'eventId' | 'createdBy' | 'createdAt' | 'updatedAt'>) {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Check if event exists
      const eventRef = doc(db, EVENTS_COLLECTION, eventId);
      const eventDoc = await getDoc(eventRef);
      if (!eventDoc.exists()) {
        throw new Error('Event not found');
      }

      const timestamp = new Date().toISOString();
      const reportData = {
        ...report,
        eventId,
        createdBy: user.uid,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      // Create report document
      const reportRef = await addDoc(collection(db, EVENT_REPORTS_COLLECTION), reportData);
      
      // Update event with report reference
      await updateDoc(eventRef, {
        report: {
          id: reportRef.id,
          ...reportData
        },
        status: 'completed',
        updatedAt: Timestamp.now()
      });

      return {
        id: reportRef.id,
        ...reportData
      } as EventReport;
    } catch (error) {
      console.error('Error creating event report:', error);
      throw error;
    }
  },

  async updateEventReport(reportId: string, report: Partial<EventReport>) {
    try {
      const reportRef = doc(db, EVENT_REPORTS_COLLECTION, reportId);
      const timestamp = new Date().toISOString();
      
      await updateDoc(reportRef, {
        ...report,
        updatedAt: timestamp
      });

      // If event ID is available, update the event's report copy
      if (report.eventId) {
        const eventRef = doc(db, EVENTS_COLLECTION, report.eventId);
        await updateDoc(eventRef, {
          'report': {
            id: reportId,
            ...report,
            updatedAt: timestamp
          },
          updatedAt: Timestamp.now()
        });
      }

      return {
        id: reportId,
        ...report,
        updatedAt: timestamp
      };
    } catch (error) {
      console.error('Error updating event report:', error);
      throw error;
    }
  },

  async getEventReport(eventId: string) {
    try {
      const q = query(
        collection(db, EVENT_REPORTS_COLLECTION),
        where('eventId', '==', eventId),
        limit(1)
      );
      const reportSnapshot = await getDocs(q);
      
      if (reportSnapshot.empty) {
        return null;
      }

      const reportDoc = reportSnapshot.docs[0];
      return {
        id: reportDoc.id,
        ...reportDoc.data()
      } as EventReport;
    } catch (error) {
      console.error('Error fetching event report:', error);
      throw error;
    }
  },

  async deleteEventReport(reportId: string, eventId: string) {
    try {
      // Delete report document
      await deleteDoc(doc(db, EVENT_REPORTS_COLLECTION, reportId));
      
      // Remove report reference from event
      const eventRef = doc(db, EVENTS_COLLECTION, eventId);
      await updateDoc(eventRef, {
        report: null,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error deleting event report:', error);
      throw error;
    }
  },

  // Existing resource methods...
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
  }
};