import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import { departmentService } from '../../services/departmentService';
import { 
  Building2, 
  Users, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Target,
  PieChart,
  DollarSign
} from 'lucide-react';

interface Department {
  id: string;
  name: string;
  description: string;
  headCount: number;
  manager: string;
  budget: number;
  objectives: number;
  projects: number;
  performance: number;
  status: 'active' | 'restructuring' | 'inactive';
  teams: Array<{
    name: string;
    members: number;
    lead: string;
  }>;
  kpis: Array<{
    name: string;
    value: number;
    target: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

export default function Departments() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Partial<Department> | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const fetchedDepartments = await departmentService.getDepartments();
      setDepartments(fetchedDepartments);
    } catch (err) {
      setError('Failed to load departments. Please try again later.');
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async () => {
    try {
      const newDepartment = {
        name: editingDepartment?.name,
        description: editingDepartment?.description,
        headCount: parseInt(editingDepartment?.headCount?.toString() || '0'),
        manager: editingDepartment?.manager,
        budget: parseInt(editingDepartment?.budget?.toString() || '0'),
        objectives: 0,
        projects: 0,
        performance: 0,
        status: editingDepartment?.status || 'active',
        teams: [],
        kpis: []
      };

      const createdDepartment = await departmentService.addDepartment(newDepartment);
      setDepartments(prev => [...prev, createdDepartment]);
      setIsEditing(false);
      setEditingDepartment(null);
      setSuccess('Department created successfully');
    } catch (err) {
      setError('Failed to create department. Please try again.');
      console.error('Error adding department:', err);
    }
  };

  const handleEditDepartment = async (department: Department) => {
    try {
      const updatedDepartment = await departmentService.updateDepartment(department.id, {
        name: editingDepartment?.name,
        description: editingDepartment?.description,
        headCount: parseInt(editingDepartment?.headCount?.toString() || '0'),
        manager: editingDepartment?.manager,
        budget: parseInt(editingDepartment?.budget?.toString() || '0'),
        status: editingDepartment?.status
      });
      
      setDepartments(prev => prev.map(dept => 
        dept.id === department.id ? { ...dept, ...updatedDepartment } : dept
      ));
      setIsEditing(false);
      setEditingDepartment(null);
      setSuccess('Department updated successfully');
    } catch (err) {
      setError('Failed to update department. Please try again.');
      console.error('Error updating department:', err);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    try {
      await departmentService.deleteDepartment(id);
      setDepartments(prev => prev.filter(dept => dept.id !== id));
      setShowDeleteConfirm(null);
      if (selectedDepartment?.id === id) {
        setSelectedDepartment(null);
      }
      setSuccess('Department deleted successfully');
    } catch (err) {
      setError('Failed to delete department. Please try again.');
      console.error('Error deleting department:', err);
    }
  };

  const DepartmentForm = ({ onSubmit }: { onSubmit: (e: React.FormEvent) => Promise<void> }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {editingDepartment?.id ? 'Edit Department' : 'New Department'}
          </h3>
          <button
            onClick={() => {
              setIsEditing(false);
              setEditingDepartment(null);
            }}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Department Name</label>
            <input
              type="text"
              required
              value={editingDepartment?.name || ''}
              onChange={e => setEditingDepartment(prev => prev ? {...prev, name: e.target.value} : null)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={3}
              value={editingDepartment?.description || ''}
              onChange={e => setEditingDepartment(prev => prev ? {...prev, description: e.target.value} : null)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Head Count</label>
              <input
                type="number"
                min="0"
                value={editingDepartment?.headCount || ''}
                onChange={e => setEditingDepartment(prev => prev ? {...prev, headCount: e.target.value} : null)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Budget</label>
              <input
                type="number"
                min="0"
                value={editingDepartment?.budget || ''}
                onChange={e => setEditingDepartment(prev => prev ? {...prev, budget: e.target.value} : null)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Manager</label>
            <input
              type="text"
              value={editingDepartment?.manager || ''}
              onChange={e => setEditingDepartment(prev => prev ? {...prev, manager: e.target.value} : null)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={editingDepartment?.status || 'active'}
              onChange={e => setEditingDepartment(prev => prev ? {...prev, status: e.target.value as Department['status']} : null)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="active">Active</option>
              <option value="restructuring">Restructuring</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditingDepartment(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
            >
              {editingDepartment?.id ? 'Save Changes' : 'Create Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out p-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your organization's departments and teams
              </p>
            </div>
            <button
              onClick={() => {
                setEditingDepartment({
                  name: '',
                  description: '',
                  headCount: 0,
                  manager: '',
                  budget: 0,
                  status: 'active'
                });
                setIsEditing(true);
              }}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Department
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4 rounded">
              <div className="flex">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {departments.map((department) => (
                <div
                  key={department.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <Building2 className="h-6 w-6 text-primary-600" />
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">{department.name}</h3>
                          <p className="mt-1 text-sm text-gray-500">{department.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingDepartment(department);
                            setIsEditing(true);
                          }}
                          className="p-1 text-gray-400 hover:text-primary-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(department.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-gray-400" />
                          <span className="ml-2 text-sm font-medium text-gray-500">Head Count</span>
                        </div>
                        <p className="mt-2 text-2xl font-semibold text-gray-900">{department.headCount}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <DollarSign className="h-5 w-5 text-gray-400" />
                          <span className="ml-2 text-sm font-medium text-gray-500">Budget</span>
                        </div>
                        <p className="mt-2 text-2xl font-semibold text-gray-900">${department.budget.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <Target className="h-5 w-5 text-gray-400" />
                          <span className="ml-2 text-sm font-medium text-gray-500">Objectives</span>
                        </div>
                        <p className="mt-2 text-2xl font-semibold text-gray-900">{department.objectives}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <PieChart className="h-5 w-5 text-gray-400" />
                          <span className="ml-2 text-sm font-medium text-gray-500">Performance</span>
                        </div>
                        <p className="mt-2 text-2xl font-semibold text-gray-900">{department.performance}%</p>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        Manager: {department.manager}
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        department.status === 'active' ? 'bg-green-100 text-green-800' :
                        department.status === 'restructuring' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {department.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isEditing && editingDepartment && (
        <DepartmentForm onSubmit={editingDepartment.id ? () => handleEditDepartment(editingDepartment as Department) : handleAddDepartment} />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete Department</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this department? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDepartment(showDeleteConfirm)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}