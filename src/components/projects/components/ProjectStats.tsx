import React from 'react';
import { Clock, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import type { Project } from '../../../types';

interface ProjectStatsProps {
  projects: Project[];
}

export default function ProjectStats({ projects }: ProjectStatsProps) {
  const getActiveProjects = () => projects.filter(p => p.status === 'in-progress').length;
  const getCompletedProjects = () => projects.filter(p => p.status === 'completed').length;
  const getOverdueProjects = () => {
    const today = new Date();
    return projects.filter(p => 
      p.status !== 'completed' && 
      p.status !== 'cancelled' && 
      new Date(p.dueDate) < today
    ).length;
  };
  const getTotalTeamMembers = () => {
    const uniqueMembers = new Set(projects.flatMap(p => p.teamMembers));
    return uniqueMembers.size;
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-primary-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Projects</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{getActiveProjects()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{getCompletedProjects()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Overdue</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{getOverdueProjects()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Team Members</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{getTotalTeamMembers()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}