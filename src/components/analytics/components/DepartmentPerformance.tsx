import React from 'react';

interface Department {
  name: string;
  progress: number;
  status: string;
}

interface DepartmentPerformanceProps {
  departments: Department[];
  selectedDepartment: string;
  onDepartmentChange: (department: string) => void;
}

export default function DepartmentPerformance({ 
  departments, 
  selectedDepartment, 
  onDepartmentChange 
}: DepartmentPerformanceProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-100 text-green-800';
      case 'at-risk':
        return 'bg-yellow-100 text-yellow-800';
      case 'behind':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Department Performance</h2>
        <select
          value={selectedDepartment}
          onChange={(e) => onDepartmentChange(e.target.value)}
          className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="all">All Departments</option>
          {departments.map(dept => (
            <option key={dept.name} value={dept.name}>{dept.name}</option>
          ))}
        </select>
      </div>
      <div className="space-y-4">
        {departments.map((dept, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">{dept.name}</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(dept.status)}`}>
                  {dept.status.replace('-', ' ')}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 rounded-full bg-primary-600 transition-all duration-300"
                  style={{ width: `${dept.progress}%` }}
                />
              </div>
            </div>
            <span className="ml-4 text-sm font-medium text-gray-900">{dept.progress}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}