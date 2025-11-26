import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, Globe, Building2, CheckSquare, FileText, TrendingUp, Clock, DollarSign, Target, AlertCircle } from 'lucide-react';
import type { Project, Task } from '../../../types';
import { countryService } from '../../../services/countryService';
import { departmentService } from '../../../services/departmentService';
import { taskService } from '../../../services/taskService';
import { userService } from '../../../services/userService';

interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
}

interface Department {
  id: string;
  name: string;
}

interface User {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

interface ProjectDetailModalProps {
  project: Project;
  onClose: () => void;
  onEdit?: () => void;
}

export default function ProjectDetailModal({ project, onClose, onEdit }: ProjectDetailModalProps) {
  const [countries, setCountries] = useState<{ [key: string]: Country }>({});
  const [department, setDepartment] = useState<Department | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<{ [key: string]: User }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [project]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allCountriesData, tasksData] = await Promise.all([
        countryService.getActiveCountries(),
        taskService.getTasksByProject(project.id)
      ]);

      // Load countries
      const countriesMap: { [key: string]: Country } = {};
      allCountriesData.forEach((country: Country) => {
        if (project.countryIds && project.countryIds.includes(country.id)) {
          countriesMap[country.id] = country;
        }
      });
      setCountries(countriesMap);

      // Load tasks
      setTasks(tasksData);

      // Load department
      if (project.department) {
        try {
          const dept = await departmentService.getDepartment(project.department);
          setDepartment(dept as Department);
        } catch (error) {
          console.error('Error loading department:', error);
        }
      }

      // Load team members
      if (project.teamMembers && project.teamMembers.length > 0) {
        const membersMap: { [key: string]: User } = {};
        await Promise.all(
          project.teamMembers.map(async (userId) => {
            try {
              const user = await userService.getUser(userId);
              if (user) membersMap[userId] = user;
            } catch (error) {
              console.error(`Error loading user ${userId}:`, error);
            }
          })
        );
        setTeamMembers(membersMap);
      }
    } catch (error) {
      console.error('Error loading project details:', error);
    } finally {
      setLoading(false);
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

  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const progress = project.progress || (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const isOverdue = () => {
    if (project.status === 'completed') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(project.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto animate-slide-down">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sm:py-5 z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{project.name}</h2>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">{project.description}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="px-3 sm:px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  Edit
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              {/* Status and Progress */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  {isOverdue() && (
                    <div className="flex items-center gap-1 text-red-600 text-sm mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>Overdue</span>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm font-semibold text-gray-900">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700">Start Date</p>
                    <p className="text-sm text-gray-900 mt-1">{formatDate(project.startDate)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700">Due Date</p>
                    <p className="text-sm text-gray-900 mt-1">{formatDate(project.dueDate)}</p>
                  </div>
                </div>
              </div>

              {/* Department and Countries */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {department && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Building2 className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700">Department</p>
                      <p className="text-sm text-gray-900 mt-1">{department.name}</p>
                    </div>
                  </div>
                )}

                {project.countryIds && project.countryIds.length > 0 && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Globe className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 mb-2">Countries</p>
                      <div className="flex flex-wrap gap-2">
                        {project.countryIds.map((countryId) => {
                          const country = countries[countryId];
                          if (!country) return null;
                          return (
                            <div
                              key={countryId}
                              className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md text-xs"
                            >
                              <span>{country.flag}</span>
                              <span>{country.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Budget */}
              {project.budget && (
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700">Budget</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(project.budget)}
                    </p>
                  </div>
                </div>
              )}

              {/* Tasks */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <CheckSquare className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
                    <p className="text-xs text-gray-500 mt-1">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
                    <p className="text-xs text-gray-500 mt-1">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{totalTasks - completedTasks}</p>
                    <p className="text-xs text-gray-500 mt-1">Remaining</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-600">{progress}%</p>
                    <p className="text-xs text-gray-500 mt-1">Progress</p>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              {project.teamMembers && project.teamMembers.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                    <span className="text-sm text-gray-500">({project.teamMembers.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {project.teamMembers.map((userId) => {
                      const member = teamMembers[userId];
                      if (!member) return null;
                      return (
                        <div key={userId} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                          {member.photoURL ? (
                            <img
                              src={member.photoURL}
                              alt={member.displayName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                              {member.displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{member.displayName}</p>
                            <p className="text-xs text-gray-500 truncate">{member.email}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Documents */}
              {project.documents && project.documents.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
                    <span className="text-sm text-gray-500">({project.documents.length})</span>
                  </div>
                  <div className="space-y-2">
                    {project.documents.map((doc, index) => (
                      <a
                        key={doc.id || index}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.type}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

