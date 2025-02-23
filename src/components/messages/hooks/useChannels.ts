import { useState, useEffect } from 'react';
import { messageService } from '../../../services/messageService';
import type { Channel } from '../../../types';

export function useChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = messageService.subscribeToChannels((updatedChannels) => {
      setChannels(updatedChannels);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const createChannel = async (channelData: Partial<Channel>) => {
    try {
      return await messageService.createChannel(channelData as Channel);
    } catch (error) {
      setError('Failed to create channel');
      throw error;
    }
  };

  return {
    channels,
    loading,
    error,
    createChannel
  };
}
