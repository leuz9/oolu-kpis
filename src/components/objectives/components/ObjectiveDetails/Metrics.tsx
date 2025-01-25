import React from 'react';
import { Calendar, Users } from 'lucide-react';
import type { Objective } from '../../../../types';

interface MetricsProps {
  objective: Objective;
}

export default function Metrics({ objective }: MetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-sm font-medium text-gray-500 mb-1">Progress</div>
        <div className="text-2xl font-bold text-gray-900">{objective.progress}%</div>
        <div className="mt-2 w-full h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 rounded-full bg-indigo-600"
            style={{ width: `${objective.progress}%` }}
          />
        </div>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-sm font-medium text-gray-500 mb-1">Due Date</div>
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-gray-900">
            {new Date(objective.dueDate).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-sm font-medium text-gray-500 mb-1">Contributors</div>
        <div className="flex items-center">
          <Users className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-gray-900">
            {objective.contributors?.length || 0} members
          </span>
        </div>
      </div>
    </div>
  );
}