import React from 'react';
import { X, Bell, Users, Settings } from 'lucide-react';
import type { Channel } from '../../../types';

interface ChannelInfoProps {
  channel: Channel;
  onClose: () => void;
}

export default function ChannelInfo({ channel, onClose }: ChannelInfoProps) {
  return (
    <div className="w-64 bg-white border-l border-gray-200">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Channel Info</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700">About</h4>
            <p className="mt-1 text-sm text-gray-500">
              {channel.description || 'No description provided'}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700">Members</h4>
            <div className="mt-2 space-y-2">
              {channel.members?.map((memberId) => (
                <div key={memberId} className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-medium">
                      {memberId.charAt(0)}
                    </span>
                  </div>
                  <span className="ml-2 text-sm text-gray-700">
                    {memberId}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700">Settings</h4>
            <div className="mt-2 space-y-2">
              <button className="flex items-center text-sm text-gray-700 hover:text-gray-900">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </button>
              <button className="flex items-center text-sm text-gray-700 hover:text-gray-900">
                <Users className="h-4 w-4 mr-2" />
                Manage Members
              </button>
              <button className="flex items-center text-sm text-gray-700 hover:text-gray-900">
                <Settings className="h-4 w-4 mr-2" />
                Channel Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}