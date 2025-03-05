import React from 'react';
import { Pencil, Archive, RefreshCw, Trash2 } from 'lucide-react';

interface ActionsProps {
  onEdit: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onUpdate: () => void;
  updating: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export default function Actions({ 
  onEdit, 
  onArchive, 
  onDelete,
  onUpdate, 
  updating, 
  isAdmin,
  isSuperAdmin
}: ActionsProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={onEdit}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
        >
          <Pencil className="h-4 w-4 mr-2" />
          Edit Objective
        </button>
        <button
          onClick={onUpdate}
          disabled={updating}
          className={`px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center ${
            updating ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${updating ? 'animate-spin' : ''}`} />
          Update Progress
        </button>
      </div>
      <div className="flex items-center space-x-3">
        {isAdmin && onArchive && (
          <button
            onClick={onArchive}
            className="px-4 py-2 bg-yellow-50 border border-yellow-300 rounded-md text-sm font-medium text-yellow-700 hover:bg-yellow-100 flex items-center"
          >
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </button>
        )}
        {isSuperAdmin && onDelete && (
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-50 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-100 flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
        )}
      </div>
    </div>
  );
}