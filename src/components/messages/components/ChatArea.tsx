import React from 'react';
import { Lock, Star, Users, Settings, Info } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import type { Channel, Message } from '../../../types';

interface ChatAreaProps {
  channel: Channel;
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  onEditMessage: (message: Message) => void;
  onDeleteMessage: (messageId: string) => Promise<void>;
  onReaction: (messageId: string, emoji: string) => Promise<void>;
  onToggleInfo: () => void;
  typingUsers: Set<string>;
  currentUserId?: string;
}

export default function ChatArea({
  channel,
  messages,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onReaction,
  onToggleInfo,
  typingUsers,
  currentUserId
}: ChatAreaProps) {
  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Channel Header */}
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-gray-900">{channel.name}</h2>
          {channel.type === 'private' && (
            <Lock className="ml-2 h-4 w-4 text-gray-400" />
          )}
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleInfo}
            className="text-gray-400 hover:text-gray-600"
          >
            <Info className="h-5 w-5" />
          </button>
          <button className="text-gray-400 hover:text-gray-600">
            <Star className="h-5 w-5" />
          </button>
          <button className="text-gray-400 hover:text-gray-600">
            <Users className="h-5 w-5" />
          </button>
          <button className="text-gray-400 hover:text-gray-600">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      <MessageList
        messages={messages}
        onEditMessage={onEditMessage}
        onDeleteMessage={onDeleteMessage}
        onReaction={onReaction}
        currentUserId={currentUserId}
      />

      <MessageInput
        onSendMessage={onSendMessage}
        typingUsers={typingUsers}
      />
    </div>
  );
}