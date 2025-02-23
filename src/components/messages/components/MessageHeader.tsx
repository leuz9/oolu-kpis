import React from 'react';
import { Lock, Star, Users, Settings, Info, Search, Phone, Video } from 'lucide-react';
import type { Channel } from '../../../types';

interface MessageHeaderProps {
  channel: Channel;
  onToggleInfo: () => void;
  onStartCall?: () => void;
  onStartVideoCall?: () => void;
  onSearch?: () => void;
}

export default function MessageHeader({ 
  channel, 
  onToggleInfo,
  onStartCall,
  onStartVideoCall,
  onSearch
}: MessageHeaderProps) {
  return (
    <div className="px-6 py-4 border-b flex items-center justify-between bg-white">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold text-gray-900">{channel.name}</h2>
        {channel.type === 'private' && (
          <Lock className="ml-2 h-4 w-4 text-gray-400" />
        )}
      </div>
      
      <div className="flex items-center space-x-3">
        {onSearch && (
          <button
            onClick={onSearch}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            title="Search messages"
          >
            <Search className="h-5 w-5" />
          </button>
        )}
        
        {onStartCall && (
          <button
            onClick={onStartCall}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            title="Start voice call"
          >
            <Phone className="h-5 w-5" />
          </button>
        )}
        
        {onStartVideoCall && (
          <button
            onClick={onStartVideoCall}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            title="Start video call"
          >
            <Video className="h-5 w-5" />
          </button>
        )}
        
        <button
          onClick={onToggleInfo}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          title="Channel info"
        >
          <Info className="h-5 w-5" />
        </button>
        
        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
          <Star className="h-5 w-5" />
        </button>
        
        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
          <Users className="h-5 w-5" />
        </button>
        
        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}