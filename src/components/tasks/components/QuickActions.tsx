import React, { useState, useEffect } from 'react';
import { X, Plus, Timer, Search, Filter, Calendar, BarChart3, Command } from 'lucide-react';

interface QuickActionsProps {
  onClose: () => void;
  onCreateTask: () => void;
  onFocusMode: () => void;
}

export default function QuickActions({ onClose, onCreateTask, onFocusMode }: QuickActionsProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const actions = [
    {
      id: 'create-task',
      label: 'Create New Task',
      icon: Plus,
      shortcut: '⌘N',
      action: onCreateTask,
      color: 'bg-primary-600 hover:bg-primary-700',
    },
    {
      id: 'focus-mode',
      label: 'Start Focus Mode',
      icon: Timer,
      shortcut: '⌘F',
      action: onFocusMode,
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      id: 'search',
      label: 'Search Tasks',
      icon: Search,
      shortcut: '⌘K',
      action: () => {},
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      id: 'filters',
      label: 'Open Filters',
      icon: Filter,
      shortcut: '⌘⇧F',
      action: () => {},
      color: 'bg-orange-600 hover:bg-orange-700',
    },
    {
      id: 'calendar',
      label: 'View Calendar',
      icon: Calendar,
      shortcut: '⌘C',
      action: () => {},
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      id: 'analytics',
      label: 'View Analytics',
      icon: BarChart3,
      shortcut: '⌘A',
      action: () => {},
      color: 'bg-pink-600 hover:bg-pink-700',
    },
  ];

  const filteredActions = actions.filter(action =>
    action.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Command className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
                <p className="text-sm text-gray-600">Press a key or click an action</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search actions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
            />
          </div>

          {/* Actions List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => {
                    action.action();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 ${action.color} rounded-lg text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{action.label}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-300 rounded">
                      {action.shortcut}
                    </kbd>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredActions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No actions found</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>Press <kbd className="px-2 py-1 bg-gray-100 rounded">Esc</kbd> to close</p>
          </div>
        </div>
      </div>
    </div>
  );
}

