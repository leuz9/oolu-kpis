import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';
import { useNotifications } from '../../contexts/NotificationContext';
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
  Star,
  Search,
  ChevronDown,
  ExternalLink,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import type { Notification } from '../../services/notificationService';

export default function Notifications() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { 
    notifications, 
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteReadNotifications
  } = useNotifications();
  
  const [selectedType, setSelectedType] = useState<'all' | Notification['type']>('all');
  const [selectedPriority, setSelectedPriority] = useState<'all' | Notification['priority']>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [groupByDate, setGroupByDate] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());

  const getNotificationIcon = (type: Notification['type']) => {
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

  const getPriorityBadge = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">High</span>;
      case 'medium':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Medium</span>;
      case 'low':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Low</span>;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || notification.type === selectedType;
    const matchesPriority = selectedPriority === 'all' || notification.priority === selectedPriority;
    return matchesSearch && matchesType && matchesPriority;
  });

  const groupedNotifications = groupByDate ? groupNotificationsByDate(filteredNotifications) : null;

  const handleBulkAction = async (action: 'read' | 'delete') => {
    try {
      if (action === 'read') {
        await Promise.all(
          Array.from(selectedNotifications).map(id => markAsRead(id))
        );
      } else {
        await Promise.all(
          Array.from(selectedNotifications).map(id => deleteNotification(id))
        );
      }
      setSelectedNotifications(new Set());
    } catch (err) {
      console.error('Error performing bulk action:', err);
    }
  };

  function groupNotificationsByDate(notifications: Notification[]) {
    const groups: { [key: string]: Notification[] } = {};
    
    notifications.forEach(notification => {
      const date = new Date(notification.createdAt.toDate()).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
    });

    return groups;
  }

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
              <button 
                onClick={() => navigate('/settings')}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
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
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as typeof selectedType)}
                  className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="all">All Types</option>
                  <option value="objective">Objectives</option>
                  <option value="team">Team</option>
                  <option value="project">Projects</option>
                  <option value="system">System</option>
                  <option value="message">Messages</option>
                </select>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value as typeof selectedPriority)}
                  className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setGroupByDate(!groupByDate)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {groupByDate ? 'Ungroup' : 'Group by Date'}
                </button>
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {showArchived ? 'Hide Archived' : 'Show Archived'}
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedNotifications.size > 0 && (
            <div className="bg-primary-50 rounded-lg p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-primary-600 mr-2" />
                <span className="text-sm font-medium text-primary-900">
                  {selectedNotifications.size} notifications selected
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleBulkAction('read')}
                  className="px-3 py-1.5 text-sm font-medium text-primary-700 bg-primary-100 rounded-md hover:bg-primary-200"
                >
                  Mark as Read
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedNotifications(new Set())}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="space-y-4">
            {groupByDate ? (
              Object.entries(groupedNotifications || {}).map(([date, notifications]) => (
                <div key={date}>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">{date}</h3>
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        selected={selectedNotifications.has(notification.id)}
                        onSelect={(id) => {
                          const newSelected = new Set(selectedNotifications);
                          if (newSelected.has(id)) {
                            newSelected.delete(id);
                          } else {
                            newSelected.add(id);
                          }
                          setSelectedNotifications(newSelected);
                        }}
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  selected={selectedNotifications.has(notification.id)}
                  onSelect={(id) => {
                    const newSelected = new Set(selectedNotifications);
                    if (newSelected.has(id)) {
                      newSelected.delete(id);
                    } else {
                      newSelected.add(id);
                    }
                    setSelectedNotifications(newSelected);
                  }}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  selected: boolean;
  onSelect: (id: string) => void;
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function NotificationItem({ notification, selected, onSelect, onMarkAsRead, onDelete }: NotificationItemProps) {
  const [showActions, setShowActions] = useState(false);

  const getNotificationIcon = (type: Notification['type']) => {
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

  return (
    <div 
      className={`
        bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow
        ${notification.status === 'unread' ? 'border-l-4 border-primary-500' : ''}
        ${selected ? 'ring-2 ring-primary-500' : ''}
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onSelect(notification.id)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {getNotificationIcon(notification.type)}
                <p className={`ml-2 text-sm font-medium ${
                  notification.status === 'unread' ? 'text-gray-900' : 'text-gray-600'
                }`}>
                  {notification.title}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {notification.priority !== 'low' && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    notification.priority === 'high' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {notification.priority}
                  </span>
                )}
                <div className="relative">
                  <button
                    onClick={() => setShowActions(!showActions)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <MoreVertical className="h-5 w-5 text-gray-400" />
                  </button>
                  {showActions && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            onMarkAsRead(notification.id);
                            setShowActions(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {notification.status === 'unread' ? (
                            <>
                              <Eye className="h-4 w-4 mr-3" />
                              Mark as Read
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-4 w-4 mr-3" />
                              Mark as Unread
                            </>
                          )}
                        </button>
                        {notification.link && (
                          <a
                            href={notification.link}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <ExternalLink className="h-4 w-4 mr-3" />
                            View Details
                          </a>
                        )}
                        <button
                          onClick={() => {
                            onDelete(notification.id);
                            setShowActions(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <p className={`mt-1 text-sm ${
              notification.status === 'unread' ? 'text-gray-700' : 'text-gray-500'
            }`}>
              {notification.message}
            </p>
            <div className="mt-2 flex items-center text-xs text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              {new Date(notification.createdAt.toDate()).toLocaleString()}
              {notification.readAt && (
                <>
                  <span className="mx-2">•</span>
                  <Eye className="h-4 w-4 mr-1" />
                  Read {new Date(notification.readAt.toDate()).toLocaleString()}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}