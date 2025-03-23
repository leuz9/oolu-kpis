import React, { useState } from 'react';
import { Plus, Target, Trash2 } from 'lucide-react';
import type { KeyResult } from '../../../../types';

interface KeyResultsProps {
  keyResults: KeyResult[];
  onAdd: (keyResult: KeyResult) => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, keyResult: Partial<KeyResult>) => void;
}

export default function KeyResults({ keyResults = [], onAdd, onRemove, onUpdate }: KeyResultsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKeyResult, setNewKeyResult] = useState<Partial<KeyResult>>({
    title: '',
    target: 0,
    unit: '%',
    startValue: 0,
    current: 0,
    progress: 0
  });

  const handleAdd = () => {
    if (!newKeyResult.title || !newKeyResult.target) return;

    onAdd({
      ...newKeyResult,
      id: `kr-${Date.now()}`,
      current: newKeyResult.startValue || 0,
      progress: 0,
      status: 'on-track',
      checkIns: []
    } as KeyResult);

    setNewKeyResult({
      title: '',
      target: 0,
      unit: '%',
      startValue: 0,
      current: 0,
      progress: 0
    });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Key Results</h3>
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="flex items-center text-sm text-primary-600 hover:text-primary-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Key Result
        </button>
      </div>

      {/* Key Results List */}
      <div className="space-y-3">
        {keyResults.map((kr, index) => (
          <div key={kr.id} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <Target className="h-4 w-4 text-primary-600 mr-2" />
                  <input
                    type="text"
                    value={kr.title}
                    onChange={(e) => onUpdate(index, { title: e.target.value })}
                    className="text-sm font-medium text-gray-900 border-none focus:ring-0 w-full"
                    placeholder="Key Result Title"
                  />
                </div>
                <div className="mt-2 grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500">Start Value</label>
                    <input
                      type="number"
                      value={kr.startValue}
                      onChange={(e) => onUpdate(index, { startValue: parseFloat(e.target.value) })}
                      className="mt-1 block w-full text-sm border-gray-300 rounded-md focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">Target Value</label>
                    <input
                      type="number"
                      value={kr.target}
                      onChange={(e) => onUpdate(index, { target: parseFloat(e.target.value) })}
                      className="mt-1 block w-full text-sm border-gray-300 rounded-md focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">Unit</label>
                    <input
                      type="text"
                      value={kr.unit}
                      onChange={(e) => onUpdate(index, { unit: e.target.value })}
                      className="mt-1 block w-full text-sm border-gray-300 rounded-md focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="ml-4 p-1 text-gray-400 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Key Result Form */}
      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={newKeyResult.title}
                onChange={(e) => setNewKeyResult({ ...newKeyResult, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="e.g., Increase customer satisfaction score"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Value</label>
                <input
                  type="number"
                  value={newKeyResult.startValue}
                  onChange={(e) => setNewKeyResult({ ...newKeyResult, startValue: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Target Value</label>
                <input
                  type="number"
                  value={newKeyResult.target}
                  onChange={(e) => setNewKeyResult({ ...newKeyResult, target: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit</label>
                <input
                  type="text"
                  value={newKeyResult.unit}
                  onChange={(e) => setNewKeyResult({ ...newKeyResult, unit: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="%, pts, $, etc."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdd}
                className="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
              >
                Add Key Result
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}