import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Users, 
  Play, 
  Pause, 
  Archive,
  Eye,
  Copy,
  Settings,
  CheckSquare,
  CheckCircle,
  X
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { AppraisalService } from '../../../services/appraisalService';
import { notificationService } from '../../../services/notificationService';
import { userService } from '../../../services/userService';
import { SuccessModal } from './SuccessModal';
import type { AppraisalCycle, User, AppraisalTemplate } from '../../../types';

const formatDate = (date: any): string => {
  if (!date) return 'N/A';
  try {
    // Handle Firestore Timestamp
    if (date?.toDate && typeof date.toDate === 'function') {
      return date.toDate().toLocaleDateString();
    }
    // Handle string or Date object
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'N/A';
    }
    return dateObj.toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

interface CycleManagementProps {
  cycles: AppraisalCycle[];
  onCyclesChange: (cycles: AppraisalCycle[]) => void;
  onRefresh: () => void;
}

export function CycleManagement({ cycles, onCyclesChange, onRefresh }: CycleManagementProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCycle, setEditingCycle] = useState<AppraisalCycle | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBulkCreateModal, setShowBulkCreateModal] = useState<AppraisalCycle | null>(null);
  const [successMessage, setSuccessMessage] = useState<{ title: string; message: string; details?: any[] } | null>(null);

  const handleCreateCycle = async (cycleData: Omit<AppraisalCycle, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      await AppraisalService.createCycle(cycleData);
      setShowCreateModal(false);
      setSuccessMessage({
        title: 'Cycle Created!',
        message: `${cycleData.name} has been successfully created.`,
        details: [
          { label: 'Year', value: cycleData.year },
          { label: 'Status', value: cycleData.status.charAt(0).toUpperCase() + cycleData.status.slice(1) }
        ]
      });
      onRefresh();

      // Optional: Notify admins about new cycle
      // Skipping broadcast to avoid heavy reads; can add if needed
    } catch (error) {
      console.error('Error creating cycle:', error);
      alert('Failed to create cycle');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCycle = async (id: string, updates: Partial<AppraisalCycle>) => {
    try {
      setLoading(true);
      await AppraisalService.updateCycle(id, updates);
      setEditingCycle(null);
      setSuccessMessage({
        title: 'Cycle Updated!',
        message: 'The appraisal cycle has been successfully updated.',
        details: []
      });
      onRefresh();
    } catch (error) {
      console.error('Error updating cycle:', error);
      alert('Failed to update cycle');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (cycle: AppraisalCycle, newStatus: AppraisalCycle['status']) => {
    await handleUpdateCycle(cycle.id, { status: newStatus });
  };

  const getStatusColor = (status: AppraisalCycle['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: AppraisalCycle['status']) => {
    switch (status) {
      case 'draft': return <Edit className="h-4 w-4" />;
      case 'active': return <Play className="h-4 w-4" />;
      case 'completed': return <Calendar className="h-4 w-4" />;
      case 'archived': return <Archive className="h-4 w-4" />;
      default: return <Edit className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Appraisal Cycles</h2>
          <p className="text-gray-600 mt-1">Manage annual appraisal cycles and their settings</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Create Cycle
        </button>
      </div>

      {/* Cycles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cycles.map((cycle) => (
          <div key={cycle.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{cycle.name}</h3>
                <p className="text-sm text-gray-600">{cycle.year}</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cycle.status)}`}>
                {getStatusIcon(cycle.status)}
                {cycle.status.charAt(0).toUpperCase() + cycle.status.slice(1)}
              </span>
            </div>

            {cycle.description && (
              <p className="text-sm text-gray-600 mb-4">{cycle.description}</p>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Start: {formatDate(cycle.startDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>End: {formatDate(cycle.endDate)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingCycle(cycle)}
                className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
              
              {cycle.status === 'draft' && (
                <button
                  onClick={() => handleStatusChange(cycle, 'active')}
                  className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                >
                  <Play className="h-4 w-4" />
                  Activate
                </button>
              )}
              
              {cycle.status === 'active' && (
                <button
                  onClick={() => handleStatusChange(cycle, 'completed')}
                  className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                >
                  <Pause className="h-4 w-4" />
                  Complete
                </button>
              )}
              
              <button
                onClick={() => setShowBulkCreateModal(cycle)}
                className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                title="Create appraisals for all employees"
              >
                <Users className="h-4 w-4" />
                Bulk Create
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingCycle) && (
        <CycleForm
          cycle={editingCycle}
          onSubmit={editingCycle ? 
            (data) => handleUpdateCycle(editingCycle.id, data) : 
            handleCreateCycle
          }
          onClose={() => {
            setShowCreateModal(false);
            setEditingCycle(null);
          }}
          loading={loading}
        />
      )}

      {/* Bulk Create Appraisals Modal */}
      {showBulkCreateModal && (
        <BulkCreateAppraisalsModal
          cycle={showBulkCreateModal}
          onClose={() => setShowBulkCreateModal(null)}
          onSuccess={async (count, importedCount) => {
            setShowBulkCreateModal(null);
            setSuccessMessage({
              title: 'Appraisals Created!',
              message: `Successfully created ${count} appraisal(s) for ${showBulkCreateModal.name}.`,
              details: [
                { label: 'Total Created', value: count },
                { label: 'With Objectives', value: importedCount },
                { label: 'Cycle', value: showBulkCreateModal.name }
              ]
            });
            onRefresh();

            try {
              // Notify created employees (optional summary only)
              // This would require the list of selected users; since it lives in the child modal,
              // we keep this as a future enhancement to avoid extra plumbing.
            } catch (e) {
              console.warn('Notification after bulk create skipped');
            }
          }}
        />
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={!!successMessage}
        title={successMessage?.title || ''}
        message={successMessage?.message || ''}
        details={successMessage?.details}
        icon="check"
        onClose={() => setSuccessMessage(null)}
      />
    </div>
  );
}

// Cycle Form Component
interface CycleFormProps {
  cycle?: AppraisalCycle | null;
  onSubmit: (data: Omit<AppraisalCycle, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
  loading: boolean;
}

function CycleForm({ cycle, onSubmit, onClose, loading }: CycleFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: cycle?.name || '',
    year: cycle?.year || new Date().getFullYear(),
    startDate: cycle?.startDate || '',
    endDate: cycle?.endDate || '',
    description: cycle?.description || '',
    status: cycle?.status || 'draft' as AppraisalCycle['status']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    onSubmit({
      ...formData,
      createdBy: user.id
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {cycle ? 'Edit Cycle' : 'Create New Cycle'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cycle Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : (cycle ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Bulk Create Appraisals Modal
interface BulkCreateAppraisalsModalProps {
  cycle: AppraisalCycle;
  onClose: () => void;
  onSuccess: (count: number, importedCount: number) => void;
}

function BulkCreateAppraisalsModal({ cycle, onClose, onSuccess }: BulkCreateAppraisalsModalProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [templates, setTemplates] = useState<AppraisalTemplate[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [importObjectives, setImportObjectives] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, templatesData] = await Promise.all([
        userService.getAllUsers(),
        AppraisalService.getTemplates()
      ]);
      setUsers(usersData);
      setTemplates(templatesData);
      
      // Select default template
      const defaultTemplate = templatesData.find(t => t.isDefault);
      if (defaultTemplate) {
        setSelectedTemplate(defaultTemplate.id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const departments = Array.from(new Set(users.map(u => u.department)));

  const filteredUsers = users.filter(u => 
    filterDepartment === 'all' || u.department === filterDepartment
  );

  const toggleUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const selectAll = () => {
    setSelectedUsers(filteredUsers.map(u => u.id));
  };

  const deselectAll = () => {
    setSelectedUsers([]);
  };

  const handleSubmit = async () => {
    if (selectedUsers.length === 0 || !selectedTemplate) {
      alert('Please select at least one employee and a template');
      return;
    }

    try {
      setLoading(true);
      
      // Create appraisals
      await AppraisalService.createAppraisalsForCycle(cycle.id, selectedUsers, selectedTemplate);
      
      // If import objectives is enabled, load objectives for each appraisal
      if (importObjectives) {
        const appraisals = await AppraisalService.getAppraisals(cycle.id);
        let importedCount = 0;
        
        for (const appraisal of appraisals) {
          if (selectedUsers.includes(appraisal.employeeId)) {
            try {
              const goals = await AppraisalService.importEmployeeObjectives(appraisal.employeeId);
              if (goals.length > 0) {
                await AppraisalService.updateGoals(appraisal.id, goals);
                importedCount++;
              }
            } catch (error) {
              console.error(`Error importing objectives for ${appraisal.employeeId}:`, error);
            }
          }
        }
        
        onSuccess(selectedUsers.length, importedCount);
      } else {
        onSuccess(selectedUsers.length, 0);
      }
    } catch (error) {
      console.error('Error creating appraisals:', error);
      alert('Failed to create appraisals');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Bulk Create Appraisals</h3>
            <p className="text-sm text-gray-600 mt-1">
              Create appraisals for {cycle.name} ({cycle.year})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Template *
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Choose a template...</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name} {template.isDefault && '(Default)'}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Department
            </label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* User Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Employees ({selectedUsers.length} selected)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="text-sm text-gray-600 hover:text-gray-700"
                >
                  Deselect All
                </button>
              </div>
            </div>

            <div className="border border-gray-300 rounded-md max-h-64 overflow-y-auto">
              {filteredUsers.map(user => (
                <label
                  key={user.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUser(user.id)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
                    <p className="text-xs text-gray-600">{user.email} • {user.department}</p>
                  </div>
                  <span className="text-xs text-gray-500">{user.role}</span>
                </label>
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <p className="text-center py-4 text-gray-500">No employees found</p>
            )}
          </div>

          {/* Import Objectives Option */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="importObjectives"
              checked={importObjectives}
              onChange={(e) => setImportObjectives(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="importObjectives" className="ml-2 block text-sm text-gray-900">
              Automatically import employee objectives as goals
            </label>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900 font-medium mb-1">
                  <strong>{selectedUsers.length}</strong> appraisal(s) will be created for the <strong>{cycle.name}</strong> cycle
                  {selectedTemplate && templates.find(t => t.id === selectedTemplate) && (
                    <> using the <strong>{templates.find(t => t.id === selectedTemplate)?.name}</strong> template</>
                  )}.
                </p>
                <ul className="text-xs text-blue-800 mt-2 space-y-1">
                  <li>✓ Each employee's manager will be automatically assigned</li>
                  {importObjectives && <li>✓ Employee objectives will be imported as goals</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || selectedUsers.length === 0 || !selectedTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            <CheckSquare className="h-4 w-4" />
            {loading ? 'Creating...' : `Create ${selectedUsers.length} Appraisals`}
          </button>
        </div>
      </div>
    </div>
  );
}
