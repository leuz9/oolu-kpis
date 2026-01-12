import React, { useState, useEffect } from 'react';
import { Building2, Sparkles, TrendingUp, Users, CheckSquare, Zap, X } from 'lucide-react';
import { departmentService } from '../../../services/departmentService';
import type { Task, User as UserType } from '../../../types';

interface Department {
  id: string;
  name: string;
}

interface DepartmentTabsProps {
  tasks: Task[];
  selectedDepartment: string;
  onDepartmentChange: (departmentId: string) => void;
  users: { [key: string]: UserType };
  departments: Department[];
}

export default function DepartmentTabs({ tasks, selectedDepartment, onDepartmentChange, users, departments }: DepartmentTabsProps) {
  const [departmentStats, setDepartmentStats] = useState<{ [key: string]: { total: number; completed: number; inProgress: number } }>({});

  useEffect(() => {
    if (departments.length > 0) {
      loadDepartmentStats();
    }
  }, [departments, tasks, users]);

  const loadDepartmentStats = () => {
    const stats: { [key: string]: { total: number; completed: number; inProgress: number } } = {};
    
    // Calculate stats per department based on assignee's department (matching the filter logic)
    departments.forEach(dept => {
      const deptTasks = tasks.filter(task => {
        if (!task.assignee) return false;
        const assigneeUser = users[task.assignee];
        if (!assigneeUser || !assigneeUser.department) return false;
        return assigneeUser.department === dept.name;
      });
      
      stats[dept.id] = {
        total: deptTasks.length,
        completed: deptTasks.filter(t => t.status === 'done').length,
        inProgress: deptTasks.filter(t => t.status === 'in-progress').length
      };
    });

    // Stats for "No Department" - tasks without assignee or assignee without department
    const noDeptTasks = tasks.filter(task => {
      if (!task.assignee) return true;
      const assigneeUser = users[task.assignee];
      return !assigneeUser || !assigneeUser.department;
    });
    
    stats['no-department'] = {
      total: noDeptTasks.length,
      completed: noDeptTasks.filter(t => t.status === 'done').length,
      inProgress: noDeptTasks.filter(t => t.status === 'in-progress').length
    };

    // Stats for "All" tab
    stats['all'] = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'done').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length
    };

    setDepartmentStats(stats);
  };

  const getDepartmentIcon = (deptId: string) => {
    if (deptId === 'no-department') return X;
    const icons = [Building2, Sparkles, TrendingUp, Users, CheckSquare, Zap];
    return icons[deptId.charCodeAt(0) % icons.length];
  };

  const getDepartmentColor = (deptId: string) => {
    if (deptId === 'no-department') return 'from-gray-500 to-gray-600';
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

  return (
    <div className="mb-2 sm:mb-3 md:mb-4 bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-primary-50 to-purple-50 border-b border-gray-100">
        <h3 className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-700 flex items-center gap-1 sm:gap-1.5">
          <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
          <span className="hidden sm:inline">Filter by Department</span>
          <span className="sm:hidden">Departments</span>
        </h3>
      </div>
      
      <div className="overflow-x-auto scrollbar-hide w-full">
        <div className="flex gap-1 sm:gap-1.5 md:gap-2 p-1.5 sm:p-2 md:p-3 min-w-max max-w-full">
          {/* All Tab */}
          <button
            onClick={() => onDepartmentChange('all')}
            className={`group relative flex flex-col items-center gap-0.5 sm:gap-1 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-lg transition-all duration-300 min-w-[70px] sm:min-w-[90px] md:min-w-[110px] ${
              selectedDepartment === 'all'
                ? 'bg-gradient-to-br from-primary-500 to-purple-600 text-white shadow-md scale-105'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:scale-[1.02]'
            }`}
          >
            <div className={`flex items-center gap-1 sm:gap-1.5 ${selectedDepartment === 'all' ? 'text-white' : 'text-primary-600'}`}>
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="font-semibold text-[10px] sm:text-xs md:text-sm">All</span>
            </div>
            {departmentStats['all'] && (
              <div className={`text-[9px] sm:text-[10px] md:text-xs ${selectedDepartment === 'all' ? 'text-white/90' : 'text-gray-500'}`}>
                <span className="font-medium">{departmentStats['all'].total}</span>
              </div>
            )}
            {selectedDepartment === 'all' && (
              <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-6 sm:w-8 h-0.5 bg-white rounded-full"></div>
            )}
          </button>

          {/* No Department Tab */}
          {(() => {
            const stats = departmentStats['no-department'] || { total: 0, completed: 0, inProgress: 0 };
            const isSelected = selectedDepartment === 'no-department';
            const Icon = X;
            const colorClass = 'from-gray-500 to-gray-600';
            
            return (
              <button
                onClick={() => onDepartmentChange('no-department')}
                className={`group relative flex flex-col items-center gap-0.5 sm:gap-1 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-lg transition-all duration-300 min-w-[70px] sm:min-w-[90px] md:min-w-[110px] ${
                  isSelected
                    ? `bg-gradient-to-br ${colorClass} text-white shadow-md scale-105`
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:scale-[1.02]'
                }`}
              >
                <div className={`flex items-center gap-1 sm:gap-1.5 ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="font-semibold text-[10px] sm:text-xs md:text-sm truncate max-w-[60px] sm:max-w-[80px] md:max-w-[100px]">None</span>
                </div>
                <div className={`flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] md:text-xs ${isSelected ? 'text-white/90' : 'text-gray-500'}`}>
                  <span className="font-medium">{stats.total}</span>
                  {stats.completed > 0 && (
                    <span className={`px-0.5 sm:px-1 py-0.5 rounded text-[8px] sm:text-[9px] font-medium ${
                      isSelected ? 'bg-white/20' : 'bg-green-100 text-green-700'
                    }`}>
                      {stats.completed}✓
                    </span>
                  )}
                </div>
                {isSelected && (
                  <div className={`absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-6 sm:w-8 h-0.5 bg-white rounded-full`}></div>
                )}
                {!isSelected && stats.total > 0 && (
                  <div className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-primary-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                )}
              </button>
            );
          })()}

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
                className={`group relative flex flex-col items-center gap-0.5 sm:gap-1 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-lg transition-all duration-300 min-w-[70px] sm:min-w-[90px] md:min-w-[110px] ${
                  isSelected
                    ? `bg-gradient-to-br ${colorClass} text-white shadow-md scale-105`
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:scale-[1.02]'
                }`}
              >
                <div className={`flex items-center gap-1 sm:gap-1.5 ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="font-semibold text-[10px] sm:text-xs md:text-sm truncate max-w-[60px] sm:max-w-[80px] md:max-w-[100px]">{dept.name}</span>
                </div>
                <div className={`flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] md:text-xs ${isSelected ? 'text-white/90' : 'text-gray-500'}`}>
                  <span className="font-medium">{stats.total}</span>
                  {stats.completed > 0 && (
                    <span className={`px-0.5 sm:px-1 py-0.5 rounded text-[8px] sm:text-[9px] font-medium ${
                      isSelected ? 'bg-white/20' : 'bg-green-100 text-green-700'
                    }`}>
                      {stats.completed}✓
                    </span>
                  )}
                </div>
                {isSelected && (
                  <div className={`absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-6 sm:w-8 h-0.5 bg-white rounded-full`}></div>
                )}
                {!isSelected && stats.total > 0 && (
                  <div className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-primary-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

