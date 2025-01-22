import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { messageService } from '../../services/messageService';
import { 
  Send, 
  Plus, 
  Smile, 
  Paperclip, 
  MoreVertical, 
  Search,
  Users,
  Hash,
  Lock,
  Edit2,
  Trash2,
  Star,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import type { Message, Channel } from '../../types';

export default function Messages() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showChannelForm, setShowChannelForm] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Subscribe to channels
    const unsubscribeChannels = messageService.subscribeToChannels((updatedChannels) => {
      setChannels(updatedChannels);
    });

    return () => {
      unsubscribeChannels();
    };
  }, []);

  useEffect(() => {
    if (!selectedChannel) return;

    // Subscribe to messages for the selected channel
    const unsubscribeMessages = messageService.subscribeToMessages(
      selectedChannel.id,
      (updatedMessages) => {
        setMessages(updatedMessages);
        scrollToBottom();
      }
    );

    return () => {
      unsubscribeMessages();
    };
  }, [selectedChannel?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChannel || !user) return;

    try {
      await messageService.sendMessage(selectedChannel.id, {
        content: messageInput,
        sender: {
          id: user.id,
          name: user.displayName,
          avatar: user.photoURL || undefined
        }
      });
      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  const handleCreateChannel = async (channelData: Partial<Channel>) => {
    try {
      const newChannel = await messageService.createChannel({
        ...channelData,
        members: [],
        unreadCount: 0
      } as Channel);
      setSelectedChannel(newChannel);
      setShowChannelForm(false);
    } catch (error) {
      console.error('Error creating channel:', error);
      setError('Failed to create channel. Please try again.');
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;
    try {
      await messageService.addReaction(messageId, emoji, user.id);
    } catch (error) {
      console.error('Error adding reaction:', error);
      setError('Failed to add reaction. Please try again.');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await messageService.deleteMessage(messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
      setError('Failed to delete message. Please try again.');
    }
  };

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out flex`}>
        {/* Channels Sidebar */}
        <div className="w-64 bg-gray-800 flex flex-col">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Channels</h2>
              <button
                onClick={() => setShowChannelForm(true)}
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredChannels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel)}
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

        {/* Chat Area */}
        {selectedChannel ? (
          <div className="flex-1 flex flex-col bg-white">
            {/* Channel Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div className="flex items-center">
                <h2 className="text-lg font-semibold text-gray-900">{selectedChannel.name}</h2>
                {selectedChannel.type === 'private' && (
                  <Lock className="ml-2 h-4 w-4 text-gray-400" />
                )}
              </div>
              <div className="flex items-center space-x-4">
                <button className="text-gray-400 hover:text-gray-600">
                  <Star className="h-5 w-5" />
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <Users className="h-5 w-5" />
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 flex ${
                    message.sender.id === user?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div className={`max-w-[70%] ${
                    message.sender.id === user?.id ? 'bg-primary-500 text-white' : 'bg-gray-100'
                  } rounded-lg p-3`}>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">
                        {message.sender.name}
                      </span>
                      <span className="text-xs opacity-75">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                      {message.isEdited && (
                        <span className="text-xs opacity-75">(edited)</span>
                      )}
                    </div>
                    <p className="text-sm">{message.content}</p>
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {message.reactions.map((reaction, index) => (
                          <button
                            key={index}
                            onClick={() => handleReaction(message.id, reaction.emoji)}
                            className="inline-flex items-center px-2 py-1 rounded-full bg-white/10 text-xs"
                          >
                            {reaction.emoji} {reaction.count}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {message.sender.id === user?.id && (
                    <div className="ml-2 flex items-start space-x-1">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="px-6 py-4 border-t">
              <div className="flex items-center space-x-4">
                <button className="text-gray-400 hover:text-gray-600">
                  <Plus className="h-5 w-5" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    className="w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="absolute right-2 top-2 flex items-center space-x-2">
                    <button className="text-gray-400 hover:text-gray-600">
                      <Paperclip className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Smile className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
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

      {/* Channel Creation Modal */}
      {showChannelForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Channel</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleCreateChannel({
                name: formData.get('name') as string,
                type: formData.get('type') as Channel['type'],
                description: formData.get('description') as string
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Channel Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    name="type"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="group">Public Channel</option>
                    <option value="private">Private Channel</option>
                    <option value="direct">Direct Message</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowChannelForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                >
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border-l-4 border-red-500 p-4 rounded shadow-lg">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto pl-3 text-red-500 hover:text-red-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}