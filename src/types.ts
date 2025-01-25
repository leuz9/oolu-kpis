// Add these types to your existing types.ts file

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  userId: string;
  userEmail: string;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
  attachments?: string[];
  comments?: Array<{
    id: string;
    content: string;
    userId: string;
    userName: string;
    createdAt: string;
    isStaff: boolean;
  }>;
}

export interface SupportArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  helpful: number;
  notHelpful: number;
  lastUpdated: string;
  author: {
    id: string;
    name: string;
  };
  ratings: {
    [userId: string]: 'helpful' | 'not_helpful';
  };
}