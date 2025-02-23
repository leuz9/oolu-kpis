import React, { useState } from 'react';
import { Smile } from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import type { Message } from '../../../types';

interface MessageReactionsProps {
  message: Message;
  onReaction: (messageId: string, emoji: string) => Promise<void>;
  currentUserId?: string;
}

export default function MessageReactions({ message, onReaction, currentUserId }: MessageReactionsProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleReaction = async (emoji: string) => {
    try {
      await onReaction(message.id, emoji);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {message.reactions?.map((reaction, index) => (
        <button
          key={`${reaction.emoji}-${index}`}
          onClick={() => handleReaction(reaction.emoji)}
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
            message.sender.id === currentUserId
              ? 'bg-white/10 text-white'
              : 'bg-gray-200 text-gray-800'
          } ${reaction.users.includes(currentUserId || '') ? 'ring-2 ring-primary-500' : ''}`}
        >
          {reaction.emoji} {reaction.count}
        </button>
      ))}
      
      <button
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 hover:bg-gray-200"
      >
        <Smile className="h-3 w-3 mr-1" />
        Add Reaction
      </button>

      {showEmojiPicker && (
        <div className="absolute mt-1">
          <EmojiPicker
            onSelect={handleReaction}
            onClose={() => setShowEmojiPicker(false)}
          />
        </div>
      )}
    </div>
  );
}