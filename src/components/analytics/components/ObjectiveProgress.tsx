import React from 'react';
import { Target, Building2, Users } from 'lucide-react';

interface ObjectiveStats {
  completed: number;
  total: number;
}

interface ObjectiveProgressProps {
  progress: {
    company: ObjectiveStats;
    department: ObjectiveStats;
    individual: ObjectiveStats;
  };
}

export default function ObjectiveProgress({ progress }: ObjectiveProgressProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Objective Progress</h2>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-primary-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="h-5 w-5 text-primary-600" />
              <span className="ml-2 text-sm font-medium text-primary-900">Company</span>
            </div>
            <span className="text-sm text-primary-700">
              {progress.company.completed}/{progress.company.total}
            </span>
          </div>
          <div className="mt-2 w-full h-2 bg-primary-200 rounded-full">
            <div
              className="h-2 rounded-full bg-primary-600"
              style={{ width: `${(progress.company.completed / progress.company.total) * 100}%` }}
            />
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span className="ml-2 text-sm font-medium text-blue-900">Department</span>
            </div>
            <span className="text-sm text-blue-700">
              {progress.department.completed}/{progress.department.total}
            </span>
          </div>
          <div className="mt-2 w-full h-2 bg-blue-200 rounded-full">
            <div
              className="h-2 rounded-full bg-blue-600"
              style={{ width: `${(progress.department.completed / progress.department.total) * 100}%` }}
            />
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-green-600" />
              <span className="ml-2 text-sm font-medium text-green-900">Individual</span>
            </div>
            <span className="text-sm text-green-700">
              {progress.individual.completed}/{progress.individual.total}
            </span>
          </div>
          <div className="mt-2 w-full h-2 bg-green-200 rounded-full">
            <div
              className="h-2 rounded-full bg-green-600"
              style={{ width: `${(progress.individual.completed / progress.individual.total) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}