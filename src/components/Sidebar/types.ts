import { DivideIcon as LucideIcon } from 'lucide-react';

export interface MenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
  external?: boolean;
}