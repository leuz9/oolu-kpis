// Add these types to your existing types.ts file

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
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
    userEmail: string;
    createdAt: string;
  }>;
}

export interface SupportArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  createdAt: string;
  lastUpdated: string;
  helpful: number;
  notHelpful: number;
  ratings: Record<string, 'helpful' | 'not_helpful'>;
}