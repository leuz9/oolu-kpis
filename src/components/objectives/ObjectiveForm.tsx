import React, { useState, useEffect } from 'react';
import { X, Plus, Target, AlertTriangle } from 'lucide-react';
import { kpiService } from '../../services/kpiService';
import { userService } from '../../services/userService';
import { objectiveService } from '../../services/objectiveService';
import KPIForm from '../kpis/components/KPIForm';
import BasicInformation from './components/ObjectiveForm/BasicInformation';
import Classification from './components/ObjectiveForm/Classification';
import Timeline from './components/ObjectiveForm/Timeline';
import Contributors from './components/ObjectiveForm/Contributors';
import LinkedKPIs from './components/ObjectiveForm/LinkedKPIs';
import FormActions from './components/ObjectiveForm/FormActions';
import ParentObjectiveSelect from './components/ObjectiveForm/ParentObjectiveSelect';
import type { KPI, User, Objective } from '../../types';

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
    kpiIds: [],
    contributors: []
  });

  const [availableKPIs, setAvailableKPIs] = useState<KPI[]>([]);
  const [selectedKPIs, setSelectedKPIs] = useState<KPI[]>([]);
  const [loadingKPIs, setLoadingKPIs] = useState(true);
  const [showKPIForm, setShowKPIForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loadingObjectives, setLoadingObjectives] = useState(true);

  useEffect(() => {
    fetchKPIs();
    fetchUsers();
    fetchObjectives();
  }, []);

  useEffect(() => {
    if (initialData?.kpiIds) {
      loadSelectedKPIs(initialData.kpiIds);
    }
  }, [initialData?.kpiIds]);

  const fetchKPIs = async () => {
    try {
      setLoadingKPIs(true);
      const kpis = await kpiService.getKPIs();
      setAvailableKPIs(kpis);
    } catch (err) {
      console.error('Error fetching KPIs:', err);
      setError('Failed to load KPIs');
    } finally {
      setLoadingKPIs(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const fetchedUsers = await userService.getAllUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchObjectives = async () => {
    try {
      setLoadingObjectives(true);
      const fetchedObjectives = await objectiveService.getObjectives();
      setObjectives(fetchedObjectives);
    } catch (err) {
      console.error('Error fetching objectives:', err);
      setError('Failed to load objectives');
    } finally {
      setLoadingObjectives(false);
    }
  };

  const loadSelectedKPIs = async (kpiIds: string[]) => {
    try {
      const kpis = await Promise.all(
        kpiIds.map(id => kpiService.getKPIsByObjective(id))
      );
      setSelectedKPIs(kpis.flat());
    } catch (err) {
      console.error('Error loading selected KPIs:', err);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset error when changing level or parent
    if (field === 'level' || field === 'parentId') {
      setError(null);
    }
  };

  const handleKPISelect = async (kpiId: string) => {
    try {
      const isSelected = formData.kpiIds.includes(kpiId);
      const newKpiIds = isSelected
        ? formData.kpiIds.filter(id => id !== kpiId)
        : [...formData.kpiIds, kpiId];
      
      setFormData({ ...formData, kpiIds: newKpiIds });

      // Update KPI's objectiveIds
      const kpi = availableKPIs.find(k => k.id === kpiId);
      if (kpi) {
        await kpiService.updateKPI(kpiId, {
          ...kpi,
          objectiveIds: isSelected
            ? kpi.objectiveIds.filter(id => id !== formData.id)
            : [...(kpi.objectiveIds || []), formData.id]
        });
      }
    } catch (err) {
      console.error('Error updating KPI:', err);
      setError('Failed to update KPI linkage');
    }
  };

  const handleUserSelect = (userId: string) => {
    const isSelected = formData.contributors.includes(userId);
    const newContributors = isSelected
      ? formData.contributors.filter((id: string) => id !== userId)
      : [...formData.contributors, userId];
    
    setFormData({ ...formData, contributors: newContributors });
  };

  const handleCreateKPI = async (kpiData: Partial<KPI>) => {
    try {
      // Add current objective ID to the KPI's objectiveIds
      const newKPI = await kpiService.addKPI({
        ...kpiData,
        objectiveIds: formData.id ? [formData.id] : []
      } as KPI);
      
      setAvailableKPIs(prev => [...prev, newKPI]);
      handleKPISelect(newKPI.id);
      setShowKPIForm(false);
    } catch (err) {
      console.error('Error creating KPI:', err);
      setError('Failed to create KPI');
    }
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
    if (formData.level !== 'company' && formData.contributors.length === 0) {
      setError('Please assign at least one user to this objective');
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

          {/* Timeline */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Timeline</h3>
            <Timeline
              dueDate={formData.dueDate}
              onChange={handleFieldChange}
            />
          </div>

          {/* Contributors */}
          {formData.level !== 'company' && (
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
          )}

          {/* KPIs */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Key Performance Indicators</h3>
            <LinkedKPIs
              kpis={availableKPIs}
              selectedKPIs={formData.kpiIds}
              loading={loadingKPIs}
              onSelect={handleKPISelect}
              onCreateNew={() => setShowKPIForm(true)}
            />
          </div>

          {/* Form Actions */}
          <FormActions
            onCancel={onClose}
            isEdit={!!initialData}
          />
        </form>
      </div>

      {showKPIForm && (
        <KPIForm
          onClose={() => setShowKPIForm(false)}
          onSubmit={handleCreateKPI}
          initialData={{
            objectiveIds: formData.id ? [formData.id] : []
          }}
        />
      )}
    </div>
  );
}