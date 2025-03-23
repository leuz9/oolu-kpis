import React from 'react';
import { Target } from 'lucide-react';

interface ObjectiveProgress {
  company: {
    completed: number;
    total: number;
  };
  department: {
    completed: number;
    total: number;
  };
  individual: {
    completed: number;
    total: number;
  };
}

interface ObjectiveProgressProps {
  progress: ObjectiveProgress;
}

export default function ObjectiveProgress({ progress }: ObjectiveProgressProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Objective Progress</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="h-5 w-5 text-primary-600" />
              <span className="ml-2 text-sm text-gray-500">Company</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {progress.company.completed}/{progress.company.total}
            </span>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="h-5 w-5 text-green-600" />
              <span className="ml-2 text-sm text-gray-500">Department</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {progress.department.completed}/{progress.department.total}
            </span>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="h-5 w-5 text-purple-600" />
              <span className="ml-2 text-sm text-gray-500">Individual</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {progress.individual.completed}/{progress.individual.total}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}