import React, { useState } from 'react';
import { Search, X, ArrowUp, ArrowDown } from 'lucide-react';
import type { Message } from '../../../types';

interface MessageSearchProps {
  messages: Message[];
  onClose: () => void;
  onMessageSelect: (messageId: string) => void;
}

export default function MessageSearch({ messages, onClose, onMessageSelect }: MessageSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentResult, setCurrentResult] = useState(0);

  const searchResults = messages.filter(message =>
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNext = () => {
    setCurrentResult(prev => 
      prev < searchResults.length - 1 ? prev + 1 : 0
    );
  };

  const handlePrevious = () => {
    setCurrentResult(prev => 
      prev > 0 ? prev - 1 : searchResults.length - 1
    );
  };

  return (
    <div className="absolute top-0 right-0 w-96 bg-white border-l border-gray-200 h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Search Messages</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentResult(0);
            }}
            placeholder="Search in conversation..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        {searchTerm && (
          <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
            <span>
              {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevious}
                disabled={searchResults.length === 0}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <span>
                {searchResults.length > 0 ? currentResult + 1 : 0} of {searchResults.length}
              </span>
              <button
                onClick={handleNext}
                disabled={searchResults.length === 0}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-y-auto h-[calc(100%-6rem)]">
        {searchResults.map((message, index) => (
          <button
            key={message.id}
            onClick={() => onMessageSelect(message.id)}
            className={`w-full p-4 text-left hover:bg-gray-50 ${
              index === currentResult ? 'bg-primary-50' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">
                {message.sender.name}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(message.timestamp).toLocaleString()}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              {message.content}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}