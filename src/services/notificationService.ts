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
  serverTimestamp,
  onSnapshot,
  limit,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { db, app } from '../config/firebase';
import { getAuth } from 'firebase/auth';

const COLLECTION_NAME = 'notifications';
let messaging: any;

// Initialize messaging only if supported
isSupported().then(isSupported => {
  if (isSupported) {
    messaging = getMessaging(app);
  }
}).catch(err => {
  console.warn('Firebase messaging not supported:', err);
});

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'objective' | 'team' | 'project' | 'system' | 'message';
  status: 'unread' | 'read';
  priority: 'high' | 'medium' | 'low';
  link?: string;
  createdAt: Timestamp;
  readAt?: Timestamp;
  metadata?: Record<string, any>;
}

// Internal helper functions
const getFCMToken = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
    });
    
    if (!token) {
      console.warn('No FCM token available');
      return null;
    }

    // Save the token to the user's document
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        fcmTokens: token,
        notificationSettings: {
          enabled: true,
          lastUpdated: serverTimestamp()
        }
      });
    }

    // Set up foreground message handler
    setupMessageHandler();

    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

const setupMessageHandler = () => {
  onMessage(messaging, (payload) => {
    if (Notification.permission === 'granted' && payload.notification) {
      const { title, body, icon } = payload.notification;
      new Notification(title || 'New Notification', {
        body,
        icon: icon || '/vite.svg'
      });
    }
  });
};

export const notificationService = {
  // Initialize Firebase Cloud Messaging
  async initializeFCM() {
    try {
      // Check if messaging is supported
      if (!messaging) {
        console.warn('Firebase messaging is not supported in this browser');
        return null;
      }

      // Check if notifications are supported
      if (!('Notification' in window)) {
        console.warn('This browser does not support notifications');
        return null;
      }

      // If permission is already denied, don't ask again
      if (Notification.permission === 'denied') {
        console.warn('Notification permission was previously denied');
        return null;
      }

      // If permission is already granted, proceed with token
      if (Notification.permission === 'granted') {
        return getFCMToken();
      }

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        return getFCMToken();
      } else {
        console.warn('Notification permission not granted:', permission);
        return null;
      }
    } catch (error) {
      console.error('Error initializing FCM:', error);
      return null;
    }
  },

  // Get user's notifications
  async getNotifications(userId: string, limit = 50) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );
      const notificationsSnapshot = await getDocs(q);
      return notificationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      callback(notifications);
    }, (error) => {
      console.error('Error subscribing to notifications:', error);
    });
  },

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'status'>) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...notification,
        status: 'unread',
        createdAt: serverTimestamp()
      });
      return {
        id: docRef.id,
        ...notification,
        status: 'unread'
      } as Notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  async markAsRead(notificationId: string) {
    try {
      const notificationRef = doc(db, COLLECTION_NAME, notificationId);
      await updateDoc(notificationRef, {
        status: 'read',
        readAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  async markAllAsRead(userId: string) {
    try {
      const batch = writeBatch(db);
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        where('status', '==', 'unread')
      );
      const notificationsSnapshot = await getDocs(q);
      
      if (notificationsSnapshot.empty) {
        return; // No unread notifications to update
      }

      notificationsSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          status: 'read',
          readAt: serverTimestamp()
        });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  async deleteNotification(notificationId: string) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  async deleteReadNotifications(userId: string) {
    try {
      const batch = writeBatch(db);
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        where('status', '==', 'read')
      );
      const notificationsSnapshot = await getDocs(q);
      
      notificationsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error deleting read notifications:', error);
      throw error;
    }
  },

  async getUnreadCount(userId: string) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        where('status', '==', 'unread')
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }
};