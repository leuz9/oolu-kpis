import React from 'react';
import { Target, Activity, Users } from 'lucide-react';

interface Update {
  id: string;
  type: 'objective' | 'key-result' | 'team';
  title: string;
  timestamp: string;
}

interface RecentUpdatesProps {
  updates: Update[];
}

export default function RecentUpdates({ updates }: RecentUpdatesProps) {
  const getUpdateIcon = (type: Update['type']) => {
    switch (type) {
      case 'objective':
        return <Target className="h-4 w-4 text-green-600" />;
      case 'key-result':
        return <Activity className="h-4 w-4 text-blue-600" />;
      case 'team':
        return <Users className="h-4 w-4 text-purple-600" />;
    }
  };

  const getIconBackground = (type: Update['type']) => {
    switch (type) {
      case 'objective':
        return 'bg-green-100';
      case 'key-result':
        return 'bg-blue-100';
      case 'team':
        return 'bg-purple-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Recent Updates</h2>
      <div className="space-y-4">
        {updates.map((update) => (
          <div key={update.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className={`h-8 w-8 rounded-full ${getIconBackground(update.type)} flex items-center justify-center`}>
                {getUpdateIcon(update.type)}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-900">{update.title}</p>
              <p className="text-xs text-gray-500">{update.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}