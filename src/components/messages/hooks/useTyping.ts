import { useState, useEffect } from 'react';
import { messageService } from '../../../services/messageService';
import type { Channel } from '../../../types';

export function useTyping(channel: Channel | null) {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!channel) return;

    const unsubscribe = messageService.subscribeToTypingStatus(
      channel.id,
      (users) => {
        setTypingUsers(new Set(users));
      }
    );

    return () => {
      unsubscribe();
    };
  }, [channel?.id]);

  const updateTypingStatus = async (userId: string, isTyping: boolean) => {
    if (!channel) return;
    try {
      await messageService.updateTypingStatus(channel.id, userId, isTyping);
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  };

  return {
    typingUsers,
    isTyping,
    setIsTyping,
    updateTypingStatus
  };
}
