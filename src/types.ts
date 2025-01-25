import type { UserRole, RolePermissions } from './config/roles';

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  isAdmin: boolean;
  department?: string;
  teamMemberId?: string;
  createdAt: string;
  lastLogin?: string;
  lastSeen?: string;
  permissions: RolePermissions;
  customClaims: {
    role: UserRole;
    permissions: RolePermissions;
    isAdmin: boolean;
  };
}

export interface KPI {
  id: string;
  name: string;
  description?: string;
  value: number;
  target: number;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  trend: 'up' | 'down' | 'stable';
  progress: number;
  status: 'on-track' | 'at-risk' | 'behind';
  category: string;
  owner?: string;
  department?: string;
  startDate: string;
  dueDate: string;
  lastUpdated: string;
  history: KPIHistory[];
  objectiveIds: string[]; // Array of linked objective IDs
}

export interface KPIHistory {
  date: string;
  value: number;
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  level: 'company' | 'department' | 'individual';
  status: 'on-track' | 'at-risk' | 'behind';
  progress: number;
  startDate: string;
  dueDate: string;
  department?: string;
  owner?: string;
  parentId?: string;
  contributors: string[];
  kpiIds: string[]; // Array of linked KPI IDs
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  displayName: string;
  email: string;
  role: string;
  department: string;
  photoURL: string | null;
  userId?: string;
  jobTitle?: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  projects?: string[];
  startDate?: string;
  reportsTo?: string;
  languages?: string[];
  certifications?: string[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive' | 'on-leave';
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  status: 'sent' | 'delivered' | 'read';
  isEdited?: boolean;
  reactions?: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
}

export interface Channel {
  id: string;
  name: string;
  type: 'group' | 'private' | 'direct';
  description?: string;
  members: string[];
  createdAt: string;
  updatedAt: string;
  lastMessage?: {
    content: string;
    timestamp: string;
    sender: string;
  };
  unreadCount: number;
}

export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
    objectives: boolean;
    kpis: boolean;
    projects: boolean;
    team: boolean;
  };
  theme: {
    mode: 'light' | 'dark';
    primaryColor: string;
    sidebarCollapsed: boolean;
  };
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}