import { 
  Home, 
  Target, 
  PieChart, 
  Users, 
  Briefcase, 
  Book, 
  Bell,
  UserCog,
  BarChart3,
  FileText,
  Shield,
  Building2,
  Calendar,
  MessageSquare,
  Link2,
  Database,
  FileCode
} from 'lucide-react';
import type { MenuItem } from './types';

export const menuItems: MenuItem[] = [
  // Main Menu
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: Target, label: 'Objectives', path: '/objectives' },
  { icon: PieChart, label: 'KPIs', path: '/kpis' },
  { icon: Users, label: 'Team', path: '/team' },
  { icon: Briefcase, label: 'Projects', path: '/projects' },
  { icon: Book, label: 'Documentation', path: '/documentation' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: Calendar, label: 'Planning', path: '/planning' },
  { icon: MessageSquare, label: 'Messages', path: '/messages' },
  
  // Admin Only Menus
  { icon: UserCog, label: 'User Management', path: '/users', adminOnly: true },
  { icon: BarChart3, label: 'Analytics', path: '/analytics', adminOnly: true },
  { icon: FileText, label: 'Reports', path: '/reports', adminOnly: true },
  { icon: Shield, label: 'Security', path: '/security', adminOnly: true },
  { icon: Building2, label: 'Departments', path: '/departments', adminOnly: true },
  { icon: Link2, label: 'Integrations', path: '/integrations', adminOnly: true },
  { icon: Database, label: 'API', path: '/api', adminOnly: true },
  { icon: FileCode, label: 'Support', path: '/support' }
];