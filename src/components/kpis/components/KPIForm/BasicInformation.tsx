import React from 'react';

interface BasicInformationProps {
  name: string;
  description: string;
  onChange: (field: string, value: string) => void;
}

export default function BasicInformation({ name, description, onChange }: BasicInformationProps) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700">KPI Name</label>
        <input
          type="text"
          value={name}
          onChange={e => onChange('name', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="e.g., Customer Satisfaction Score"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          rows={3}
          value={description}
          onChange={e => onChange('description', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="Describe what this KPI measures and why it's important"
        />
      </div>
    </>
  );
}