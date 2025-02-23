import React, { useState, useRef, useEffect } from 'react';
import { Send, Image, FileText, Link, Smile, Paperclip, Mic } from 'lucide-react';
import EmojiPicker from './EmojiPicker';

interface MessageComposerProps {
  onSendMessage: (content: string, attachments?: File[]) => Promise<void>;
  onTyping: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function MessageComposer({ 
  onSendMessage, 
  onTyping,
  disabled = false,
  placeholder = "Type a message..."
}: MessageComposerProps) {
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [messageInput]);

  const handleSubmit = async () => {
    if (!messageInput.trim() && !attachments.length) return;
    
    try {
      await onSendMessage(messageInput, attachments);
      setMessageInput('');
      setAttachments([]);
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const files = items
      .filter(item => item.kind === 'file')
      .map(item => item.getAsFile())
      .filter((file): file is File => file !== null);
    
    if (files.length > 0) {
      setAttachments(prev => [...prev, ...files]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleVoiceRecord = () => {
    // Implement voice recording logic
    setIsRecording(!isRecording);
  };

  return (
    <div className="px-6 py-4 border-t">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((file, index) => (
            <div 
              key={index}
              className="flex items-center bg-gray-100 rounded-lg px-3 py-1"
            >
              <span className="text-sm text-gray-600 truncate max-w-[200px]">
                {file.name}
              </span>
              <button
                onClick={() => removeAttachment(index)}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Remove</span>
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={messageInput}
            onChange={(e) => {
              setMessageInput(e.target.value);
              onTyping();
            }}
            onKeyDown={handleKeyPress}
            onPaste={handlePaste}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none min-h-[44px] max-h-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ paddingRight: '120px' }} // Space for action buttons
          />
          
          <div className="absolute right-2 bottom-2 flex items-center space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200"
              title="Attach files"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200"
              title="Add emoji"
            >
              <Smile className="h-5 w-5" />
            </button>
            <button
              onClick={handleVoiceRecord}
              className={`p-1.5 rounded-full hover:bg-gray-200 ${
                isRecording ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'
              }`}
              title={isRecording ? 'Stop recording' : 'Start voice recording'}
            >
              <Mic className="h-5 w-5" />
            </button>
          </div>

          {showEmojiPicker && (
            <div className="absolute bottom-full mb-2 right-0">
              <EmojiPicker
                onSelect={(emoji) => {
                  setMessageInput(prev => prev + emoji);
                  setShowEmojiPicker(false);
                  inputRef.current?.focus();
                }}
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={disabled || (!messageInput.trim() && !attachments.length)}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}