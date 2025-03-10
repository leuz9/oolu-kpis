import React, { useState, useEffect } from 'react';
import { Bell, Mail, Globe, MessageSquare, Target, PieChart, Users, Briefcase, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../services/notificationService';
import type { UserSettings } from '../../types';

export default function NotificationSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings['notifications']>({
    email: true,
    push: false,
    desktop: true,
    objectives: true,
    kpis: true,
    projects: true,
    team: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (user) {
      loadSettings();
      initializeNotifications();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const userSettings = await settingsService.getUserSettings(user!.id);
      setSettings(userSettings.notifications);
    } catch (err) {
      console.error('Error loading notification settings:', err);
      setError('Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const initializeNotifications = async () => {
    try {
      await notificationService.initializeFCM();
    } catch (err) {
      console.error('Error initializing notifications:', err);
      // Don't show error to user as this is not critical
    }
  };

  const handleToggle = (key: keyof UserSettings['notifications']) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      await settingsService.updateUserSettings(user.id, {
        notifications: settings
      });
      setSuccess('Notification settings updated successfully');
      setHasChanges(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving notification settings:', err);
      setError('Failed to save notification settings');
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-5 w-5 bg-gray-200 rounded"></div>
                <div className="flex-1 h-5 bg-gray-200 rounded"></div>
                <div className="h-6 w-11 bg-gray-200 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="flex items-center text-lg font-medium text-gray-900 mb-6">
        <Bell className="h-5 w-5 mr-2" />
        Notification Settings
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

      <div className="space-y-6">
        {/* Notification Channels */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Notification Channels</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.email}
                  onChange={() => handleToggle('email')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Globe className="h-5 w-5 text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                  <p className="text-sm text-gray-500">Receive push notifications in your browser</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.push}
                  onChange={() => handleToggle('push')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Desktop Notifications</p>
                  <p className="text-sm text-gray-500">Show desktop notifications</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.desktop}
                  onChange={() => handleToggle('desktop')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notification Types */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Notification Types</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Target className="h-5 w-5 text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Objectives</p>
                  <p className="text-sm text-gray-500">Updates about objectives and key results</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.objectives}
                  onChange={() => handleToggle('objectives')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <PieChart className="h-5 w-5 text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">KPIs</p>
                  <p className="text-sm text-gray-500">KPI updates and alerts</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.kpis}
                  onChange={() => handleToggle('kpis')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Team</p>
                  <p className="text-sm text-gray-500">Team member updates and mentions</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.team}
                  onChange={() => handleToggle('team')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Projects</p>
                  <p className="text-sm text-gray-500">Project updates and deadlines</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.projects}
                  onChange={() => handleToggle('projects')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        {hasChanges && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}