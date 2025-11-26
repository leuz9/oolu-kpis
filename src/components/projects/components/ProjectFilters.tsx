import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Globe, Building2, TrendingUp, Calendar, CheckSquare } from 'lucide-react';
import { countryService } from '../../../services/countryService';
import { departmentService } from '../../../services/departmentService';

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

interface ProjectFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterStatus: string;
  onStatusChange: (status: string) => void;
  filterCountry: string;
  onCountryChange: (countryId: string) => void;
  filterDepartment: string;
  onDepartmentChange: (departmentId: string) => void;
  filterProgress: string;
  onProgressChange: (progress: string) => void;
  filterDate: string;
  onDateChange: (dateFilter: string) => void;
  filterHasTasks: string;
  onHasTasksChange: (hasTasks: string) => void;
}

export default function ProjectFilters({
  searchTerm,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterCountry,
  onCountryChange,
  filterDepartment,
  onDepartmentChange,
  filterProgress,
  onProgressChange,
  filterDate,
  onDateChange,
  filterHasTasks,
  onHasTasksChange
}: ProjectFiltersProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [countriesData, departmentsData] = await Promise.all([
        countryService.getActiveCountries(),
        departmentService.getDepartments()
      ]);
      setCountries(countriesData);
      setDepartments(departmentsData as Department[]);
    } catch (error) {
      console.error('Error loading filter data:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasActiveFilters = filterStatus !== 'all' || 
    filterCountry !== 'all' || 
    filterDepartment !== 'all' || 
    filterProgress !== 'all' || 
    filterDate !== 'all' || 
    filterHasTasks !== 'all';

  const clearAllFilters = () => {
    onStatusChange('all');
    onCountryChange('all');
    onDepartmentChange('all');
    onProgressChange('all');
    onDateChange('all');
    onHasTasksChange('all');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      {/* Main Search and Status Filter */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Status</option>
          <option value="planning">Planning</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="on-hold">On Hold</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-md transition-colors ${
            showAdvanced || hasActiveFilters
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Filter className="h-4 w-4" />
          <span>More Filters</span>
          {hasActiveFilters && (
            <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-0.5">
              {[
                filterStatus !== 'all',
                filterCountry !== 'all',
                filterDepartment !== 'all',
                filterProgress !== 'all',
                filterDate !== 'all',
                filterHasTasks !== 'all'
              ].filter(Boolean).length}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Country Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Country
              </label>
              {loading ? (
                <div className="px-4 py-2 bg-gray-50 rounded-md text-sm text-gray-500">Loading...</div>
              ) : (
                <select
                  value={filterCountry}
                  onChange={(e) => onCountryChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Countries</option>
                  {countries.map(country => (
                    <option key={country.id} value={country.id}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Department
              </label>
              {loading ? (
                <div className="px-4 py-2 bg-gray-50 rounded-md text-sm text-gray-500">Loading...</div>
              ) : (
                <select
                  value={filterDepartment}
                  onChange={(e) => onDepartmentChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Progress Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Progress
              </label>
              <select
                value={filterProgress}
                onChange={(e) => onProgressChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Progress</option>
                <option value="0-25">0% - 25%</option>
                <option value="25-50">25% - 50%</option>
                <option value="50-75">50% - 75%</option>
                <option value="75-100">75% - 99%</option>
                <option value="100">100% (Completed)</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date
              </label>
              <select
                value={filterDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Dates</option>
                <option value="overdue">Overdue</option>
                <option value="due-today">Due Today</option>
                <option value="due-week">Due This Week</option>
                <option value="due-month">Due This Month</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>

            {/* Has Tasks Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                Tasks
              </label>
              <select
                value={filterHasTasks}
                onChange={(e) => onHasTasksChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Projects</option>
                <option value="with-tasks">With Tasks</option>
                <option value="no-tasks">No Tasks</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
