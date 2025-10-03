import React from 'react';
import { Search, Filter, User, Users, Calendar, Building2, Target, PieChart } from 'lucide-react';
import type { Filters } from '../types';
import { useAuth } from '../../../contexts/AuthContext';

interface FiltersProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  departments: string[];
  contributors: string[];
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  sort: { field: string; order: 'asc' | 'desc' };
  setSort: (sort: { field: string; order: 'asc' | 'desc' }) => void;
  loading?: boolean;
  totalObjectives: number;
  filteredCount: number;
}

export default function Filters({
  filters,
  setFilters,
  departments,
  contributors,
  showFilters,
  setShowFilters,
  sort,
  setSort,
  loading = false,
  totalObjectives,
  filteredCount
}: FiltersProps) {
  const { user } = useAuth();

  const dateRanges = [
    { value: 'all', label: 'All Dates' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'this-week', label: 'Due This Week' },
    { value: 'this-month', label: 'Due This Month' },
    { value: 'next-month', label: 'Due Next Month' },
    { value: 'this-quarter', label: 'Due This Quarter' },
    { value: 'next-quarter', label: 'Due Next Quarter' }
  ];

  const progressRanges = [
    { value: 'all', label: 'All Progress' },
    { value: '0-25', label: '0-25%' },
    { value: '26-50', label: '26-50%' },
    { value: '51-75', label: '51-75%' },
    { value: '76-100', label: '76-100%' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'on-track', label: 'On Track' },
    { value: 'at-risk', label: 'At Risk' },
    { value: 'behind', label: 'Behind' }
  ];

  const sortOptions = [
    { field: 'title', label: 'Title' },
    { field: 'progress', label: 'Progress' },
    { field: 'dueDate', label: 'Due Date' },
    { field: 'status', label: 'Status' },
    { field: 'level', label: 'Level' },
    { field: 'createdAt', label: 'Created Date' },
    { field: 'updatedAt', label: 'Last Updated' }
  ];

  return (
    <div className="mb-6 space-y-4">
      {/* Quick Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search objectives..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              showFilters 
                ? 'bg-primary-100 text-primary-700 border border-primary-200'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilters({ 
                ...filters, 
                contributor: user?.id || 'all',
                department: 'all' // Reset department filter when showing my objectives
              })}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                filters.contributor === user?.id && filters.department === 'all'
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <User className="h-4 w-4 mr-2" />
              My Objectives
            </button>
            {user?.department && (
              <button
                onClick={() => setFilters({ 
                  ...filters, 
                  department: user.department || 'all',
                  contributor: 'all' // Reset contributor filter when showing my department
                })}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  filters.department === user.department && filters.contributor === 'all'
                    ? 'bg-primary-100 text-primary-700 border border-primary-200'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Building2 className="h-4 w-4 mr-2" />
                My Department
              </button>
            )}
            <button
              onClick={() => setFilters({ ...filters, contributor: 'all', department: 'all' })}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                filters.contributor === 'all' && filters.department === 'all'
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Users className="h-4 w-4 mr-2" />
              All Objectives
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          Showing {filteredCount} of {totalObjectives} objectives
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select
                value={filters.level}
                onChange={(e) => setFilters({ ...filters, level: e.target.value as Filters['level'] })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="all">All Levels</option>
                <option value="company">Company</option>
                <option value="department">Department</option>
                <option value="individual">Individual</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as Filters['status'] })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Progress Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Progress</label>
              <select
                value={filters.progress}
                onChange={(e) => setFilters({ ...filters, progress: e.target.value as Filters['progress'] })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                {progressRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <select
                value={filters.dueDate}
                onChange={(e) => setFilters({ ...filters, dueDate: e.target.value as Filters['dueDate'] })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                {dateRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                disabled={loading}
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Key Results Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Key Results</label>
              <select
                value={filters.hasKpis}
                onChange={(e) => setFilters({ ...filters, hasKpis: e.target.value as Filters['hasKpis'] })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="all">All</option>
                <option value="yes">With Key Results</option>
                <option value="no">Without Key Results</option>
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <div className="flex space-x-2">
                <select
                  value={sort.field}
                  onChange={(e) => setSort({ ...sort, field: e.target.value })}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.field} value={option.field}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setSort({ ...sort, order: sort.order === 'asc' ? 'desc' : 'asc' })}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {sort.order === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={() => {
                setFilters({
                  search: '',
                  level: 'all',
                  status: 'all',
                  progress: 'all',
                  dueDate: 'all',
                  department: 'all',
                  contributor: 'all',
                  hasKpis: 'all'
                });
                setSort({ field: 'title', order: 'asc' });
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}