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
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Message, Channel } from '../types';

const MESSAGES_COLLECTION = 'messages';
const CHANNELS_COLLECTION = 'channels';

export const messageService = {
  // Channels
  async getChannels() {
    try {
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
    return onSnapshot(collection(db, CHANNELS_COLLECTION), (snapshot) => {
      const channels = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Channel[];
      callback(channels);
    });
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
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('channelId', '==', channelId),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      callback(messages);
    });
  },

  async sendMessage(channelId: string, message: Omit<Message, 'id' | 'timestamp' | 'status'>) {
    try {
      const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), {
        ...message,
        channelId,
        timestamp: serverTimestamp(),
        status: 'sent'
      });

      // Update channel's last message
      await this.updateChannel(channelId, {
        lastMessage: {
          content: message.content,
          timestamp: Timestamp.now().toDate().toISOString(),
          sender: message.sender.name
        }
      });

      return {
        id: docRef.id,
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
      await deleteDoc(doc(db, MESSAGES_COLLECTION, messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },

  async addReaction(messageId: string, emoji: string, userId: string) {
    try {
      const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
      const message = (await getDocs(messageRef)).data() as Message;
      
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
  }
};