import React, { useState, useEffect } from 'react';
import { Building2, Sparkles, TrendingUp, Users, CheckSquare, Zap } from 'lucide-react';
import { departmentService } from '../../../services/departmentService';
import { projectService } from '../../../services/projectService';
import { taskService } from '../../../services/taskService';
import type { Task } from '../../../types';

interface Department {
  id: string;
  name: string;
}

interface DepartmentTabsProps {
  tasks: Task[];
  selectedDepartment: string;
  onDepartmentChange: (departmentId: string) => void;
}

export default function DepartmentTabs({ tasks, selectedDepartment, onDepartmentChange }: DepartmentTabsProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentStats, setDepartmentStats] = useState<{ [key: string]: { total: number; completed: number; inProgress: number } }>({});
  const [loading, setLoading] = useState(true);
  const [projectsByDepartment, setProjectsByDepartment] = useState<{ [key: string]: string[] }>({});

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    if (departments.length > 0) {
      loadDepartmentStats();
    }
  }, [departments, tasks]);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const depts = await departmentService.getDepartments();
      setDepartments(depts as Department[]);
      
      // Load projects to map departments
      const projects = await projectService.getProjects();
      const projectsMap: { [key: string]: string[] } = {};
      projects.forEach(project => {
        if (project.department) {
          if (!projectsMap[project.department]) {
            projectsMap[project.department] = [];
          }
          projectsMap[project.department].push(project.id);
        }
      });
      setProjectsByDepartment(projectsMap);
    } catch (error) {
      console.error('Error loading departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartmentStats = async () => {
    try {
      const stats: { [key: string]: { total: number; completed: number; inProgress: number } } = {};
      
      // Get all projects to map tasks to departments
      const allProjects = await projectService.getProjects();
      const projectToDepartment: { [key: string]: string } = {};
      allProjects.forEach(project => {
        if (project.department) {
          projectToDepartment[project.id] = project.department;
        }
      });

      // Calculate stats per department
      departments.forEach(dept => {
        const deptTasks = tasks.filter(task => {
          if (!task.projectId) return false;
          return projectToDepartment[task.projectId] === dept.id;
        });
        
        stats[dept.id] = {
          total: deptTasks.length,
          completed: deptTasks.filter(t => t.status === 'done').length,
          inProgress: deptTasks.filter(t => t.status === 'in-progress').length
        };
      });

      // Stats for "All" tab
      stats['all'] = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'done').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length
      };

      setDepartmentStats(stats);
    } catch (error) {
      console.error('Error loading department stats:', error);
    }
  };

  const getDepartmentIcon = (deptId: string) => {
    const icons = [Building2, Sparkles, TrendingUp, Users, CheckSquare, Zap];
    return icons[deptId.charCodeAt(0) % icons.length];
  };

  const getDepartmentColor = (deptId: string) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-blue-500',
      'from-teal-500 to-cyan-500',
      'from-rose-500 to-pink-500',
      'from-amber-500 to-yellow-500'
    ];
    return colors[deptId.charCodeAt(0) % colors.length];
  };

  if (loading) {
    return (
      <div className="mb-3 sm:mb-4 bg-white rounded-lg shadow-sm p-3">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-3 sm:mb-4 bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-3 sm:px-4 py-2 bg-gradient-to-r from-primary-50 to-purple-50 border-b border-gray-100">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Filter by Department</span>
          <span className="sm:hidden">Departments</span>
        </h3>
      </div>
      
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-1.5 sm:gap-2 p-2 sm:p-3 min-w-max">
          {/* All Tab */}
          <button
            onClick={() => onDepartmentChange('all')}
            className={`group relative flex flex-col items-center gap-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-all duration-300 min-w-[90px] sm:min-w-[110px] ${
              selectedDepartment === 'all'
                ? 'bg-gradient-to-br from-primary-500 to-purple-600 text-white shadow-md scale-105'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:scale-[1.02]'
            }`}
          >
            <div className={`flex items-center gap-1.5 ${selectedDepartment === 'all' ? 'text-white' : 'text-primary-600'}`}>
              <Sparkles className="h-4 w-4" />
              <span className="font-semibold text-xs sm:text-sm">All</span>
            </div>
            {departmentStats['all'] && (
              <div className={`text-[10px] sm:text-xs ${selectedDepartment === 'all' ? 'text-white/90' : 'text-gray-500'}`}>
                <span className="font-medium">{departmentStats['all'].total}</span>
              </div>
            )}
            {selectedDepartment === 'all' && (
              <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-white rounded-full"></div>
            )}
          </button>

          {/* Department Tabs */}
          {departments.map((dept) => {
            const Icon = getDepartmentIcon(dept.id);
            const colorClass = getDepartmentColor(dept.id);
            const isSelected = selectedDepartment === dept.id;
            const stats = departmentStats[dept.id] || { total: 0, completed: 0, inProgress: 0 };

            return (
              <button
                key={dept.id}
                onClick={() => onDepartmentChange(dept.id)}
                className={`group relative flex flex-col items-center gap-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-all duration-300 min-w-[90px] sm:min-w-[110px] ${
                  isSelected
                    ? `bg-gradient-to-br ${colorClass} text-white shadow-md scale-105`
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:scale-[1.02]'
                }`}
              >
                <div className={`flex items-center gap-1.5 ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                  <Icon className="h-4 w-4" />
                  <span className="font-semibold text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[100px]">{dept.name}</span>
                </div>
                {stats.total > 0 && (
                  <div className={`flex items-center gap-1.5 text-[10px] sm:text-xs ${isSelected ? 'text-white/90' : 'text-gray-500'}`}>
                    <span className="font-medium">{stats.total}</span>
                    {stats.completed > 0 && (
                      <span className={`px-1 py-0.5 rounded text-[9px] font-medium ${
                        isSelected ? 'bg-white/20' : 'bg-green-100 text-green-700'
                      }`}>
                        {stats.completed}✓
                      </span>
                    )}
                  </div>
                )}
                {isSelected && (
                  <div className={`absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-white rounded-full`}></div>
                )}
                {!isSelected && stats.total > 0 && (
                  <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

