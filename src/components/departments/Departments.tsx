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
  Search,
  Eye,
  EyeOff,
  Save,
  Activity,
  Clock,
  Target,
  PieChart,
  DollarSign,
  Mail,
  Phone,
  MapPin,
  Globe,
  Filter
} from 'lucide-react';
import DepartmentForm from './components/DepartmentForm';

interface Department {
  id: string;
  name: string;
  description: string;
  headCount: number;
  manager: string;
  managerEmail: string;
  managerPhone: string;
  budget: number;
  status: 'active' | 'restructuring' | 'inactive';
  location: string;
  website: string;
  objectives: any[];
  kpis: any[];
  teams: any[];
  createdAt: string;
  updatedAt: string;
}

export default function Departments() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Department['status']>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const fetchedDepartments = await departmentService.getDepartments();
      setDepartments(fetchedDepartments as Department[]);
    } catch (err) {
      setError('Failed to load departments. Please try again later.');
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async (departmentData: Partial<Department>) => {
    try {
      const newDepartment = await departmentService.addDepartment(departmentData);
      setDepartments(prev => [...prev, newDepartment as Department]);
      setSuccess('Department created successfully');
      setIsEditing(false);
      setEditingDepartment(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to create department. Please try again.');
      console.error('Error adding department:', err);
    }
  };

  const handleEditDepartment = async (departmentData: Partial<Department>) => {
    if (!editingDepartment?.id) return;

    try {
      await departmentService.updateDepartment(editingDepartment.id, departmentData);
      setDepartments(prev => prev.map(dept => 
        dept.id === editingDepartment.id ? { ...dept, ...departmentData } as Department : dept
      ));
      setSuccess('Department updated successfully');
      setIsEditing(false);
      setEditingDepartment(null);
      setTimeout(() => setSuccess(null), 3000);
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
      setSuccess('Department deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete department. Please try again.');
      console.error('Error deleting department:', err);
    }
  };

  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = 
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.manager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || dept.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Department['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'restructuring':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex-1 w-full ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out p-3 sm:p-4 lg:p-6`}>
        <div className="w-full">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your organization's departments and teams
              </p>
            </div>
            <button
              onClick={() => {
                setEditingDepartment(null);
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

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search departments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="restructuring">Restructuring</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {filteredDepartments.map((department) => (
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
                          onClick={() => setShowDetails(showDetails === department.id ? null : department.id)}
                          className="p-1 text-gray-400 hover:text-primary-600"
                          title={showDetails === department.id ? 'Hide Details' : 'Show Details'}
                        >
                          {showDetails === department.id ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setEditingDepartment(department);
                            setIsEditing(true);
                          }}
                          className="p-1 text-gray-400 hover:text-primary-600"
                          title="Edit Department"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(department.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Delete Department"
                        >
                          <Trash2 className="h-5 w-5" />
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
                    </div>

                    {showDetails === department.id && (
                      <div className="mt-6 space-y-6 border-t pt-6">
                        {/* Management Information */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-4">Management</h4>
                          <div className="space-y-3">
                            <div className="flex items-center text-sm">
                              <Users className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-600">Manager:</span>
                              <span className="ml-2 font-medium text-gray-900">{department.manager}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Mail className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-600">Email:</span>
                              <a href={`mailto:${department.managerEmail}`} className="ml-2 text-primary-600 hover:text-primary-700">
                                {department.managerEmail}
                              </a>
                            </div>
                            {department.managerPhone && (
                              <div className="flex items-center text-sm">
                                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-gray-600">Phone:</span>
                                <a href={`tel:${department.managerPhone}`} className="ml-2 text-primary-600 hover:text-primary-700">
                                  {department.managerPhone}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Location & Contact */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-4">Location & Contact</h4>
                          <div className="space-y-3">
                            {department.location && (
                              <div className="flex items-center text-sm">
                                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-gray-600">Location:</span>
                                <span className="ml-2 text-gray-900">{department.location}</span>
                              </div>
                            )}
                            {department.website && (
                              <div className="flex items-center text-sm">
                                <Globe className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-gray-600">Website:</span>
                                <a href={department.website} target="_blank" rel="noopener noreferrer" className="ml-2 text-primary-600 hover:text-primary-700">
                                  {department.website}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Metrics */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-4">Metrics</h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Target className="h-5 w-5 text-primary-600" />
                                  <span className="ml-2 text-sm text-gray-500">Objectives</span>
                                </div>
                                <span className="text-lg font-semibold text-gray-900">
                                  {department.objectives.length}
                                </span>
                              </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <PieChart className="h-5 w-5 text-primary-600" />
                                  <span className="ml-2 text-sm text-gray-500">KPIs</span>
                                </div>
                                <span className="text-lg font-semibold text-gray-900">
                                  {department.kpis.length}
                                </span>
                              </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Users className="h-5 w-5 text-primary-600" />
                                  <span className="ml-2 text-sm text-gray-500">Teams</span>
                                </div>
                                <span className="text-lg font-semibold text-gray-900">
                                  {department.teams.length}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Status & Activity */}
                        <div className="flex items-center justify-between text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(department.status)}`}>
                            {department.status.charAt(0).toUpperCase() + department.status.slice(1)}
                          </span>
                          <div className="flex items-center space-x-4 text-gray-500">
                            <div className="flex items-center">
                              <Activity className="h-4 w-4 mr-1" />
                              Created: {new Date(department.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              Updated: {new Date(department.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <DepartmentForm
          onSubmit={editingDepartment ? handleEditDepartment : handleAddDepartment}
          onClose={() => {
            setIsEditing(false);
            setEditingDepartment(null);
          }}
          initialData={editingDepartment}
        />
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