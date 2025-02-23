import React, { useState } from 'react';
import Sidebar from '../Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { MessageSquare } from 'lucide-react';
import ChannelList from './components/ChannelList';
import ChatArea from './components/ChatArea';
import ChannelInfo from './components/ChannelInfo';
import ChannelForm from './components/ChannelForm';
import { useChannels } from './hooks/useChannels';
import { useMessages } from './hooks/useMessages';
import { useTyping } from './hooks/useTyping';
import type { Channel } from '../../types';

export default function Messages() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showChannelForm, setShowChannelForm] = useState(false);
  const [showChannelInfo, setShowChannelInfo] = useState(false);
  const { user } = useAuth();

  const { channels, createChannel } = useChannels();
  const { messages, sendMessage, editMessage, deleteMessage, addReaction } = useMessages(selectedChannel);
  const { typingUsers, isTyping, setIsTyping, updateTypingStatus } = useTyping(selectedChannel);

  const handleCreateChannel = async (channelData: Partial<Channel>) => {
    if (!user) return;
    
    try {
      const newChannel = await createChannel({
        ...channelData,
        owner: user.id,
        members: [user.id],
        unreadCount: 0,
        createdAt: new Date().toISOString()
      } as Channel);
      setSelectedChannel(newChannel);
      setShowChannelForm(false);
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out flex`}>
        <ChannelList
          channels={channels}
          selectedChannel={selectedChannel}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onChannelSelect={setSelectedChannel}
          onCreateChannel={() => setShowChannelForm(true)}
        />

        {selectedChannel ? (
          <>
            <ChatArea
              channel={selectedChannel}
              messages={messages}
              onSendMessage={sendMessage}
              onEditMessage={editMessage}
              onDeleteMessage={deleteMessage}
              onReaction={addReaction}
              onToggleInfo={() => setShowChannelInfo(!showChannelInfo)}
              typingUsers={typingUsers}
              currentUserId={user?.id}
            />

            {showChannelInfo && (
              <ChannelInfo
                channel={selectedChannel}
                onClose={() => setShowChannelInfo(false)}
              />
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Channel Selected</h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose a channel from the sidebar or create a new one
              </p>
            </div>
          </div>
        )}
      </div>

      {showChannelForm && (
        <ChannelForm
          onSubmit={handleCreateChannel}
          onClose={() => setShowChannelForm(false)}
        />
      )}
    </div>
  );
}