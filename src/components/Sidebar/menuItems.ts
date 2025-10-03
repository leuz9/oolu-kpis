import { Home, Target, Users, Book, Bell, UserCog, BarChart3, FileText, Shield, Building2, Calendar, MessageSquare, Link2, Database, FileCode, CheckSquare, FolderKanban, Book as AddressBook, Award } from 'lucide-react';
import type { MenuItem } from './types';

export const menuItems: MenuItem[] = [
  // Main Menu
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: Award, label: 'Annual Appraisals', path: '/appraisals' },
  { icon: Target, label: 'Objectives', path: '/objectives' },
  { icon: Users, label: 'Team', path: '/team' },
  { icon: AddressBook, label: 'Directory', path: '/directory' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: FolderKanban, label: 'Projects', path: '/projects' },
  { icon: Book, label: 'Documentation', path: '/documentation' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: MessageSquare, label: 'Messages', path: 'https://mail.google.com/chat', external: true },
  { icon: Calendar, label: 'Planning', path: '/planning' },
  
  // Admin Only Menus
  { icon: UserCog, label: 'User Management', path: '/users', superAdminOnly: true },
  { icon: BarChart3, label: 'Analytics', path: '/analytics', adminOnly: true },
  { icon: FileText, label: 'Reports', path: '/reports', adminOnly: true },
  { icon: Shield, label: 'Security', path: '/security', adminOnly: true },
  { icon: Building2, label: 'Departments', path: '/departments', adminOnly: true },
  { icon: Link2, label: 'Integrations', path: '/integrations', adminOnly: true },
  { icon: Database, label: 'API', path: '/api', adminOnly: true },
  { icon: FileCode, label: 'Support', path: 'https://chat.google.com/room/AAAA3XV7nxY?cls=7', external: true }
];