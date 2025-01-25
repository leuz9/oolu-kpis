import React, { useState } from 'react';
import { X, Target, Calendar, Building2, User, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import type { KPI } from '../../../types';

interface KPIFormProps {
  onClose: () => void;
  onSubmit: (kpi: Partial<KPI>) => Promise<void>;
  initialData?: Partial<KPI>;
}

const CATEGORIES = [
  'Financial',
  'Customer',
  'Internal Process',
  'Learning & Growth',
  'Sales',
  'Marketing',
  'Operations',
  'Product',
  'Engineering',
  'Support',
  'HR',
  'Other'
];

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' }
];

const UNITS = [
  { value: '%', label: 'Percentage' },
  { value: '$', label: 'Currency (USD)' },
  { value: '#', label: 'Count' },
  { value: 'hrs', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'pts', label: 'Points' },
  { value: 'custom', label: 'Custom Unit' }
];

export default function KPIForm({ onClose, onSubmit, initialData }: KPIFormProps) {
  const [formData, setFormData] = useState<Partial<KPI>>(initialData || {
    name: '',
    description: '',
    value: 0,
    target: 0,
    unit: '%',
    frequency: 'monthly',
    trend: 'stable',
    status: 'on-track',
    category: '',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    history: [],
    objectiveIds: []
  });
  const [customUnit, setCustomUnit] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name?.trim()) {
      setError('KPI name is required');
      return;
    }

    if (!formData.category) {
      setError('Please select a category');
      return;
    }

    if (formData.target <= 0) {
      setError('Target value must be greater than 0');
      return;
    }

    if (!formData.dueDate) {
      setError('Due date is required');
      return;
    }

    if (new Date(formData.dueDate) <= new Date(formData.startDate!)) {
      setError('Due date must be after start date');
      return;
    }

    try {
      setLoading(true);
      const kpiData = {
        ...formData,
        unit: formData.unit === 'custom' ? customUnit : formData.unit,
        progress: Math.min(100, Math.round((formData.value! / formData.target!) * 100)),
        lastUpdated: new Date().toISOString()
      };
      await onSubmit(kpiData);
      onClose();
    } catch (err) {
      setError('Failed to save KPI. Please try again.');
      console.error('Error saving KPI:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTrend = (newValue: number) => {
    if (newValue > (formData.value || 0)) return 'up';
    if (newValue < (formData.value || 0)) return 'down';
    return 'stable';
  };

  const calculateStatus = (value: number, target: number) => {
    const progress = (value / target) * 100;
    if (progress >= 90) return 'on-track';
    if (progress >= 60) return 'at-risk';
    return 'behind';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {initialData ? 'Edit KPI' : 'Create New KPI'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Define and track your key performance indicators
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700">KPI Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="e.g., Customer Satisfaction Score"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Describe what this KPI measures and why it's important"
            />
          </div>

          {/* Category and Frequency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={formData.category || ''}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">Select Category</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Measurement Frequency</label>
              <select
                value={formData.frequency || 'monthly'}
                onChange={e => setFormData({ ...formData, frequency: e.target.value as KPI['frequency'] })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                {FREQUENCIES.map(freq => (
                  <option key={freq.value} value={freq.value}>{freq.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Values and Units */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Value</label>
              <input
                type="number"
                step="0.01"
                value={formData.value || 0}
                onChange={e => {
                  const value = parseFloat(e.target.value);
                  setFormData({
                    ...formData,
                    value,
                    trend: calculateTrend(value),
                    status: calculateStatus(value, formData.target || 0)
                  });
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Target Value</label>
              <input
                type="number"
                step="0.01"
                value={formData.target || 0}
                onChange={e => {
                  const target = parseFloat(e.target.value);
                  setFormData({
                    ...formData,
                    target,
                    status: calculateStatus(formData.value || 0, target)
                  });
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Unit</label>
              <select
                value={formData.unit || '%'}
                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                {UNITS.map(unit => (
                  <option key={unit.value} value={unit.value}>{unit.label}</option>
                ))}
              </select>
              {formData.unit === 'custom' && (
                <input
                  type="text"
                  value={customUnit}
                  onChange={e => setCustomUnit(e.target.value)}
                  placeholder="Enter custom unit"
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={formData.startDate?.split('T')[0] || ''}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input
                type="date"
                value={formData.dueDate?.split('T')[0] || ''}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Status Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">KPI Status Preview</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-500">Trend:</div>
                <div className="flex items-center">
                  {getTrendIcon(formData.trend || 'stable')}
                  <span className="ml-1 text-sm font-medium capitalize">
                    {formData.trend || 'stable'}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Progress:</div>
                <div className="mt-1">
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-primary-600 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.round((formData.value || 0) / (formData.target || 1) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Status:</div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  formData.status === 'on-track' ? 'bg-green-100 text-green-800' :
                  formData.status === 'at-risk' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {formData.status?.replace('-', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
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
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  {initialData ? 'Save Changes' : 'Create KPI'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}