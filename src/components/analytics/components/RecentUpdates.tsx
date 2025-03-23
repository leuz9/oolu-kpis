import React from 'react';
import { 
  GitBranch, 
  GitPullRequest, 
  GitMerge, 
  MessageSquare, 
  FileText 
} from 'lucide-react';

interface Update {
  id: string;
  type: 'objective' | 'key-result' | 'team' | 'project' | 'system';
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
        return <GitBranch className="h-4 w-4 text-blue-600" />;
      case 'key-result':
        return <GitPullRequest className="h-4 w-4 text-purple-600" />;
      case 'team':
        return <GitMerge className="h-4 w-4 text-green-600" />;
      case 'project':
        return <MessageSquare className="h-4 w-4 text-orange-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Recent Updates</h2>
        <button className="text-sm text-primary-600 hover:text-primary-700">View all</button>
      </div>
      <div className="space-y-6">
        {updates.map((update) => (
          <div key={update.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
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