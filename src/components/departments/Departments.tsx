import React, { useState } from 'react';
import Sidebar from '../Sidebar';
import { 
  Building2, 
  Users, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  ChevronRight, 
  BarChart3,
  Target,
  Briefcase,
  AlertTriangle,
  CheckCircle2
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

const sampleDepartments: Department[] = [
  {
    id: '1',
    name: 'Engineering',
    description: 'Software development and technical operations',
    headCount: 45,
    manager: 'John Smith',
    budget: 1500000,
    objectives: 8,
    projects: 12,
    performance: 92,
    status: 'active',
    teams: [
      { name: 'Frontend', members: 12, lead: 'Sarah Johnson' },
      { name: 'Backend', members: 15, lead: 'Michael Chen' },
      { name: 'DevOps', members: 8, lead: 'David Wilson' },
      { name: 'QA', members: 10, lead: 'Emma Davis' }
    ],
    kpis: [
      { name: 'Sprint Velocity', value: 85, target: 80, trend: 'up' },
      { name: 'Code Coverage', value: 92, target: 90, trend: 'up' },
      { name: 'Bug Resolution Time', value: 2.5, target: 3, trend: 'down' }
    ]
  },
  {
    id: '2',
    name: 'Sales',
    description: 'Revenue generation and client relationships',
    headCount: 30,
    manager: 'Emily Brown',
    budget: 2000000,
    objectives: 6,
    projects: 8,
    performance: 88,
    status: 'active',
    teams: [
      { name: 'Direct Sales', members: 15, lead: 'Robert Taylor' },
      { name: 'Account Management', members: 10, lead: 'Lisa Anderson' },
      { name: 'Business Development', members: 5, lead: 'James Martin' }
    ],
    kpis: [
      { name: 'Revenue Growth', value: 15, target: 20, trend: 'up' },
      { name: 'Customer Acquisition', value: 45, target: 50, trend: 'up' },
      { name: 'Deal Closure Rate', value: 35, target: 40, trend: 'stable' }
    ]
  },
  {
    id: '3',
    name: 'Marketing',
    description: 'Brand management and market presence',
    headCount: 25,
    manager: 'Alex Turner',
    budget: 1000000,
    objectives: 5,
    projects: 7,
    performance: 85,
    status: 'active',
    teams: [
      { name: 'Digital Marketing', members: 8, lead: 'Sophie Clark' },
      { name: 'Content', members: 6, lead: 'Daniel Lee' },
      { name: 'Brand Management', members: 5, lead: 'Rachel Green' },
      { name: 'Events', members: 6, lead: 'Tom Baker' }
    ],
    kpis: [
      { name: 'Lead Generation', value: 250, target: 300, trend: 'up' },
      { name: 'Website Traffic', value: 180000, target: 200000, trend: 'up' },
      { name: 'Conversion Rate', value: 2.8, target: 3, trend: 'stable' }
    ]
  }
];

export default function Departments() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [departments, setDepartments] = useState(sampleDepartments);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleAddDepartment = () => {
    setEditingDepartment({
      id: '',
      name: '',
      description: '',
      headCount: 0,
      manager: '',
      budget: 0,
      objectives: 0,
      projects: 0,
      performance: 0,
      status: 'active',
      teams: [],
      kpis: []
    });
    setIsEditing(true);
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setIsEditing(true);
  };

  const handleDeleteDepartment = (id: string) => {
    setDepartments(prev => prev.filter(dept => dept.id !== id));
    setShowDeleteConfirm(null);
    if (selectedDepartment?.id === id) {
      setSelectedDepartment(null);
    }
  };

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

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ChevronRight className="h-4 w-4 text-green-500 transform rotate-[-90deg]" />;
      case 'down':
        return <ChevronRight className="h-4 w-4 text-red-500 transform rotate-90" />;
      case 'stable':
        return <ChevronRight className="h-4 w-4 text-gray-500" />;
    }
  };

  const DepartmentForm = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            {editingDepartment?.id ? 'Edit Department' : 'Add Department'}
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

        <form className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Department Name</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={editingDepartment?.name || ''}
                onChange={(e) => setEditingDepartment(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={editingDepartment?.description || ''}
                onChange={(e) => setEditingDepartment(prev => prev ? { ...prev, description: e.target.value } : null)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Manager</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={editingDepartment?.manager || ''}
                  onChange={(e) => setEditingDepartment(prev => prev ? { ...prev, manager: e.target.value } : null)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={editingDepartment?.status || 'active'}
                  onChange={(e) => setEditingDepartment(prev => prev ? { ...prev, status: e.target.value as Department['status'] } : null)}
                >
                  <option value="active">Active</option>
                  <option value="restructuring">Restructuring</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Head Count</label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={editingDepartment?.headCount || 0}
                  onChange={(e) => setEditingDepartment(prev => prev ? { ...prev, headCount: parseInt(e.target.value) } : null)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Budget</label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={editingDepartment?.budget || 0}
                  onChange={(e) => setEditingDepartment(prev => prev ? { ...prev, budget: parseInt(e.target.value) } : null)}
                />
              </div>
            </div>
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
              {editingDepartment?.id ? 'Save Changes' : 'Add Department'}
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
              onClick={handleAddDepartment}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Department
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Departments List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">All Departments</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {departments.map((department) => (
                    <div
                      key={department.id}
                      onClick={() => setSelectedDepartment(department)}
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${
                        selectedDepartment?.id === department.id ? 'bg-primary-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Building2 className="h-5 w-5 text-gray-400" />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{department.name}</p>
                            <p className="text-sm text-gray-500">{department.headCount} members</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(department.status)}`}>
                          {department.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Department Details */}
            <div className="lg:col-span-2">
              {selectedDepartment ? (
                <div className="bg-white rounded-lg shadow-sm">
                  {/* Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedDepartment.name}</h2>
                        <p className="mt-1 text-gray-500">{selectedDepartment.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditDepartment(selectedDepartment)}
                          className="p-2 text-gray-400 hover:text-gray-500"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(selectedDepartment.id)}
                          className="p-2 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-gray-400" />
                          <p className="ml-2 text-sm font-medium text-gray-500">Head Count</p>
                        </div>
                        <p className="mt-2 text-2xl font-semibold text-gray-900">{selectedDepartment.headCount}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <Target className="h-5 w-5 text-gray-400" />
                          <p className="ml-2 text-sm font-medium text-gray-500">Objectives</p>
                        </div>
                        <p className="mt-2 text-2xl font-semibold text-gray-900">{selectedDepartment.objectives}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <Briefcase className="h-5 w-5 text-gray-400" />
                          <p className="ml-2 text-sm font-medium text-gray-500">Projects</p>
                        </div>
                        <p className="mt-2 text-2xl font-semibold text-gray-900">{selectedDepartment.projects}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <BarChart3 className="h-5 w-5 text-gray-400" />
                          <p className="ml-2 text-sm font-medium text-gray-500">Performance</p>
                        </div>
                        <p className="mt-2 text-2xl font-semibold text-gray-900">{selectedDepartment.performance}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Teams */}
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Teams</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {selectedDepartment.teams.map((team, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-900">{team.name}</h4>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <Users className="h-4 w-4 mr-1" />
                            {team.members} members
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            Lead: {team.lead}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* KPIs */}
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Key Performance Indicators</h3>
                    <div className="space-y-4">
                      {selectedDepartment.kpis.map((kpi, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900">{kpi.name}</h4>
                            <div className="flex items-center">
                              {getTrendIcon(kpi.trend)}
                              <span className="ml-2 text-sm font-medium text-gray-900">
                                {kpi.value} / {kpi.target}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="relative pt-1">
                              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                                <div
                                  style={{ width: `${(kpi.value / kpi.target) * 100}%` }}
                                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center justify-center text-center h-96">
                  <Building2 className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Department Selected</h3>
                  <p className="text-gray-500">Select a department from the list to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isEditing && editingDepartment && <DepartmentForm />}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Delete Department</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Are you sure you want to delete this department? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
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