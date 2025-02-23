import React from 'react';
import { LayoutGrid, List, Columns } from 'lucide-react';

interface ViewToggleProps {
  view: 'hierarchy' | 'grid' | 'kanban';
  setView: (view: 'hierarchy' | 'grid' | 'kanban') => void;
}

export default function ViewToggle({ view, setView }: ViewToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setView('hierarchy')}
        className={`p-2 rounded-md ${view === 'hierarchy' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-500'}`}
        title="Hierarchy View"
      >
        <List className="h-5 w-5" />
      </button>
      <button
        onClick={() => setView('grid')}
        className={`p-2 rounded-md ${view === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-500'}`}
        title="Grid View"
      >
        <LayoutGrid className="h-5 w-5" />
      </button>
      <button
        onClick={() => setView('kanban')}
        className={`p-2 rounded-md ${view === 'kanban' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-500'}`}
        title="Kanban View"
      >
        <Columns className="h-5 w-5" />
      </button>
    </div>
  );
}