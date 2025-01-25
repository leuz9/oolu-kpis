import React, { useState, useEffect } from 'react';
import { X, Plus, Target, AlertTriangle, Users } from 'lucide-react';
import { kpiService } from '../../services/kpiService';
import { userService } from '../../services/userService';
import KPIForm from '../kpis/components/KPIForm';
import type { KPI, User } from '../../types';

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

  useEffect(() => {
    fetchKPIs();
    fetchUsers();
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

  const handleKPISelect = (kpiId: string) => {
    const isSelected = formData.kpiIds.includes(kpiId);
    const newKpiIds = isSelected
      ? formData.kpiIds.filter(id => id !== kpiId)
      : [...formData.kpiIds, kpiId];
    
    setFormData({ ...formData, kpiIds: newKpiIds });
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
      const newKPI = await kpiService.addKPI(kpiData as KPI);
      setAvailableKPIs(prev => [...prev, newKPI]);
      handleKPISelect(newKPI.id); // Automatically select the newly created KPI
      setShowKPIForm(false);
    } catch (err) {
      console.error('Error creating KPI:', err);
      setError('Failed to create KPI');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate user assignments based on level
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

              {formData.level === 'department' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select Department</option>
                    {Array.from(new Set(users.map(user => user.department))).filter(Boolean).map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              )}

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

            {/* Contributors Section */}
            {formData.level !== 'company' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">
                    {formData.level === 'department' ? 'Department Members' : 'Assignee'}
                  </label>
                  <span className="text-sm text-gray-500">
                    {formData.contributors.length} selected
                  </span>
                </div>

                {loadingUsers ? (
                  <div className="flex items-center justify-center h-20">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className={`p-4 rounded-lg border ${
                          formData.contributors.includes(user.id)
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-300'
                        } cursor-pointer transition-colors`}
                        onClick={() => handleUserSelect(user.id)}
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
                              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-indigo-600 font-medium text-sm">
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
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* KPIs Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Key Performance Indicators</label>
                <button
                  type="button"
                  onClick={() => setShowKPIForm(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create New KPI
                </button>
              </div>

              {loadingKPIs ? (
                <div className="flex items-center justify-center h-20">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableKPIs.map((kpi) => (
                    <div
                      key={kpi.id}
                      className={`p-4 rounded-lg border ${
                        formData.kpiIds.includes(kpi.id)
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      } cursor-pointer transition-colors`}
                      onClick={() => handleKPISelect(kpi.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{kpi.name}</h4>
                          <p className="text-xs text-gray-500">{kpi.category}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            kpi.status === 'on-track' ? 'bg-green-100 text-green-800' :
                            kpi.status === 'at-risk' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {kpi.status.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{kpi.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full">
                          <div
                            className="h-1.5 bg-indigo-600 rounded-full"
                            style={{ width: `${kpi.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

      {showKPIForm && (
        <KPIForm
          onClose={() => setShowKPIForm(false)}
          onSubmit={handleCreateKPI}
        />
      )}
    </div>
  );
}