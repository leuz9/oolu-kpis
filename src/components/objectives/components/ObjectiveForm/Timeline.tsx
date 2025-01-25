import React from 'react';

interface TimelineProps {
  dueDate: string;
  onChange: (field: string, value: string) => void;
}

export default function Timeline({ dueDate, onChange }: TimelineProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Due Date</label>
      <input
        type="date"
        required
        value={dueDate}
        onChange={(e) => onChange('dueDate', e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />
    </div>
  );
}