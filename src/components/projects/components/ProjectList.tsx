import React from 'react';
import { Clock, Users, CheckCircle, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import type { Project } from '../../../types';

interface ProjectListProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  showActions: string | null;
  onShowActions: (projectId: string | null) => void;
}

export default function ProjectList({ projects, onEdit, onDelete, showActions, onShowActions }: ProjectListProps) {
  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {projects.map((project) => (
        <div
          key={project.id}
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{project.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                {project.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              <div className="relative">
                <button
                  onClick={() => onShowActions(showActions === project.id ? null : project.id)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
                {showActions === project.id && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1">
                      <button
                        onClick={() => onEdit(project)}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Pencil className="h-4 w-4 mr-3" />
                        Edit Project
                      </button>
                      <button
                        onClick={() => onDelete(project.id)}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-3" />
                        Delete Project
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-gray-600">{project.progress}% complete</p>
          </div>

          <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Due: {new Date(project.dueDate).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {(project.teamMembers || []).length} members
            </div>
            {project.status === 'completed' && (
              <div className="flex items-center text-green-500">
                <CheckCircle className="h-4 w-4 mr-1" />
                Completed
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-sm">
              <span className="text-gray-500">Tasks: </span>
              <span className="font-medium">{(project.tasks || []).length}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Documents: </span>
              <span className="font-medium">{(project.documents || []).length}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}