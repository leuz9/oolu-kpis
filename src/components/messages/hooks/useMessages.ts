import { useState, useEffect } from 'react';
import { messageService } from '../../../services/messageService';
import type { Message, Channel } from '../../../types';

export function useMessages(channel: Channel | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!channel) return;

    const unsubscribe = messageService.subscribeToMessages(
      channel.id,
      (updatedMessages) => {
        setMessages(updatedMessages);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [channel?.id]);

  const sendMessage = async (content: string) => {
    if (!channel) return;
    try {
      await messageService.sendMessage(channel.id, {
        content,
        sender: {
          id: 'user-id', // Replace with actual user ID
          name: 'User Name', // Replace with actual user name
          avatar: undefined
        }
      });
    } catch (error) {
      setError('Failed to send message');
      throw error;
    }
  };

  const editMessage = async (messageId: string, content: string) => {
    try {
      await messageService.updateMessage(messageId, { content });
    } catch (error) {
      setError('Failed to edit message');
      throw error;
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      await messageService.deleteMessage(messageId);
    } catch (error) {
      setError('Failed to delete message');
      throw error;
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    try {
      await messageService.addReaction(messageId, emoji, 'user-id'); // Replace with actual user ID
    } catch (error) {
      setError('Failed to add reaction');
      throw error;
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction
  };
}
