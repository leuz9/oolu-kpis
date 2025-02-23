import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { KPI } from '../../../types';

interface UpdateModalProps {
  kpi: KPI;
  onClose: () => void;
  onUpdate: (kpiId: string, value: number, comment: string) => Promise<void>;
}

export default function UpdateModal({ kpi, onClose, onUpdate }: UpdateModalProps) {
  const [value, setValue] = useState(kpi.value.toString());
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
      await onUpdate(kpi.id, numValue, comment);
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
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {kpi.name}
            </label>
            <div className="mt-1 text-sm text-gray-500">
              Current value: {kpi.value} {kpi.unit}
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
                <span className="text-gray-500 sm:text-sm">{kpi.unit}</span>
              </div>
            </div>
          </div>

          {value !== kpi.value.toString() && (
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-500">Change:</span>
              {getTrendIndicator(parseFloat(value), kpi.value)}
              <span className={`font-medium ${
                parseFloat(value) > kpi.value ? 'text-green-600' : 
                parseFloat(value) < kpi.value ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                {Math.abs(parseFloat(value) - kpi.value).toFixed(2)} {kpi.unit}
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