import React from 'react';
import { Target, Activity, Flame, Award } from 'lucide-react';

interface TaskStatsProps {
  stats: {
    completionRate: number;
    inProgress: number;
    urgent: number;
    completed: number;
  };
}

export default function TaskStats({ stats }: TaskStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
      <div className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-3 border-l-4 border-primary-500">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs font-medium text-gray-600 mb-0.5">Completion</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.completionRate.toFixed(0)}%</p>
          </div>
          <div className="p-1.5 bg-primary-100 rounded-full group-hover:bg-primary-200 transition-colors flex-shrink-0 ml-2">
            <Target className="h-4 w-4 text-primary-600" />
          </div>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className="bg-gradient-to-r from-primary-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${stats.completionRate}%` }}
          ></div>
        </div>
      </div>

      <div className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-3 border-l-4 border-yellow-500">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs font-medium text-gray-600 mb-0.5">In Progress</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.inProgress}</p>
          </div>
          <div className="p-1.5 bg-yellow-100 rounded-full group-hover:bg-yellow-200 transition-colors flex-shrink-0 ml-2">
            <Activity className="h-4 w-4 text-yellow-600" />
          </div>
        </div>
      </div>

      <div className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-3 border-l-4 border-red-500">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs font-medium text-gray-600 mb-0.5">Urgent</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.urgent}</p>
          </div>
          <div className="p-1.5 bg-red-100 rounded-full group-hover:bg-red-200 transition-colors flex-shrink-0 ml-2">
            <Flame className="h-4 w-4 text-red-600" />
          </div>
        </div>
      </div>

      <div className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-3 border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs font-medium text-gray-600 mb-0.5">Completed</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.completed}</p>
          </div>
          <div className="p-1.5 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors flex-shrink-0 ml-2">
            <Award className="h-4 w-4 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
