import React from 'react';
import type { User } from '../../../../types';

interface ContributorsProps {
  level: string;
  contributors: string[];
  users: User[];
  loading: boolean;
  onSelect: (userId: string) => void;
}

export default function Contributors({ level, contributors, users, loading, onSelect }: ContributorsProps) {
  if (level === 'company') return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          {level === 'department' ? 'Department Members' : 'Assignee'}
        </label>
        <span className="text-sm text-gray-500">
          {contributors.length} selected
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-20">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((user) => (
            <div
              key={user.id}
              className={`p-4 rounded-lg border ${
                contributors.includes(user.id)
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300'
              } cursor-pointer transition-colors`}
              onClick={() => onSelect(user.id)}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || ''}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 font-medium text-sm">
                        {user.displayName?.charAt(0) || user.email.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user.displayName || user.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}