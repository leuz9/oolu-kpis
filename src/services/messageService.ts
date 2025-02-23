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
  onSnapshot,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
  increment,
  getDoc,
  setDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getAuth } from 'firebase/auth';
import type { Message, Channel } from '../types';

const MESSAGES_COLLECTION = 'messages';
const CHANNELS_COLLECTION = 'channels';
const TYPING_COLLECTION = 'typing';

export const messageService = {
  // Channels
  async getChannels() {
    try {
      const auth = getAuth();
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      const channelsSnapshot = await getDocs(collection(db, CHANNELS_COLLECTION));
      return channelsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Channel[];
    } catch (error) {
      console.error('Error fetching channels:', error);
      throw error;
    }
  },

  subscribeToChannels(callback: (channels: Channel[]) => void) {
    const auth = getAuth();
    if (!auth.currentUser) {
      console.error('User not authenticated');
      return () => {};
    }

    const userId = auth.currentUser.uid;
    const q = query(
      collection(db, CHANNELS_COLLECTION),
      where('members', 'array-contains', userId)
    );

    return onSnapshot(q, 
      (snapshot) => {
        const channels = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Channel[];
        callback(channels);
      },
      (error) => {
        console.error('Error in channels subscription:', error);
        // Retry subscription after a delay if it's a temporary error
        if (error.code === 'unavailable') {
          setTimeout(() => this.subscribeToChannels(callback), 5000);
        }
      }
    );
  },

  async createChannel(channel: Omit<Channel, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, CHANNELS_COLLECTION), {
        ...channel,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return {
        id: docRef.id,
        ...channel
      } as Channel;
    } catch (error) {
      console.error('Error creating channel:', error);
      throw error;
    }
  },

  async updateChannel(channelId: string, data: Partial<Channel>) {
    try {
      const channelRef = doc(db, CHANNELS_COLLECTION, channelId);
      await updateDoc(channelRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating channel:', error);
      throw error;
    }
  },

  // Messages
  async getMessages(channelId: string) {
    try {
      const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('channelId', '==', channelId),
        orderBy('timestamp', 'asc')
      );
      const messagesSnapshot = await getDocs(q);
      return messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  subscribeToMessages(channelId: string, callback: (messages: Message[]) => void) {
    const auth = getAuth();
    if (!auth.currentUser) {
      console.error('User not authenticated');
      return () => {};
    }

    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('channelId', '==', channelId),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(q,
      (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Message[];
        callback(messages);
      },
      (error) => {
        console.error('Error in messages subscription:', error);
        // Retry subscription after a delay if it's a temporary error
        if (error.code === 'unavailable') {
          setTimeout(() => this.subscribeToMessages(channelId, callback), 5000);
        }
      }
    );
  },

  async sendMessage(channelId: string, message: Omit<Message, 'id' | 'timestamp' | 'status'>) {
    try {
      const batch = writeBatch(db);

      // Create message document
      const messageRef = doc(collection(db, MESSAGES_COLLECTION));
      batch.set(messageRef, {
        ...message,
        channelId,
        timestamp: serverTimestamp(),
        status: 'sent'
      });

      // Update channel's last message and activity
      const channelRef = doc(db, CHANNELS_COLLECTION, channelId);
      batch.update(channelRef, {
        lastMessage: {
          content: message.content,
          timestamp: serverTimestamp(),
          sender: message.sender.name
        },
        lastActivity: serverTimestamp(),
        messageCount: increment(1)
      });

      await batch.commit();

      return {
        id: messageRef.id,
        ...message,
        timestamp: new Date().toISOString(),
        status: 'sent'
      } as Message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async updateMessage(messageId: string, data: Partial<Message>) {
    try {
      const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
      await updateDoc(messageRef, {
        ...data,
        isEdited: true,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  },

  async deleteMessage(messageId: string) {
    try {
      const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
      const messageDoc = await getDoc(messageRef);
      if (!messageDoc.exists()) {
        throw new Error('Message not found');
      }

      const message = messageDoc.data() as Message;
      const batch = writeBatch(db);

      // Delete message
      batch.delete(messageRef);

      // Update channel message count
      const channelRef = doc(db, CHANNELS_COLLECTION, message.channelId);
      batch.update(channelRef, {
        messageCount: increment(-1),
        lastActivity: serverTimestamp()
      });

      await batch.commit();
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },

  async addReaction(messageId: string, emoji: string, userId: string) {
    try {
      const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (!messageDoc.exists()) {
        throw new Error('Message not found');
      }

      const message = messageDoc.data() as Message;
      let reactions = message.reactions || [];
      const existingReaction = reactions.find(r => r.emoji === emoji);

      if (existingReaction) {
        if (existingReaction.users.includes(userId)) {
          // Remove user's reaction
          existingReaction.users = existingReaction.users.filter(id => id !== userId);
          existingReaction.count--;
          if (existingReaction.count === 0) {
            reactions = reactions.filter(r => r.emoji !== emoji);
          }
        } else {
          // Add user's reaction
          existingReaction.users.push(userId);
          existingReaction.count++;
        }
      } else {
        // Create new reaction
        reactions.push({
          emoji,
          count: 1,
          users: [userId]
        });
      }

      await updateDoc(messageRef, { reactions });
    } catch (error) {
      console.error('Error updating reaction:', error);
      throw error;
    }
  },

  async markMessageAsRead(messageId: string) {
    try {
      const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
      await updateDoc(messageRef, {
        status: 'read',
        readAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  },

  async updateTypingStatus(channelId: string, userId: string, isTyping: boolean) {
    try {
      const typingRef = doc(db, TYPING_COLLECTION, `${channelId}_${userId}`);
      
      if (isTyping) {
        await setDoc(typingRef, {
          channelId,
          userId,
          timestamp: serverTimestamp()
        }, { merge: true });
      } else {
        await deleteDoc(typingRef);
      }
    } catch (error) {
      console.error('Error updating typing status:', error);
      throw error;
    }
  },

  subscribeToTypingStatus(channelId: string, callback: (typingUsers: string[]) => void) {
    const auth = getAuth();
    if (!auth.currentUser) {
      console.error('User not authenticated');
      return () => {};
    }

    const q = query(
      collection(db, TYPING_COLLECTION),
      where('channelId', '==', channelId)
    );

    return onSnapshot(q,
      (snapshot) => {
        const now = Date.now();
        const typingUsers = snapshot.docs
          .filter(doc => {
            const data = doc.data();
            return data.timestamp && (now - data.timestamp.toMillis()) < 5000;
          })
          .map(doc => doc.data().userId);
        
        callback(typingUsers);
      },
      (error) => {
        console.error('Error in typing status subscription:', error);
        // Retry subscription after a delay if it's a temporary error
        if (error.code === 'unavailable') {
          setTimeout(() => this.subscribeToTypingStatus(channelId, callback), 5000);
        }
      }
    );
  },

  async addChannelMember(channelId: string, userId: string) {
    try {
      const channelRef = doc(db, CHANNELS_COLLECTION, channelId);
      await updateDoc(channelRef, {
        members: arrayUnion(userId),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding channel member:', error);
      throw error;
    }
  },

  async removeChannelMember(channelId: string, userId: string) {
    try {
      const channelRef = doc(db, CHANNELS_COLLECTION, channelId);
      await updateDoc(channelRef, {
        members: arrayRemove(userId),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error removing channel member:', error);
      throw error;
    }
  },

  async updateChannelSettings(channelId: string, settings: Partial<Channel>) {
    try {
      const channelRef = doc(db, CHANNELS_COLLECTION, channelId);
      await updateDoc(channelRef, {
        ...settings,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating channel settings:', error);
      throw error;
    }
  }
};