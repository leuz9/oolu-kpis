import React from 'react';
import { Code, FileText } from 'lucide-react';
import type { DocTab } from '../types';

interface DocTabsProps {
  activeTab: DocTab;
  onTabChange: (tab: DocTab) => void;
}

export default function DocTabs({ activeTab, onTabChange }: DocTabsProps) {
  return (
    <div className="flex space-x-4 mb-8">
      <button
        onClick={() => onTabChange('functional')}
        className={`px-4 py-2 rounded-lg font-medium ${
          activeTab === 'functional'
            ? 'bg-primary-600 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          User Guide
        </div>
      </button>
      <button
        onClick={() => onTabChange('technical')}
        className={`px-4 py-2 rounded-lg font-medium ${
          activeTab === 'technical'
            ? 'bg-primary-600 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center">
          <Code className="h-5 w-5 mr-2" />
          Technical Guide
        </div>
      </button>
    </div>
  );
}