import React from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  User,
  AlertTriangle,
  RotateCcw as ResetIcon,
  List,
  LayoutGrid,
  Columns,
  Calendar as CalendarIcon,
  BarChart3
} from 'lucide-react';
import type { Task, Project } from '../../../types';

export type ViewType = 'list' | 'grid' | 'kanban' | 'calendar' | 'analytics';
export type FilterPreset = 'all' | 'my-tasks' | 'urgent' | 'due-today' | 'overdue' | 'completed';

interface TaskFiltersProps {
  view: ViewType;
  onViewChange: (view: ViewType) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterMe: boolean;
  onFilterMeToggle: () => void;
  filterOverdue: boolean;
  onFilterOverdueToggle: () => void;
  onResetFilters: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  filterPreset: FilterPreset;
  onFilterPresetChange: (preset: FilterPreset) => void;
  filterStatus: 'all' | Task['status'];
  onFilterStatusChange: (status: 'all' | Task['status']) => void;
  filterPriority: 'all' | Task['priority'];
  onFilterPriorityChange: (priority: 'all' | Task['priority']) => void;
  filterProject: string;
  onFilterProjectChange: (project: string) => void;
  filterCountry: string;
  onFilterCountryChange: (country: string) => void;
  filterAssignee: string;
  onFilterAssigneeChange: (assignee: string) => void;
  projects: Project[];
  countries: any[];
  tasks: Task[];
  getUserName: (userId: string) => string;
}

export default function TaskFilters({
  view,
  onViewChange,
  searchTerm,
  onSearchChange,
  filterMe,
  onFilterMeToggle,
  filterOverdue,
  onFilterOverdueToggle,
  onResetFilters,
  showFilters,
  onToggleFilters,
  filterPreset,
  onFilterPresetChange,
  filterStatus,
  onFilterStatusChange,
  filterPriority,
  onFilterPriorityChange,
  filterProject,
  onFilterProjectChange,
  filterCountry,
  onFilterCountryChange,
  filterAssignee,
  onFilterAssigneeChange,
  projects,
  countries,
  tasks,
  getUserName
}: TaskFiltersProps) {
  const viewOptions = [
    { id: 'list' as ViewType, icon: List, label: 'List' },
    { id: 'grid' as ViewType, icon: LayoutGrid, label: 'Grid' },
    { id: 'kanban' as ViewType, icon: Columns, label: 'Kanban' },
    { id: 'calendar' as ViewType, icon: CalendarIcon, label: 'Calendar' },
    { id: 'analytics' as ViewType, icon: BarChart3, label: 'Analytics' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 overflow-x-hidden">
      <div className="flex flex-col gap-2 sm:gap-3">
        {/* View Toggle and Search Row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0">
          {/* View Toggle */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {viewOptions.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => onViewChange(id)}
                  className={`flex items-center justify-center gap-1 px-1.5 sm:px-2 md:px-3 py-1.5 text-xs sm:text-sm transition-all duration-200 ${
                    view === id
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } ${id === 'list' ? 'rounded-l-lg' : ''} ${id === 'analytics' ? 'rounded-r-lg' : ''}`}
                  title={label}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden xl:inline text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search and Quick Filters */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 overflow-x-auto">
            <div className="relative flex-1 min-w-0 max-w-full">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks... (⌘K)"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full max-w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={onFilterMeToggle}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 border rounded-lg transition-colors flex-shrink-0 text-sm ${
                filterMe
                  ? 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
              title="Show only my tasks"
            >
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Me</span>
            </button>
            
            <button
              onClick={onFilterOverdueToggle}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 border rounded-lg transition-colors flex-shrink-0 text-sm ${
                filterOverdue
                  ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
              title="Show only overdue tasks"
            >
              <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Overdue</span>
            </button>
            
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0 text-sm"
              title="Reset all filters"
            >
              <ResetIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            
            <button
              onClick={onToggleFilters}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0 text-sm"
            >
              <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Filters</span>
              {showFilters ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200 animate-slide-down">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-3">
              {/* Filter Presets */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Quick Filters</label>
                <select
                  value={filterPreset}
                  onChange={(e) => onFilterPresetChange(e.target.value as FilterPreset)}
                  className="w-full text-sm py-1.5 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="all">All Tasks</option>
                  <option value="my-tasks">My Tasks</option>
                  <option value="urgent">Urgent</option>
                  <option value="due-today">Due Today</option>
                  <option value="overdue">Overdue</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => onFilterStatusChange(e.target.value as typeof filterStatus)}
                  className="w-full text-sm py-1.5 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="blocked">Blocked</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={filterPriority}
                  onChange={(e) => onFilterPriorityChange(e.target.value as typeof filterPriority)}
                  className="w-full text-sm py-1.5 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Project</label>
                <select
                  value={filterProject}
                  onChange={(e) => onFilterProjectChange(e.target.value)}
                  className="w-full text-sm py-1.5 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="all">All Projects</option>
                  <option value="no-project">No Project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Country</label>
                <select
                  value={filterCountry}
                  onChange={(e) => onFilterCountryChange(e.target.value)}
                  className="w-full text-sm py-1.5 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="all">All Countries</option>
                  {countries.map(country => (
                    <option key={country.id} value={country.id}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Assignee</label>
                <select
                  value={filterAssignee}
                  onChange={(e) => onFilterAssigneeChange(e.target.value)}
                  className="w-full text-sm py-1.5 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="all">All Assignees</option>
                  {Array.from(new Set(tasks.map(t => t.assignee).filter(Boolean))).map(assignee => (
                    <option key={assignee} value={assignee}>
                      {getUserName(assignee)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
