import React, { useState, useEffect } from 'react';
import { departmentService } from '../../../../services/departmentService';
import type { Project, Department } from '../../../../types';
import CountrySelect from '../CountrySelect';

interface BasicInformationProps {
  name: string;
  description: string;
  status: Project['status'];
  managerId: string;
  startDate: string;
  dueDate: string;
  department: string;
  countryIds?: string[];
  onChange: (field: string, value: any) => void;
  onDepartmentChange: (departmentId: string) => void;
}

export default function BasicInformation({
  name,
  description,
  status,
  managerId,
  startDate,
  dueDate,
  department,
  countryIds = [],
  onChange,
  onDepartmentChange
}: BasicInformationProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const fetchedDepartments = await departmentService.getDepartments();
      setDepartments(fetchedDepartments);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
      <h4 className="text-sm font-medium text-gray-900">Basic Information</h4>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Project Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={e => onChange('name', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="Enter project name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          rows={4}
          value={description}
          onChange={e => onChange('description', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="Describe the project's goals and scope"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Department</label>
          {loading ? (
            <div className="mt-1 flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-sm text-gray-500">Loading departments...</span>
            </div>
          ) : (
            <select
              value={department}
              onChange={e => {
                onChange('department', e.target.value);
                onDepartmentChange(e.target.value);
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={status}
            onChange={e => onChange('status', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="planning">Planning</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            required
            value={startDate}
            onChange={e => onChange('startDate', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Due Date</label>
          <input
            type="date"
            required
            value={dueDate}
            onChange={e => onChange('dueDate', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <CountrySelect
          selectedCountryIds={countryIds}
          onChange={(countryIds) => onChange('countryIds', countryIds)}
          label="Countries"
          placeholder="Select one or more countries..."
        />
      </div>
    </div>
  );
}