import React, { useState, useRef } from 'react';
import { Send, Image, FileText, Link, Smile } from 'lucide-react';
import EmojiPicker from './EmojiPicker';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  typingUsers: Set<string>;
}

export default function MessageInput({ onSendMessage, typingUsers }: MessageInputProps) {
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    if (!messageInput.trim()) return;
    await onSendMessage(messageInput);
    setMessageInput('');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="px-6 py-4 border-t">
      {typingUsers.size > 0 && (
        <div className="text-sm text-gray-500 mb-2">
          {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
        </div>
      )}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            rows={1}
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <div className="absolute right-2 bottom-2 flex items-center space-x-2">
            <button className="text-gray-400 hover:text-gray-600">
              <Image className="h-5 w-5" />
            </button>
            <button className="text-gray-400 hover:text-gray-600">
              <FileText className="h-5 w-5" />
            </button>
            <button className="text-gray-400 hover:text-gray-600">
              <Link className="h-5 w-5" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Smile className="h-5 w-5" />
              </button>
              {showEmojiPicker && (
                <EmojiPicker
                  onSelect={(emoji) => {
                    setMessageInput(prev => prev + emoji);
                    inputRef.current?.focus();
                  }}
                  onClose={() => setShowEmojiPicker(false)}
                />
              )}
            </div>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!messageInput.trim()}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
