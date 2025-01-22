import React, { useState } from 'react';
import Sidebar from '../Sidebar';
import { 
  Bell, 
  Target, 
  Users, 
  Briefcase, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Settings,
  Filter,
  Archive,
  Trash2,
  MoreVertical,
  Star
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'objective' | 'team' | 'project' | 'system' | 'message';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  actionRequired?: boolean;
  link?: string;
}

const sampleNotifications: Notification[] = [
  {
    id: '1',
    type: 'objective',
    title: 'Objective Update',
    message: 'Q1 Sales Target has reached 85% completion',
    timestamp: '2024-03-15T10:30:00Z',
    read: false,
    priority: 'high',
    actionRequired: true,
    link: '/objectives'
  },
  {
    id: '2',
    type: 'team',
    title: 'Team Member Added',
    message: 'Sarah Johnson has joined the Engineering team',
    timestamp: '2024-03-15T09:15:00Z',
    read: false,
    priority: 'medium',
    link: '/team'
  },
  {
    id: '3',
    type: 'project',
    title: 'Project Milestone',
    message: 'Mobile App Development phase 1 completed',
    timestamp: '2024-03-14T16:45:00Z',
    read: true,
    priority: 'high',
    link: '/projects'
  },
  {
    id: '4',
    type: 'system',
    title: 'System Maintenance',
    message: 'Scheduled maintenance in 2 hours',
    timestamp: '2024-03-14T14:00:00Z',
    read: true,
    priority: 'low'
  },
  {
    id: '5',
    type: 'message',
    title: 'New Comment',
    message: 'Alex left a comment on your objective',
    timestamp: '2024-03-14T11:30:00Z',
    read: false,
    priority: 'medium',
    link: '/objectives'
  }
];

export default function Notifications() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'priority'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'objective':
        return <Target className="h-5 w-5 text-primary-600" />;
      case 'team':
        return <Users className="h-5 w-5 text-blue-600" />;
      case 'project':
        return <Briefcase className="h-5 w-5 text-green-600" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-purple-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">High</span>;
      case 'medium':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Medium</span>;
      case 'low':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Low</span>;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const filteredNotifications = notifications
    .filter(notification => {
      if (filter === 'unread') return !notification.read;
      if (filter === 'priority') return notification.priority === 'high';
      return true;
    })
    .filter(notification => {
      if (selectedType === 'all') return true;
      return notification.type === selectedType;
    });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out p-8`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="mt-1 text-sm text-gray-500">
                Stay updated with important activities and updates
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => markAllAsRead()}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Mark all as read
              </button>
              <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                <Settings className="h-5 w-5 mr-2" />
                Notification Settings
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'priority')}
                  className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="all">All Notifications</option>
                  <option value="unread">Unread</option>
                  <option value="priority">High Priority</option>
                </select>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="all">All Types</option>
                  <option value="objective">Objectives</option>
                  <option value="team">Team</option>
                  <option value="project">Projects</option>
                  <option value="system">System</option>
                  <option value="message">Messages</option>
                </select>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{notifications.filter(n => !n.read).length} unread</span>
                <span>•</span>
                <span>{notifications.length} total</span>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm p-6 ${
                  !notification.read ? 'border-l-4 border-primary-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {getNotificationIcon(notification.type)}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{notification.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
                      <div className="mt-2 flex items-center space-x-4">
                        <span className="text-xs text-gray-500">
                          <Clock className="inline-block h-4 w-4 mr-1" />
                          {new Date(notification.timestamp).toLocaleString()}
                        </span>
                        {getPriorityBadge(notification.priority)}
                        {notification.actionRequired && (
                          <span className="text-xs text-primary-600 font-medium">
                            Action Required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}