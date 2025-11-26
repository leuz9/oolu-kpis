import React, { useState, useEffect } from 'react';
import { Clock, Users, CheckCircle, MoreVertical, Pencil, Trash2, Globe, CheckSquare, Eye } from 'lucide-react';
import type { Project, Task } from '../../../types';
import { countryService } from '../../../services/countryService';
import { taskService } from '../../../services/taskService';
import { projectService } from '../../../services/projectService';
import ProjectDetailModal from './ProjectDetailModal';

interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
}

interface ProjectMetrics {
  totalTasks: number;
  completedTasks: number;
  assignedUsers: number;
  progress: number;
}

interface ProjectListProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  showActions: string | null;
  onShowActions: (projectId: string | null) => void;
}

export default function ProjectList({ projects, onEdit, onDelete, showActions, onShowActions }: ProjectListProps) {
  const [countries, setCountries] = useState<{ [key: string]: Country }>({});
  const [projectMetrics, setProjectMetrics] = useState<{ [key: string]: ProjectMetrics }>({});
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);

  useEffect(() => {
    loadCountries();
    loadTasks();
  }, [projects]);

  const loadCountries = async () => {
    try {
      const allCountries = await countryService.getActiveCountries();
      const countriesMap: { [key: string]: Country } = {};
      allCountries.forEach(country => {
        countriesMap[country.id] = country;
      });
      setCountries(countriesMap);
    } catch (error) {
      console.error('Error loading countries:', error);
    }
  };

  const loadTasks = async () => {
    try {
      setLoadingTasks(true);
      const metrics: { [key: string]: ProjectMetrics } = {};

      // Load tasks for all projects
      await Promise.all(
        projects.map(async (project) => {
          try {
            const tasks = await taskService.getTasksByProject(project.id);
            
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(t => t.status === 'done').length;
            
            // Get unique assignees
            const assignees = new Set<string>();
            tasks.forEach(task => {
              if (task.assignee) {
                assignees.add(task.assignee);
              }
            });
            
            // Calculate progress based on completed tasks
            const calculatedProgress = totalTasks > 0 
              ? Math.round((completedTasks / totalTasks) * 100) 
              : project.progress || 0;

            metrics[project.id] = {
              totalTasks,
              completedTasks,
              assignedUsers: assignees.size,
              progress: calculatedProgress
            };

            // Update project progress in database if it differs significantly (more than 1%)
            // Also update status to 'completed' if progress reaches 100%
            if (Math.abs(calculatedProgress - (project.progress || 0)) > 1 || calculatedProgress >= 100) {
              try {
                const updateData: any = {
                  progress: calculatedProgress
                };
                
                // Automatically set status to 'completed' if progress is 100% and not already completed
                if (calculatedProgress >= 100 && project.status !== 'completed') {
                  updateData.status = 'completed';
                  console.log(`Project ${project.id} reached 100% - setting status to completed`);
                }
                
                await projectService.updateProject(project.id, updateData);
                console.log(`Updated progress for project ${project.id} from ${project.progress}% to ${calculatedProgress}%`);
              } catch (error) {
                console.error(`Error updating progress for project ${project.id}:`, error);
              }
            }
          } catch (error) {
            console.error(`Error loading tasks for project ${project.id}:`, error);
            // Fallback to project data
            metrics[project.id] = {
              totalTasks: project.tasks?.length || 0,
              completedTasks: project.tasks?.filter((t: Task) => t.status === 'done').length || 0,
              assignedUsers: project.teamMembers?.length || 0,
              progress: project.progress || 0
            };
          }
        })
      );

      setProjectMetrics(metrics);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoadingTasks(false);
    }
  };
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
                        onClick={() => {
                          setViewingProject(project);
                          onShowActions(null);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Eye className="h-4 w-4 mr-3" />
                        View Details
                      </button>
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
                style={{ width: `${projectMetrics[project.id]?.progress || project.progress}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {projectMetrics[project.id]?.progress || project.progress}% complete
              {projectMetrics[project.id] && (
                <span className="text-gray-400 ml-2">
                  ({projectMetrics[project.id].completedTasks}/{projectMetrics[project.id].totalTasks} tasks)
                </span>
              )}
            </p>
          </div>

          <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Due: {new Date(project.dueDate).toLocaleDateString()}
            </div>
            {projectMetrics[project.id]?.assignedUsers !== undefined ? (
              <div className="flex items-center" title="Users assigned to tasks">
                <Users className="h-4 w-4 mr-1" />
                {projectMetrics[project.id].assignedUsers} assigned
              </div>
            ) : (
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {(project.teamMembers || []).length} members
              </div>
            )}
            {project.status === 'completed' && (
              <div className="flex items-center text-green-500">
                <CheckCircle className="h-4 w-4 mr-1" />
                Completed
              </div>
            )}
          </div>

          {(project.countryIds && project.countryIds.length > 0) && (
            <div className="mt-4 flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div className="flex flex-wrap gap-2">
                {project.countryIds.map((countryId) => {
                  const country = countries[countryId];
                  if (!country) return null;
                  return (
                    <div
                      key={countryId}
                      className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium"
                      title={country.name}
                    >
                      <span className="text-sm">{country.flag}</span>
                      <span className="truncate max-w-[100px]">{country.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-sm">
              <span className="text-gray-500 flex items-center gap-1">
                <CheckSquare className="h-4 w-4" />
                Tasks: 
              </span>
              {loadingTasks ? (
                <span className="font-medium text-gray-400">Loading...</span>
              ) : (
                <span className="font-medium">
                  {projectMetrics[project.id]?.totalTasks ?? (project.tasks || []).length}
                  {projectMetrics[project.id]?.completedTasks !== undefined && (
                    <span className="text-green-600 ml-1">
                      ({projectMetrics[project.id].completedTasks} done)
                    </span>
                  )}
                </span>
              )}
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Documents: </span>
              <span className="font-medium">{(project.documents || []).length}</span>
            </div>
          </div>

          {/* View Button */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => setViewingProject(project)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <Eye className="h-4 w-4" />
              View Details
            </button>
          </div>
        </div>
      ))}

      {/* Project Detail Modal */}
      {viewingProject && (
        <ProjectDetailModal
          project={viewingProject}
          onClose={() => setViewingProject(null)}
          onEdit={() => {
            onEdit(viewingProject);
            setViewingProject(null);
          }}
        />
      )}
    </div>
  );
}