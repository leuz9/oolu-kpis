import React, { useState, useEffect } from 'react';
import { X, Target, AlertTriangle } from 'lucide-react';
import { userService } from '../../services/userService';
import { objectiveService } from '../../services/objectiveService';
import BasicInformation from './components/ObjectiveForm/BasicInformation';
import Classification from './components/ObjectiveForm/Classification';
import Timeline from './components/ObjectiveForm/Timeline';
import Contributors from './components/ObjectiveForm/Contributors';
import KeyResults from './components/ObjectiveForm/KeyResults';
import FormActions from './components/ObjectiveForm/FormActions';
import ParentObjectiveSelect from './components/ObjectiveForm/ParentObjectiveSelect';
import type { User, Objective, KeyResult } from '../../types';

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
    quarter: `${new Date().getFullYear()}-Q${Math.floor(new Date().getMonth() / 3) + 1}`,
    parentId: parentObjective?.id || null,
    contributors: [],
    keyResults: []
  });

  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loadingObjectives, setLoadingObjectives] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [users, objectives] = await Promise.all([
        userService.getAllUsers(),
        objectiveService.getObjectives()
      ]);
      setUsers(users);
      setObjectives(objectives);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoadingUsers(false);
      setLoadingObjectives(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset error when changing level or parent
    if (field === 'level' || field === 'parentId') {
      setError(null);
    }
  };

  const handleUserSelect = (userId: string) => {
    const isSelected = formData.contributors.includes(userId);
    const newContributors = isSelected
      ? formData.contributors.filter((id: string) => id !== userId)
      : [...formData.contributors, userId];
    
    setFormData({ ...formData, contributors: newContributors });
  };

  const handleAddKeyResult = (keyResult: KeyResult) => {
    setFormData(prev => ({
      ...prev,
      keyResults: [...prev.keyResults, keyResult]
    }));
  };

  const handleRemoveKeyResult = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keyResults: prev.keyResults.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateKeyResult = (index: number, updates: Partial<KeyResult>) => {
    setFormData(prev => ({
      ...prev,
      keyResults: prev.keyResults.map((kr, i) => 
        i === index ? { ...kr, ...updates } : kr
      )
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation du parent obligatoire pour les niveaux department et individual
    if (formData.level !== 'company' && !formData.parentId) {
      setError('Please select a parent objective');
      return;
    }

    // Validation des contributeurs
    if (formData.contributors.length === 0) {
      setError('Please assign at least one contributor');
      return;
    }

    const objective = {
      ...formData,
      progress: 0,
      parentId: formData.parentId,
      departmentId: parentObjective?.departmentId || null,
      year: parseInt(formData.quarter.split('-')[0])
    };
    onSubmit(objective);
  };

  const filteredUsers = users.filter(user => {
    if (formData.level === 'department') {
      return user.department === formData.department;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90%] max-h-[95vh] overflow-y-auto">
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

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <p className="ml-3 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Basic Information</h3>
            <BasicInformation
              title={formData.title}
              description={formData.description}
              onChange={handleFieldChange}
            />
          </div>

          {/* Classification */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Classification</h3>
            <Classification
              level={formData.level}
              quarter={formData.quarter}
              department={formData.department}
              departments={Array.from(new Set(users.map(user => user.department))).filter(Boolean)}
              parentObjective={parentObjective}
              onChange={handleFieldChange}
            />
          </div>

          {/* Parent Objective */}
          {formData.level !== 'company' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Parent Objective</h3>
              <ParentObjectiveSelect
                objectives={objectives}
                selectedObjectiveId={formData.parentId}
                level={formData.level}
                onChange={(objectiveId) => handleFieldChange('parentId', objectiveId)}
                loading={loadingObjectives}
                error={error && !formData.parentId ? 'Parent objective is required' : null}
              />
            </div>
          )}

          {/* Key Results */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <KeyResults
              keyResults={formData.keyResults}
              onAdd={handleAddKeyResult}
              onRemove={handleRemoveKeyResult}
              onUpdate={handleUpdateKeyResult}
            />
          </div>

          {/* Timeline */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Timeline</h3>
            <Timeline
              dueDate={formData.dueDate}
              onChange={handleFieldChange}
            />
          </div>

          {/* Contributors */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Contributors</h3>
            <Contributors
              level={formData.level}
              contributors={formData.contributors}
              users={filteredUsers}
              loading={loadingUsers}
              onSelect={handleUserSelect}
            />
          </div>

          {/* Form Actions */}
          <FormActions
            onCancel={onClose}
            isEdit={!!initialData}
          />
        </form>
      </div>
    </div>
  );
}