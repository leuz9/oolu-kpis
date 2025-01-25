import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import { integrationService } from '../../services/integrationService';
import { 
  Database, 
  Link2, 
  Plus, 
  Settings, 
  AlertTriangle, 
  CheckCircle2,
  RefreshCw,
  Power,
  X,
  ExternalLink,
  Shield,
  Activity,
  Clock,
  FileText,
  Code,
  Webhook,
  Search,
  Filter
} from 'lucide-react';
import type { Integration } from '../../types';

export default function Integrations() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | Integration['type']>('all');

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const fetchedIntegrations = await integrationService.getIntegrations();
      setIntegrations(fetchedIntegrations);
    } catch (err) {
      setError('Failed to load integrations. Please try again later.');
      console.error('Error fetching integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIntegration = async (integration: Omit<Integration, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    try {
      await integrationService.addIntegration(integration);
      setSuccess('Integration added successfully');
      setShowAddForm(false);
      fetchIntegrations();
    } catch (err) {
      setError('Failed to add integration. Please try again.');
      console.error('Error adding integration:', err);
    }
  };

  const handleToggleStatus = async (integration: Integration) => {
    try {
      const newStatus = integration.status === 'active' ? 'inactive' : 'active';
      await integrationService.updateIntegrationStatus(integration.id, newStatus);
      setSuccess(`Integration ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      fetchIntegrations();
    } catch (err) {
      setError('Failed to update integration status');
      console.error('Error updating integration:', err);
    }
  };

  const getIntegrationIcon = (type: Integration['type']) => {
    switch (type) {
      case 'api':
        return <Code className="h-6 w-6 text-blue-500" />;
      case 'webhook':
        return <Webhook className="h-6 w-6 text-purple-500" />;
      case 'database':
        return <Database className="h-6 w-6 text-green-500" />;
      case 'auth':
        return <Shield className="h-6 w-6 text-red-500" />;
      case 'analytics':
        return <Activity className="h-6 w-6 text-orange-500" />;
      case 'storage':
        return <FileText className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || integration.type === filterType;
    return matchesSearch && matchesType;
  });

  const IntegrationForm = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Add New Integration</h3>
          <button
            onClick={() => setShowAddForm(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleAddIntegration({
            name: formData.get('name') as string,
            type: formData.get('type') as Integration['type'],
            description: formData.get('description') as string,
            status: 'inactive',
            config: {},
          });
        }} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Integration Name</label>
            <input
              type="text"
              name="name"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Enter integration name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select 
              name="type"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="api">API</option>
              <option value="webhook">Webhook</option>
              <option value="database">Database</option>
              <option value="auth">Authentication</option>
              <option value="analytics">Analytics</option>
              <option value="storage">Storage</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              required
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Describe the integration"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
            >
              Add Integration
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
              <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your external service integrations and connections
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Integration
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search integrations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                  className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="all">All Types</option>
                  <option value="api">API</option>
                  <option value="webhook">Webhook</option>
                  <option value="database">Database</option>
                  <option value="auth">Authentication</option>
                  <option value="analytics">Analytics</option>
                  <option value="storage">Storage</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredIntegrations.map((integration) => (
                <div
                  key={integration.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getIntegrationIcon(integration.type)}
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">{integration.name}</h3>
                          <p className="mt-1 text-sm text-gray-500">{integration.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                          {integration.status}
                        </span>
                        <button
                          onClick={() => handleToggleStatus(integration)}
                          className={`p-2 rounded-md ${
                            integration.status === 'active'
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-gray-400 hover:bg-gray-50'
                          }`}
                        >
                          <Power className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-50 rounded-md">
                          <Settings className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {integration.metrics && (
                      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center">
                            <Activity className="h-5 w-5 text-gray-400" />
                            <span className="ml-2 text-sm font-medium text-gray-500">Requests</span>
                          </div>
                          <p className="mt-2 text-2xl font-semibold text-gray-900">
                            {integration.metrics.requests.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center">
                            <AlertTriangle className="h-5 w-5 text-gray-400" />
                            <span className="ml-2 text-sm font-medium text-gray-500">Errors</span>
                          </div>
                          <p className="mt-2 text-2xl font-semibold text-gray-900">
                            {integration.metrics.errors.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center">
                            <Clock className="h-5 w-5 text-gray-400" />
                            <span className="ml-2 text-sm font-medium text-gray-500">Avg. Latency</span>
                          </div>
                          <p className="mt-2 text-2xl font-semibold text-gray-900">
                            {integration.metrics.latency}ms
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="mt-6 flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-500">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Last synced: {new Date(integration.lastSync || '').toLocaleString()}
                      </div>
                      <button className="flex items-center text-primary-600 hover:text-primary-700">
                        <Link2 className="h-4 w-4 mr-1" />
                        View Documentation
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddForm && <IntegrationForm />}
    </div>
  );
}