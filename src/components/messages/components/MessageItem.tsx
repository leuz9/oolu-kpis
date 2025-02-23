import React from 'react';
import { Edit2, Trash2, Smile } from 'lucide-react';
import type { Message } from '../../../types';

interface MessageItemProps {
  message: Message;
  isConsecutive: boolean;
  onEdit: (message: Message) => void;
  onDelete: (messageId: string) => Promise<void>;
  onReaction: (messageId: string, emoji: string) => Promise<void>;
  isCurrentUser: boolean;
}

export default function MessageItem({
  message,
  isConsecutive,
  onEdit,
  onDelete,
  onReaction,
  isCurrentUser
}: MessageItemProps) {
  return (
    <div
      className={`mb-4 flex ${
        isCurrentUser ? 'justify-end' : 'justify-start'
      } ${isConsecutive ? 'mt-1' : 'mt-4'}`}
    >
      {!isConsecutive && !isCurrentUser && (
        <div className="flex-shrink-0 mr-4">
          {message.sender.avatar ? (
            <img
              src={message.sender.avatar}
              alt={message.sender.name}
              className="h-10 w-10 rounded-full"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 font-medium">
                {message.sender.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
      )}
      <div className={`max-w-[70%] ${isConsecutive ? 'ml-14' : ''}`}>
        {!isConsecutive && (
          <div className="flex items-center mb-1">
            <span className="font-medium text-sm text-gray-900">
              {message.sender.name}
            </span>
            <span className="ml-2 text-xs text-gray-500">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
            {message.isEdited && (
              <span className="ml-2 text-xs text-gray-400">(edited)</span>
            )}
          </div>
        )}
        <div
          className={`relative group ${
            isCurrentUser
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100'
          } rounded-lg p-3`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
          
          {/* Message Actions */}
          <div className={`absolute ${
            isCurrentUser ? 'left-0' : 'right-0'
          } -top-8 hidden group-hover:flex items-center space-x-2 bg-white rounded-lg shadow-lg px-2 py-1`}>
            <button
              onClick={() => onReaction(message.id, '👍')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Smile className="h-4 w-4 text-gray-500" />
            </button>
            {isCurrentUser && (
              <>
                <button
                  onClick={() => onEdit(message)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Edit2 className="h-4 w-4 text-gray-500" />
                </button>
                <button
                  onClick={() => onDelete(message.id)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Trash2 className="h-4 w-4 text-gray-500" />
                </button>
              </>
            )}
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {message.reactions.map((reaction, index) => (
                <button
                  key={index}
                  onClick={() => onReaction(message.id, reaction.emoji)}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    isCurrentUser
                      ? 'bg-white/10 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {reaction.emoji} {reaction.count}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
