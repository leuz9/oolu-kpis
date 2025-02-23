import React from 'react';
import { LayoutGrid, List } from 'lucide-react';

interface ViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex rounded-md shadow-sm">
      <button
        onClick={() => onViewChange('grid')}
        className={`p-2 ${
          view === 'grid'
            ? 'bg-primary-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        } border border-gray-300 rounded-l-md`}
        title="Grid View"
      >
        <LayoutGrid className="h-5 w-5" />
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`p-2 ${
          view === 'list'
            ? 'bg-primary-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        } border border-l-0 border-gray-300 rounded-r-md`}
        title="List View"
      >
        <List className="h-5 w-5" />
      </button>
    </div>
  );
}