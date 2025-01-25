import { ReactNode } from 'react';

export interface MenuItem {
  icon: ReactNode;
  label: string;
  path: string;
  adminOnly?: boolean;
}