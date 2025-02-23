import React from 'react';
import { UserCog } from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  onActivate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
}

export default function BulkActions({
  selectedCount,
  onActivate,
  onDeactivate,
  onDelete,
  onClearSelection
}: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-primary-50 rounded-lg p-4 mb-6 flex items-center justify-between">
      <div className="flex items-center">
        <UserCog className="h-5 w-5 text-primary-600 mr-2" />
        <span className="text-sm font-medium text-primary-900">
          {selectedCount} users selected
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={onActivate}
          className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
        >
          Activate
        </button>
        <button
          onClick={onDeactivate}
          className="px-3 py-1.5 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-md hover:bg-yellow-200"
        >
          Deactivate
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
        >
          Delete
        </button>
        <button
          onClick={onClearSelection}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Clear Selection
        </button>
      </div>
    </div>
  );
}