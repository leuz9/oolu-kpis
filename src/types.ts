// Add these types to your existing types.ts file

export interface Message {
  id: string;
  channelId: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  attachments?: Array<{
    id: string;
    type: 'image' | 'file';
    url: string;
    name: string;
  }>;
  reactions?: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
  isEdited?: boolean;
  isPinned?: boolean;
  isStarred?: boolean;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  readAt?: string;
  updatedAt?: string;
}

export interface Channel {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'department';
  members: Array<{
    id: string;
    name: string;
    avatar?: string;
    status: 'online' | 'offline' | 'away' | 'busy';
  }>;
  lastMessage?: {
    content: string;
    timestamp: string;
    sender: string;
  };
  unreadCount: number;
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
}