import React from 'react';
import { Target } from 'lucide-react';
import type { Objective } from '../../../../types';

interface ParentObjectiveSelectProps {
  objectives: Objective[];
  selectedObjectiveId?: string;
  level: string;
  onChange: (objectiveId: string) => void;
  loading?: boolean;
  error?: string | null;
}

export default function ParentObjectiveSelect({
  objectives,
  selectedObjectiveId,
  level,
  onChange,
  loading = false,
  error = null
}: ParentObjectiveSelectProps) {
  // Filter objectives based on level
  const availableParents = objectives.filter(obj => {
    if (level === 'department') return obj.level === 'company';
    if (level === 'individual') return obj.level === 'department';
    return false;
  });

  if (level === 'company') return null;

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
      <label className="block text-sm font-medium text-gray-700">
        Parent Objective
        <span className="text-red-500 ml-1">*</span>
      </label>
      <div className="mt-1 relative">
        <select
          value={selectedObjectiveId || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`block w-full rounded-md shadow-sm pl-10 ${
            error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
          }`}
          required
        >
          <option value="">Select a parent objective</option>
          {availableParents.map((objective) => (
            <option key={objective.id} value={objective.id}>
              {objective.title}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Target className="h-4 w-4 text-gray-400" />
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      <p className="mt-1 text-xs text-gray-500">
        {level === 'department' 
          ? 'Select the company objective this department objective contributes to'
          : 'Select the department objective this individual objective contributes to'
        }
      </p>
    </div>
  );
}