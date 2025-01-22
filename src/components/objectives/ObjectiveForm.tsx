import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import type { KeyResult } from '../../types';

interface ObjectiveFormProps {
  onClose: () => void;
  onSubmit: (objective: any) => void;
  parentObjective?: any;
  initialData?: any;
}

export default function ObjectiveForm({ onClose, onSubmit, parentObjective, initialData }: ObjectiveFormProps) {
  const [formData, setFormData] = useState(initialData || {
    title: '',
    description: '',
    level: parentObjective ? 
      (parentObjective.level === 'company' ? 'department' : 'individual') : 
      'company',
    status: 'on-track',
    dueDate: '',
    weight: 1,
    quarter: `${new Date().getFullYear()}-Q${Math.floor(new Date().getMonth() / 3) + 1}`,
    keyResults: [{ title: '', target: 0, unit: '', startValue: 0 }]
  });

  const handleKeyResultChange = (index: number, field: string, value: any) => {
    const newKeyResults = [...formData.keyResults];
    newKeyResults[index] = { ...newKeyResults[index], [field]: value };
    setFormData({ ...formData, keyResults: newKeyResults });
  };

  const addKeyResult = () => {
    setFormData({
      ...formData,
      keyResults: [...formData.keyResults, { title: '', target: 0, unit: '', startValue: 0 }]
    });
  };

  const removeKeyResult = (index: number) => {
    const newKeyResults = formData.keyResults.filter((_, i) => i !== index);
    setFormData({ ...formData, keyResults: newKeyResults });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const objective = {
      ...formData,
      progress: 0,
      parentId: parentObjective?.id,
      departmentId: parentObjective?.departmentId,
      year: parseInt(formData.quarter.split('-')[0]),
      contributors: [],
      keyResults: formData.keyResults.map((kr, index) => ({
        id: `kr-${Date.now()}-${index}`,
        title: kr.title,
        target: parseFloat(kr.target.toString()),
        current: parseFloat(kr.startValue.toString()),
        unit: kr.unit,
        progress: 0,
        startValue: parseFloat(kr.startValue.toString()),
        dueDate: formData.dueDate,
        checkIns: []
      }))
    };
    onSubmit(objective);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Edit Objective' : 
              parentObjective ? `Add Sub-Objective to "${parentObjective.title}"` : 
              'Create New Objective'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter objective title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Describe the objective"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Level</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  disabled={!!parentObjective}
                >
                  <option value="company">Company</option>
                  <option value="department">Department</option>
                  <option value="individual">Individual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Quarter</label>
                <select
                  value={formData.quarter}
                  onChange={(e) => setFormData({ ...formData, quarter: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  {[...Array(4)].map((_, i) => (
                    <option key={i} value={`${new Date().getFullYear()}-Q${i + 1}`}>
                      {new Date().getFullYear()} Q{i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Key Results</label>
              <div className="space-y-4">
                {formData.keyResults.map((kr, index) => (
                  <div key={index} className="flex items-start space-x-4 bg-gray-50 p-4 rounded-lg">
                    <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          required
                          value={kr.title}
                          onChange={(e) => handleKeyResultChange(index, 'title', e.target.value)}
                          placeholder="Key result title"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <input
                            type="number"
                            required
                            value={kr.target}
                            onChange={(e) => handleKeyResultChange(index, 'target', e.target.value)}
                            placeholder="Target"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            required
                            value={kr.unit}
                            onChange={(e) => handleKeyResultChange(index, 'unit', e.target.value)}
                            placeholder="Unit"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                    {formData.keyResults.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeKeyResult(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addKeyResult}
                  className="flex items-center text-indigo-600 hover:text-indigo-700"
                >
                  <Plus className="h-5 w-5 mr-1" />
                  Add Key Result
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
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
              {initialData ? 'Save Changes' : 'Create Objective'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}