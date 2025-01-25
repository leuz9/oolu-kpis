import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface DocFeedbackProps {
  docId: string;
  onFeedback: (docId: string, helpful: boolean) => void;
  isHelpful: boolean;
  isUnhelpful: boolean;
}

export default function DocFeedback({ docId, onFeedback, isHelpful, isUnhelpful }: DocFeedbackProps) {
  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h4 className="text-sm font-medium text-gray-900 mb-4">Was this documentation helpful?</h4>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => onFeedback(docId, true)}
          className={`flex items-center px-4 py-2 rounded-md text-sm ${
            isHelpful
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <ThumbsUp className="h-4 w-4 mr-2" />
          Yes
        </button>
        <button
          onClick={() => onFeedback(docId, false)}
          className={`flex items-center px-4 py-2 rounded-md text-sm ${
            isUnhelpful
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <ThumbsDown className="h-4 w-4 mr-2" />
          No
        </button>
      </div>
    </div>
  );
}