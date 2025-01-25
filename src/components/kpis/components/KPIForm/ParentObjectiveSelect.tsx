import React from 'react';
import { Target } from 'lucide-react';
import type { Objective } from '../../../../types';

interface ParentObjectiveSelectProps {
  objectives: Objective[];
  selectedObjectiveId?: string;
  onChange: (objectiveId: string) => void;
  loading?: boolean;
}

export default function ParentObjectiveSelect({
  objectives,
  selectedObjectiveId,
  onChange,
  loading = false
}: ParentObjectiveSelectProps) {
  if (loading) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700">Parent Objective</label>
        <div className="mt-1 flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2" />
          <span className="text-sm text-gray-500">Loading objectives...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Parent Objective</label>
      <div className="mt-1 relative">
        <select
          value={selectedObjectiveId || ''}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 pl-10"
        >
          <option value="">No parent objective</option>
          {objectives.map((objective) => (
            <option key={objective.id} value={objective.id}>
              {objective.title}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Target className="h-4 w-4 text-gray-400" />
        </div>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Optionally link this KPI to a parent objective for better tracking
      </p>
    </div>
  );
}