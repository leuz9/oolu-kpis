import React from 'react';

interface ClassificationProps {
  level: string;
  quarter: string;
  department?: string;
  departments: string[];
  parentObjective?: any;
  onChange: (field: string, value: string) => void;
}

export default function Classification({ 
  level, 
  quarter, 
  department, 
  departments,
  parentObjective,
  onChange 
}: ClassificationProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Level</label>
        <select
          value={level}
          onChange={(e) => onChange('level', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          disabled={!!parentObjective}
        >
          <option value="company">Company</option>
          <option value="department">Department</option>
          <option value="individual">Individual</option>
        </select>
      </div>

      {level === 'department' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Department</label>
          <select
            value={department}
            onChange={(e) => onChange('department', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="">Select Department</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Quarter</label>
        <select
          value={quarter}
          onChange={(e) => onChange('quarter', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          {[...Array(4)].map((_, i) => (
            <option key={i} value={`${new Date().getFullYear()}-Q${i + 1}`}>
              {new Date().getFullYear()} Q{i + 1}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}