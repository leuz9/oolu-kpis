import React from 'react';
import { User, Settings, LogOut } from 'lucide-react';
import type { User as UserType } from '../../types';

interface UserSectionProps {
  user: UserType | null;
  sidebarOpen: boolean;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export default function UserSection({ user, sidebarOpen, onNavigate, onLogout }: UserSectionProps) {
  if (!user) return null;

  return (
    <div className="border-t border-gray-800 p-4">
      <div className="space-y-2">
        {/* Profile Link */}
        <div
          onClick={() => onNavigate('/profile')}
          className="flex items-center px-4 py-3 cursor-pointer text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-all duration-200"
        >
          <User className="h-5 w-5" />
          {sidebarOpen && (
            <div className="ml-3">
              <p className="text-sm font-medium truncate">
                {user.displayName || user.email}
              </p>
              <p className="text-xs text-gray-500">
                {user.role}
              </p>
            </div>
          )}
        </div>

        {/* Settings Link */}
        <div
          onClick={() => onNavigate('/settings')}
          className="flex items-center px-4 py-3 cursor-pointer text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-all duration-200"
        >
          <Settings className="h-5 w-5" />
          {sidebarOpen && (
            <span className="ml-3 text-sm font-medium">Settings</span>
          )}
        </div>

        {/* Logout Button */}
        <div
          onClick={onLogout}
          className="flex items-center px-4 py-3 cursor-pointer text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          {sidebarOpen && (
            <span className="ml-3 text-sm font-medium">Sign out</span>
          )}
        </div>
      </div>
    </div>
  );
}