import React, { useState } from 'react';
import Sidebar from '../Sidebar';
import { 
  Code,
  Key,
  Plus,
  Copy,
  RefreshCw,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  Activity,
  Clock,
  Shield,
  Lock,
  FileText,
  ExternalLink,
  Search,
  Filter,
  BarChart3
} from 'lucide-react';

interface APIKey {
  id: string;
  name: string;
  key: string;
  status: 'active' | 'inactive' | 'expired';
  createdAt: string;
  expiresAt?: string;
  lastUsed?: string;
  permissions: string[];
  environment: 'development' | 'staging' | 'production';
  usage: {
    requests: number;
    errors: number;
    latency: number;
  };
}

const sampleAPIKeys: APIKey[] = [
  {
    id: '1',
    name: 'Production API Key',
    key: 'pk_live_51NcX7zKJ3XmV9pY2x',
    status: 'active',
    createdAt: '2024-03-01T10:00:00Z',
    expiresAt: '2025-03-01T10:00:00Z',
    lastUsed: '2024-03-15T15:30:00Z',
    permissions: ['read', 'write', 'delete'],
    environment: 'production',
    usage: {
      requests: 15420,
      errors: 23,
      latency: 145
    }
  },
  {
    id: '2',
    name: 'Development API Key',
    key: 'pk_test_51NcX7zKJ3XmV9pY2x',
    status: 'active',
    createdAt: '2024-02-15T10:00:00Z',
    lastUsed: '2024-03-15T14:45:00Z',
    permissions: ['read', 'write'],
    environment: 'development',
    usage: {
      requests: 8750,
      errors: 12,
      latency: 89
    }
  },
  {
    id: '3',
    name: 'Staging API Key',
    key: 'pk_staging_51NcX7zKJ3XmV9pY2x',
    status: 'inactive',
    createdAt: '2024-01-01T10:00:00Z',
    expiresAt: '2024-12-31T10:00:00Z',
    lastUsed: '2024-03-14T09:15:00Z',
    permissions: ['read'],
    environment: 'staging',
    usage: {
      requests: 5230,
      errors: 8,
      latency: 112
    }
  }
];

export default function API() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [apiKeys, setApiKeys] = useState(sampleAPIKeys);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedKey, setSelectedKey] = useState<APIKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEnvironment, setFilterEnvironment] = useState<'all' | APIKey['environment']>('all');

  const getStatusColor = (status: APIKey['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
    }
  };

  const getEnvironmentColor = (environment: APIKey['environment']) => {
    switch (environment) {
      case 'production':
        return 'bg-red-100 text-red-800';
      case 'staging':
        return 'bg-yellow-100 text-yellow-800';
      case 'development':
        return 'bg-green-100 text-green-800';
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setSuccess('API key copied to clipboard');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleRegenerateKey = async (id: string) => {
    try {
      // In a real app, this would make an API call to regenerate the key
      const newKey = 'pk_' + Math.random().toString(36).substring(2);
      setApiKeys(prev => prev.map(key => 
        key.id === id ? { ...key, key: newKey } : key
      ));
      setSuccess('API key regenerated successfully');
    } catch (err) {
      setError('Failed to regenerate API key');
      console.error('Error regenerating key:', err);
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      // In a real app, this would make an API call to delete the key
      setApiKeys(prev => prev.filter(key => key.id !== id));
      setSuccess('API key deleted successfully');
    } catch (err) {
      setError('Failed to delete API key');
      console.error('Error deleting key:', err);
    }
  };

  const APIKeyForm = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Create New API Key</h3>
          <button
            onClick={() => setShowAddForm(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Key Name</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Enter a name for this API key"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Environment</label>
            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
              <option value="development">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Permissions</label>
            <div className="mt-2 space-y-2">
              <label className="inline-flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                <span className="ml-2 text-sm text-gray-700">Read</span>
              </label>
              <label className="inline-flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                <span className="ml-2 text-sm text-gray-700">Write</span>
              </label>
              <label className="inline-flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                <span className="ml-2 text-sm text-gray-700">Delete</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Expiration</label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
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
              Create API Key
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
              <h1 className="text-2xl font-bold text-gray-900">API Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your API keys and monitor API usage
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create API Key
            </button>
          </div>

          {/* Alerts */}
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
                    placeholder="Search API keys..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={filterEnvironment}
                  onChange={(e) => setFilterEnvironment(e.target.value as typeof filterEnvironment)}
                  className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="all">All Environments</option>
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                </select>
              </div>
              <div className="flex items-center space-x-4">
                <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  <FileText className="h-5 w-5 mr-2" />
                  Documentation
                </button>
                <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Usage Stats
                </button>
              </div>
            </div>
          </div>

          {/* API Keys List */}
          <div className="space-y-6">
            {apiKeys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Key className="h-6 w-6 text-primary-600" />
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">{apiKey.name}</h3>
                        <div className="mt-1 flex items-center space-x-2">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {apiKey.key.substring(0, 12)}...
                          </code>
                          <button
                            onClick={() => handleCopyKey(apiKey.key)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEnvironmentColor(apiKey.environment)}`}>
                        {apiKey.environment}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(apiKey.status)}`}>
                        {apiKey.status}
                      </span>
                      <button
                        onClick={() => handleRegenerateKey(apiKey.id)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <RefreshCw className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteKey(apiKey.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Activity className="h-5 w-5 text-gray-400" />
                        <span className="ml-2 text-sm font-medium text-gray-500">Requests</span>
                      </div>
                      <p className="mt-2 text-2xl font-semibold text-gray-900">
                        {apiKey.usage.requests.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-gray-400" />
                        <span className="ml-2 text-sm font-medium text-gray-500">Errors</span>
                      </div>
                      <p className="mt-2 text-2xl font-semibold text-gray-900">
                        {apiKey.usage.errors.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <span className="ml-2 text-sm font-medium text-gray-500">Avg. Latency</span>
                      </div>
                      <p className="mt-2 text-2xl font-semibold text-gray-900">
                        {apiKey.usage.latency}ms
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 text-gray-400" />
                        <span className="ml-2 text-sm font-medium text-gray-500">Permissions</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {apiKey.permissions.map((permission, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4 text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Created: {new Date(apiKey.createdAt).toLocaleDateString()}
                      </div>
                      {apiKey.expiresAt && (
                        <div className="flex items-center">
                          <Lock className="h-4 w-4 mr-1" />
                          Expires: {new Date(apiKey.expiresAt).toLocaleDateString()}
                        </div>
                      )}
                      {apiKey.lastUsed && (
                        <div className="flex items-center">
                          <Activity className="h-4 w-4 mr-1" />
                          Last used: {new Date(apiKey.lastUsed).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <button className="flex items-center text-primary-600 hover:text-primary-700">
                      View Details
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAddForm && <APIKeyForm />}
    </div>
  );
}