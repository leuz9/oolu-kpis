import React from 'react';
import { Plus } from 'lucide-react';

interface ObjectiveHeaderProps {
  onAddClick: () => void;
}

export default function ObjectiveHeader({ onAddClick }: ObjectiveHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Objectives</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track and manage company, department, and individual objectives
        </p>
      </div>
      <button
        onClick={onAddClick}
        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
      >
        <Plus className="h-5 w-5 mr-2" />
        New Objective
      </button>
    </div>
  );
}