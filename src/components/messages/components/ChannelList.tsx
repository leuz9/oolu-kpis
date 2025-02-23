import React from 'react';
import { Plus, Search, Users, Lock, Hash } from 'lucide-react';
import type { Channel } from '../../../types';

interface ChannelListProps {
  channels: Channel[];
  selectedChannel: Channel | null;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onChannelSelect: (channel: Channel) => void;
  onCreateChannel: () => void;
}

export default function ChannelList({
  channels,
  selectedChannel,
  searchTerm,
  onSearchChange,
  onChannelSelect,
  onCreateChannel
}: ChannelListProps) {
  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-64 bg-gray-800 flex flex-col">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Channels</h2>
          <button
            onClick={onCreateChannel}
            className="p-1 text-gray-400 hover:text-white"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search channels..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredChannels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => onChannelSelect(channel)}
            className={`w-full px-4 py-2 flex items-center space-x-2 hover:bg-gray-700 ${
              selectedChannel?.id === channel.id ? 'bg-gray-700' : ''
            }`}
          >
            {channel.type === 'direct' ? (
              <Users className="h-5 w-5 text-gray-400" />
            ) : channel.type === 'private' ? (
              <Lock className="h-5 w-5 text-gray-400" />
            ) : (
              <Hash className="h-5 w-5 text-gray-400" />
            )}
            <span className="text-gray-300">{channel.name}</span>
            {channel.unreadCount > 0 && (
              <span className="ml-auto bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                {channel.unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}