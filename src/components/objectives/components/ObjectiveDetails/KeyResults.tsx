import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import type { KeyResult } from '../../../../types';

interface KeyResultsProps {
  keyResults: KeyResult[];
  onUpdateProgress?: (keyResultId: string, value: number, comment: string) => Promise<void>;
}

interface UpdateModalProps {
  keyResult: KeyResult;
  onClose: () => void;
  onUpdate: (value: number, comment: string) => Promise<void>;
}

function UpdateModal({ keyResult, onClose, onUpdate }: UpdateModalProps) {
  const [value, setValue] = useState(keyResult.current.toString());
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setError('Please enter a valid number');
      return;
    }

    if (!comment.trim()) {
      setError('Please provide a comment for this update');
      return;
    }

    try {
      setLoading(true);
      await onUpdate(numValue, comment);
      onClose();
    } catch (err) {
      console.error('Error updating key result:', err);
      setError('Failed to update key result value');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIndicator = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    } else if (current < previous) {
      return <TrendingDown className="h-5 w-5 text-red-500" />;
    }
    return <Minus className="h-5 w-5 text-gray-500" />;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Update Key Result Value</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">×</button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {keyResult.title}
            </label>
            <div className="mt-1 text-sm text-gray-500">
              Current value: {keyResult.current} {keyResult.unit}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Value
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="block w-full pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 border-gray-300 rounded-md"
                placeholder="Enter new value"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">{keyResult.unit}</span>
              </div>
            </div>
          </div>

          {value !== keyResult.current.toString() && (
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-500">Change:</span>
              {getTrendIndicator(parseFloat(value), keyResult.current)}
              <span className={`font-medium ${
                parseFloat(value) > keyResult.current ? 'text-green-600' : 
                parseFloat(value) < keyResult.current ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                {Math.abs(parseFloat(value) - keyResult.current).toFixed(2)} {keyResult.unit}
              </span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Update Comment
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Explain the reason for this update..."
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Value'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function KeyResults({ keyResults, onUpdateProgress }: KeyResultsProps) {
  const [selectedKeyResult, setSelectedKeyResult] = useState<KeyResult | null>(null);

  if (keyResults.length === 0) {
    return (
      <div className="text-sm text-gray-500 text-center py-4">
        No key results defined for this objective
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {keyResults.map((kr) => (
          <div key={kr.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">{kr.title}</h4>
              {onUpdateProgress && (
                <button
                  onClick={() => setSelectedKeyResult(kr)}
                  className="p-1 text-gray-400 hover:text-primary-600"
                  title="Update Progress"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-semibold text-gray-900">
                {kr.current}
              </span>
              <span className="ml-2 text-sm text-gray-500">
                of {kr.target} {kr.unit}
              </span>
            </div>
            <div className="mt-2 w-full h-2 bg-gray-200 rounded-full">
              <div
                className={`h-2 rounded-full ${
                  kr.progress >= 100 ? 'bg-green-500' : 
                  kr.progress >= 70 ? 'bg-blue-500' :
                  kr.progress >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${kr.progress}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Last updated: {new Date(kr.lastUpdated).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {selectedKeyResult && onUpdateProgress && (
        <UpdateModal
          keyResult={selectedKeyResult}
          onClose={() => setSelectedKeyResult(null)}
          onUpdate={async (value, comment) => {
            await onUpdateProgress(selectedKeyResult.id, value, comment);
          }}
        />
      )}
    </>
  );
}