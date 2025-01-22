import React, { useState } from 'react';
import Sidebar from '../Sidebar';
import { 
  Shield, 
  Key, 
  Lock, 
  UserX, 
  AlertTriangle, 
  Clock, 
  Activity,
  FileText,
  RefreshCw,
  Database,
  Globe,
  Users,
  Settings,
  CheckCircle2,
  XCircle,
  AlertOctagon
} from 'lucide-react';

interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'failed_login' | 'password_change' | 'role_change' | 'permission_change' | 'access_denied';
  user: string;
  timestamp: string;
  ip: string;
  location?: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface SecurityMetric {
  title: string;
  value: string | number;
  change?: number;
  status: 'good' | 'warning' | 'critical';
  icon: React.ReactNode;
}

const securityMetrics: SecurityMetric[] = [
  {
    title: 'Security Score',
    value: '85/100',
    change: 5,
    status: 'good',
    icon: <Shield className="h-6 w-6 text-green-500" />
  },
  {
    title: 'Active Sessions',
    value: 24,
    change: -2,
    status: 'good',
    icon: <Users className="h-6 w-6 text-blue-500" />
  },
  {
    title: 'Failed Login Attempts',
    value: 12,
    change: 3,
    status: 'warning',
    icon: <AlertTriangle className="h-6 w-6 text-yellow-500" />
  },
  {
    title: 'Data Encryption',
    value: '100%',
    status: 'good',
    icon: <Lock className="h-6 w-6 text-green-500" />
  }
];

const recentEvents: SecurityEvent[] = [
  {
    id: '1',
    type: 'failed_login',
    user: 'john.doe@ignite.solar',
    timestamp: '2024-03-15T10:30:00Z',
    ip: '192.168.1.100',
    location: 'New York, US',
    details: 'Multiple failed login attempts',
    severity: 'high'
  },
  {
    id: '2',
    type: 'role_change',
    user: 'admin@ignite.solar',
    timestamp: '2024-03-15T09:45:00Z',
    ip: '192.168.1.101',
    location: 'London, UK',
    details: 'User role updated to Administrator',
    severity: 'medium'
  },
  {
    id: '3',
    type: 'access_denied',
    user: 'sarah.smith@ignite.solar',
    timestamp: '2024-03-15T09:15:00Z',
    ip: '192.168.1.102',
    location: 'Paris, FR',
    details: 'Unauthorized access attempt to admin panel',
    severity: 'critical'
  }
];

export default function Security() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'logs' | 'settings'>('overview');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('24h');

  const getEventIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'login':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'logout':
        return <UserX className="h-5 w-5 text-gray-500" />;
      case 'failed_login':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'password_change':
        return <Key className="h-5 w-5 text-blue-500" />;
      case 'role_change':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'permission_change':
        return <Settings className="h-5 w-5 text-orange-500" />;
      case 'access_denied':
        return <AlertOctagon className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out p-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Security Center</h1>
              <p className="mt-1 text-sm text-gray-500">
                Monitor and manage your organization's security
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
                className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                <RefreshCw className="h-5 w-5 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <nav className="flex space-x-4">
              <button
                onClick={() => setSelectedTab('overview')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  selectedTab === 'overview'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setSelectedTab('logs')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  selectedTab === 'logs'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Security Logs
              </button>
              <button
                onClick={() => setSelectedTab('settings')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  selectedTab === 'settings'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Settings
              </button>
            </nav>
          </div>

          {selectedTab === 'overview' && (
            <>
              {/* Security Metrics */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {securityMetrics.map((metric, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {metric.icon}
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">{metric.title}</p>
                          <p className="mt-1 text-2xl font-semibold text-gray-900">{metric.value}</p>
                        </div>
                      </div>
                      {metric.change && (
                        <span className={`inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium ${
                          metric.change > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {metric.change > 0 ? '+' : ''}{metric.change}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Security Recommendations */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Security Recommendations</h2>
                <div className="space-y-4">
                  <div className="flex items-start p-4 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Enable Two-Factor Authentication</h3>
                      <p className="mt-1 text-sm text-yellow-700">
                        Strengthen account security by enabling 2FA for all admin users.
                      </p>
                      <button className="mt-2 text-sm font-medium text-yellow-800 hover:text-yellow-900">
                        Configure now →
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start p-4 bg-red-50 rounded-lg">
                    <AlertOctagon className="h-5 w-5 text-red-400 mt-0.5" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Critical Updates Available</h3>
                      <p className="mt-1 text-sm text-red-700">
                        3 security updates are available for your system.
                      </p>
                      <button className="mt-2 text-sm font-medium text-red-800 hover:text-red-900">
                        Review and install →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900">Recent Security Events</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Monitor recent security-related activities across your organization
                  </p>
                </div>
                <div className="border-t border-gray-200">
                  <ul role="list" className="divide-y divide-gray-200">
                    {recentEvents.map((event) => (
                      <li key={event.id} className="p-6 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {getEventIcon(event.type)}
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-900">{event.details}</p>
                              <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
                                <span>{event.user}</span>
                                <span>•</span>
                                <span>{new Date(event.timestamp).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <Globe className="h-4 w-4 mr-1" />
                              {event.location}
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                              {event.severity.charAt(0).toUpperCase() + event.severity.slice(1)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}

          {selectedTab === 'logs' && (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Security Audit Logs</h2>
                  <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                    <FileText className="h-4 w-4 mr-2" />
                    Export Logs
                  </button>
                </div>
                {/* Add detailed security logs table here */}
              </div>
            </div>
          )}

          {selectedTab === 'settings' && (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Security Settings</h2>
                <div className="space-y-6">
                  {/* Password Policy */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Password Policy</h3>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Minimum Password Length</p>
                          <p className="text-sm text-gray-500">Set the minimum required length for passwords</p>
                        </div>
                        <select className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                          <option>8 characters</option>
                          <option>10 characters</option>
                          <option>12 characters</option>
                          <option>14 characters</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Password Expiration</p>
                          <p className="text-sm text-gray-500">Force password change after specified period</p>
                        </div>
                        <select className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                          <option>30 days</option>
                          <option>60 days</option>
                          <option>90 days</option>
                          <option>Never</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Require 2FA for Admin Users</p>
                          <p className="text-sm text-gray-500">Enforce 2FA for all administrative accounts</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Session Management */}
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">Session Management</h3>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Session Timeout</p>
                          <p className="text-sm text-gray-500">Automatically log out inactive users</p>
                        </div>
                        <select className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                          <option>15 minutes</option>
                          <option>30 minutes</option>
                          <option>1 hour</option>
                          <option>4 hours</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* IP Restrictions */}
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">IP Access Control</h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">IP Whitelist</p>
                        <p className="text-sm text-gray-500 mb-2">Restrict access to specific IP addresses</p>
                        <textarea
                          rows={3}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          placeholder="Enter IP addresses (one per line)"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex justify-end">
                      <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
                        Save Security Settings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}