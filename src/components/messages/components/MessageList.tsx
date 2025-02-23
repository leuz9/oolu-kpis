import React, { useRef, useEffect } from 'react';
import MessageItem from './MessageItem';
import type { Message } from '../../../types';

interface MessageListProps {
  messages: Message[];
  onEditMessage: (message: Message) => void;
  onDeleteMessage: (messageId: string) => Promise<void>;
  onReaction: (messageId: string, emoji: string) => Promise<void>;
  currentUserId?: string;
}

export default function MessageList({
  messages,
  onEditMessage,
  onDeleteMessage,
  onReaction,
  currentUserId
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {messages.map((message, index) => {
        const isFirstMessageOfDay = index === 0 || 
          new Date(message.timestamp).toDateString() !== 
          new Date(messages[index - 1].timestamp).toDateString();

        const isConsecutive = index > 0 && 
          message.sender.id === messages[index - 1].sender.id &&
          new Date(message.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime() < 300000;

        return (
          <React.Fragment key={message.id}>
            {isFirstMessageOfDay && (
              <div className="flex items-center justify-center my-4">
                <div className="bg-gray-100 px-3 py-1 rounded-full">
                  <span className="text-sm text-gray-500">
                    {new Date(message.timestamp).toLocaleDateString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            )}
            <MessageItem
              message={message}
              isConsecutive={isConsecutive}
              onEdit={onEditMessage}
              onDelete={onDeleteMessage}
              onReaction={onReaction}
              isCurrentUser={message.sender.id === currentUserId}
            />
          </React.Fragment>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
