import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { KeyResult } from '../../types';

interface KeyResultFormProps {
  onClose: () => void;
  onSubmit: (keyResult: Partial<KeyResult>) => void;
  dueDate: string;
}

export default function KeyResultForm({ onClose, onSubmit, dueDate }: KeyResultFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    target: 0,
    startValue: 0,
    unit: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const keyResult: Partial<KeyResult> = {
      id: `kr-${Date.now()}`,
      title: formData.title,
      target: parseFloat(formData.target.toString()),
      current: parseFloat(formData.startValue.toString()),
      unit: formData.unit,
      progress: 0,
      startValue: parseFloat(formData.startValue.toString()),
      dueDate,
      checkIns: []
    };
    onSubmit(keyResult);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Add Key Result</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter key result title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Target Value</label>
              <input
                type="number"
                required
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Unit</label>
              <input
                type="text"
                required
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g., %, units, hours"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Starting Value</label>
            <input
              type="number"
              value={formData.startValue}
              onChange={(e) => setFormData({ ...formData, startValue: parseFloat(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Add Key Result
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}