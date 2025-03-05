import { Timestamp } from 'firebase/firestore';

export type UserRole = 'superadmin' | 'admin' | 'director' | 'manager' | 'team_lead' | 'senior_employee' | 'employee' | 'intern' | 'external';

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role?: UserRole;
  department?: string;
  isAdmin?: boolean;
  status?: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
  lastSeen?: string;
  createdAt?: string;
  updatedAt?: string;
  phone?: string;
  location?: string;
  bio?: string;
  jobTitle?: string;
  startDate?: string;
  managerId?: string;
  teamMemberId?: string;
  languages?: string[];
  skills?: string[];
  education?: string[];
  certifications?: string[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
  permissions?: RolePermissions;
  customClaims?: {
    role: UserRole;
    permissions: RolePermissions;
    isAdmin: boolean;
  };
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  headCount?: number;
  budget?: number;
  status?: 'active' | 'inactive' | 'restructuring';
  createdAt: string;
  updatedAt: string;
}

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