import React from 'react';
import { CheckSquare, Plus } from 'lucide-react';

interface TaskEmptyStateProps {
  onCreateTask: () => void;
}

export default function TaskEmptyState({ onCreateTask }: TaskEmptyStateProps) {
  return (
    <div className="text-center py-16 bg-white rounded-xl shadow-md">
      <div className="max-w-md mx-auto">
        <div className="p-4 bg-primary-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <CheckSquare className="h-10 w-10 text-primary-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks found</h3>
        <p className="text-gray-600 mb-6">Try adjusting your filters or create a new task</p>
        <button
          onClick={onCreateTask}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          <Plus className="h-5 w-5" />
          Create New Task
        </button>
      </div>
    </div>
  );
}
