import React, { useState } from 'react';
import { X, Plus, Minus, TrendingUp, TrendingDown } from 'lucide-react';
import type { Objective } from '../../../types';

interface ProgressUpdateModalProps {
  objective: Objective;
  onClose: () => void;
  onUpdate: (progress: number, comment: string) => Promise<void>;
}

export default function ProgressUpdateModal({ objective, onClose, onUpdate }: ProgressUpdateModalProps) {
  const [progress, setProgress] = useState(objective.progress);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide a comment for this update');
      return;
    }

    try {
      setLoading(true);
      await onUpdate(progress, comment);
      onClose();
    } catch (err) {
      setError('Failed to update progress. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const adjustProgress = (amount: number) => {
    setProgress(prev => Math.min(Math.max(prev + amount, 0), 100));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Update Progress</h3>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Progress
            </label>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => adjustProgress(-5)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <Minus className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex-1">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-100">
                        {progress}%
                      </span>
                    </div>
                    <div className="flex items-center">
                      {progress > objective.progress ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : progress < objective.progress ? (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      ) : null}
                      <span className="text-xs font-semibold text-gray-600">
                        {progress > objective.progress ? '+' : ''}
                        {progress - objective.progress}%
                      </span>
                    </div>
                  </div>
                  <div className="flex mb-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={(e) => setProgress(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => adjustProgress(5)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <Plus className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Comment
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Explain the reason for this progress update..."
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
              {loading ? 'Updating...' : 'Update Progress'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}