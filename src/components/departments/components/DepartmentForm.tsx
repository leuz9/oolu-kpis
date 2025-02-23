import React, { useState, useEffect } from 'react';
import { X, Building2, Users, DollarSign, Target, PieChart, Calendar, Mail, Phone, MapPin, Globe, AlertTriangle } from 'lucide-react';
import { userService } from '../../../services/userService';
import type { Department, User } from '../../../types';

interface DepartmentFormProps {
  onSubmit: (departmentData: Partial<Department>) => Promise<void>;
  onClose: () => void;
  initialData?: Department;
}

export default function DepartmentForm({ onSubmit, onClose, initialData }: DepartmentFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    headCount: initialData?.headCount || 0,
    budget: initialData?.budget || 0,
    manager: initialData?.manager || '',
    managerEmail: initialData?.managerEmail || '',
    managerPhone: initialData?.managerPhone || '',
    location: initialData?.location || '',
    website: initialData?.website || '',
    status: initialData?.status || 'active',
    objectives: initialData?.objectives || [],
    kpis: initialData?.kpis || [],
    teams: initialData?.teams || []
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState<User[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(true);

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      setLoadingManagers(true);
      const users = await userService.getAllUsers();
      // Filtrer uniquement les utilisateurs avec le rôle manager
      const managerUsers = users.filter(user => user.role === 'manager');
      setManagers(managerUsers);
    } catch (err) {
      console.error('Error fetching managers:', err);
      setError('Failed to load managers');
    } finally {
      setLoadingManagers(false);
    }
  };

  const handleManagerSelect = (managerId: string) => {
    const selectedManager = managers.find(m => m.id === managerId);
    if (selectedManager) {
      setFormData(prev => ({
        ...prev,
        manager: selectedManager.displayName || '',
        managerEmail: selectedManager.email,
        managerPhone: selectedManager.phone || '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Department name is required');
      return;
    }

    if (!formData.manager.trim()) {
      setError('Department manager is required');
      return;
    }

    if (!formData.managerEmail.trim()) {
      setError('Manager email is required');
      return;
    }

    if (formData.headCount < 0) {
      setError('Head count cannot be negative');
      return;
    }

    if (formData.budget < 0) {
      setError('Budget cannot be negative');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error('Error submitting department:', err);
      setError('Failed to save department. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Building2 className="h-6 w-6 text-primary-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              {initialData ? 'Edit Department' : 'Create New Department'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <p className="ml-3 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center">
              <Building2 className="h-4 w-4 mr-2 text-primary-600" />
              Basic Information
            </h4>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Department Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="e.g., Engineering"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Describe the department's purpose and responsibilities"
                />
              </div>
            </div>
          </div>

          {/* Management */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center">
              <Users className="h-4 w-4 mr-2 text-primary-600" />
              Management
            </h4>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Department Manager</label>
                {loadingManagers ? (
                  <div className="mt-1 flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                    <span className="ml-2 text-sm text-gray-500">Loading managers...</span>
                  </div>
                ) : (
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    onChange={(e) => handleManagerSelect(e.target.value)}
                    value={managers.find(m => m.email === formData.managerEmail)?.id || ''}
                    required
                  >
                    <option value="">Select a manager</option>
                    {managers.map(manager => (
                      <option key={manager.id} value={manager.id}>
                        {manager.displayName} ({manager.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Manager Email</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={formData.managerEmail}
                    readOnly
                    className="block w-full pl-10 rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="manager@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Manager Phone</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={formData.managerPhone}
                    readOnly
                    className="block w-full pl-10 rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as Department['status'] })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="active">Active</option>
                  <option value="restructuring">Restructuring</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-primary-600" />
              Resources
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Head Count</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={formData.headCount}
                    onChange={e => setFormData({ ...formData, headCount: parseInt(e.target.value) })}
                    className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Number of employees"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Budget</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={formData.budget}
                    onChange={e => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                    className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Annual budget"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location & Contact */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-primary-600" />
              Location & Contact
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Office location"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Website</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                    className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="https://example.com/department"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6">
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
              {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Create Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}