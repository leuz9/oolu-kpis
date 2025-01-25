import React from 'react';
import { Target } from 'lucide-react';

export default function EmptyObjectiveState() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center justify-center text-gray-500 h-96">
      <Target className="h-12 w-12 text-gray-400 mb-4" />
      <p className="text-lg font-medium mb-2">No objective selected</p>
      <p className="text-sm">Select an objective from the hierarchy to view details</p>
    </div>
  );
}