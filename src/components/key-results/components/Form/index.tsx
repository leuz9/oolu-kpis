import React, { useState } from 'react';
import { Target, Calendar, Building2, Users, TrendingUp, TrendingDown, Minus, AlertTriangle, Plus } from 'lucide-react';
import FormHeader from './FormHeader';
import ErrorAlert from './ErrorAlert';
import BasicInformation from './BasicInformation';
import CategoryAndFrequency from './CategoryAndFrequency';
import ValuesAndUnits from './ValuesAndUnits';
import DateInputs from './DateInputs';
import StatusPreview from './StatusPreview';
import FormActions from './FormActions';
import { calculateTrend, calculateStatus } from './utils';
import type { KPI, User } from '../../../../types';

interface FormProps {
  onClose: () => void;
  onSubmit: (kpi: Partial<KPI>) => Promise<void>;
  initialData?: Partial<KPI>;
  availableUsers: User[];
}

export default function Form({ onClose, onSubmit, initialData, availableUsers }: FormProps) {
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
    objectiveIds: [],
    owner: '',
    department: '',
    contributors: []
  });

  const [customUnit, setCustomUnit] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name?.trim()) {
      setError('Key result name is required');
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
      setError('Failed to save key result. Please try again.');
      console.error('Error saving key result:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (value: number) => {
    setFormData({
      ...formData,
      value,
      trend: calculateTrend(value, formData.value || 0),
      status: calculateStatus(value, formData.target || 0)
    });
  };

  const handleTargetChange = (target: number) => {
    setFormData({
      ...formData,
      target,
      status: calculateStatus(formData.value || 0, target)
    });
  };

  const handleContributorToggle = (userId: string) => {
    const contributors = formData.contributors || [];
    const newContributors = contributors.includes(userId)
      ? contributors.filter(id => id !== userId)
      : [...contributors, userId];
    
    setFormData({
      ...formData,
      contributors: newContributors
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <FormHeader
          title={initialData ? 'Edit Key Result' : 'Create New Key Result'}
          onClose={onClose}
        />

        <ErrorAlert error={error} />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
              <Target className="h-4 w-4 mr-2 text-primary-600" />
              Basic Information
            </h3>
            <BasicInformation
              name={formData.name || ''}
              description={formData.description || ''}
              onChange={(field, value) => setFormData({ ...formData, [field]: value })}
            />
          </div>

          {/* Category and Frequency Section */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
              <Building2 className="h-4 w-4 mr-2 text-primary-600" />
              Classification
            </h3>
            <CategoryAndFrequency
              category={formData.category || ''}
              frequency={formData.frequency || 'monthly'}
              onChange={(field, value) => setFormData({ ...formData, [field]: value })}
            />
          </div>

          {/* Contributors Section */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
              <Users className="h-4 w-4 mr-2 text-primary-600" />
              Contributors
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleContributorToggle(user.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    formData.contributors?.includes(user.id)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || ''}
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-medium text-sm">
                            {user.displayName?.charAt(0) || user.email.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.displayName || user.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.role}
                        {user.department && ` • ${user.department}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Values and Units Section */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-primary-600" />
              Measurement
            </h3>
            <ValuesAndUnits
              value={formData.value || 0}
              target={formData.target || 0}
              unit={formData.unit || '%'}
              customUnit={customUnit}
              onValueChange={handleValueChange}
              onTargetChange={handleTargetChange}
              onUnitChange={(unit) => setFormData({ ...formData, unit })}
              onCustomUnitChange={setCustomUnit}
            />
          </div>

          {/* Dates Section */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-primary-600" />
              Timeline
            </h3>
            <DateInputs
              startDate={formData.startDate?.split('T')[0] || ''}
              dueDate={formData.dueDate?.split('T')[0] || ''}
              onChange={(field, value) => setFormData({ ...formData, [field]: value })}
            />
          </div>

          {/* Advanced Settings */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-sm font-medium text-gray-700 hover:text-primary-600"
            >
              {showAdvanced ? (
                <Minus className="h-4 w-4 mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Advanced Settings
            </button>

            {showAdvanced && (
              <div className="space-y-4 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Owner</label>
                  <input
                    type="text"
                    value={formData.owner || ''}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Key result owner"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <input
                    type="text"
                    value={formData.department || ''}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Responsible department"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-primary-600" />
              Preview
            </h3>
            <StatusPreview
              trend={formData.trend || 'stable'}
              value={formData.value || 0}
              target={formData.target || 0}
              status={formData.status || 'on-track'}
            />
          </div>

          <FormActions
            loading={loading}
            isEdit={!!initialData}
            onCancel={onClose}
          />
        </form>
      </div>
    </div>
  );
}