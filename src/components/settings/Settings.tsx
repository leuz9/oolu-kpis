import React, { useState } from 'react';
import Sidebar from '../Sidebar';
import { Bell, Lock, Globe, Moon, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import UserManagement from './UserManagement';
import RolesManagement from './RolesManagement';
import NotificationSettings from './NotificationSettings';
import ChangePasswordModal from './ChangePasswordModal';
import AccessDenied from '../AccessDenied';

export default function Settings() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const { user } = useAuth();

  // Check if user has access to admin sections
  const canAccessAdminSettings = user?.role === 'superadmin';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out p-8`}>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Admin Section */}
          {canAccessAdminSettings ? (
            <>
              <UserManagement />
              <RolesManagement />
            </>
          ) : user?.isAdmin ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    User management is restricted to superadmin users only. Please contact your system administrator for access.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Notifications */}
          <NotificationSettings />

          {/* Security */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center text-lg font-medium text-gray-900 mb-4">
              <Lock className="h-5 w-5 mr-2" />
              Security
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
                <button className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700">
                  Enable
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Change Password</h3>
                  <p className="text-sm text-gray-500">Update your password regularly</p>
                </div>
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50"
                >
                  Update
                </button>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center text-lg font-medium text-gray-900 mb-4">
              <Globe className="h-5 w-5 mr-2" />
              Preferences
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Language</h3>
                  <p className="text-sm text-gray-500">Choose your preferred language</p>
                </div>
                <select className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                  <option>English</option>
                  <option>French</option>
                  <option>Spanish</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Dark Mode</h3>
                  <p className="text-sm text-gray-500">Toggle dark mode theme</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  );
}