import React from 'react';
import { useLocation } from 'react-router-dom';
import MenuItem from './MenuItem';
import type { MenuItem as MenuItemType } from './types';

interface NavigationProps {
  items: MenuItemType[];
  sidebarOpen: boolean;
  onNavigate: (path: string) => void;
}

export default function Navigation({ items, sidebarOpen, onNavigate }: NavigationProps) {
  const location = useLocation();

  return (
    <nav className="flex-1 pt-4">
      <div className="space-y-1">
        {items.map((item) => (
          <MenuItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            isActive={location.pathname === item.path}
            sidebarOpen={sidebarOpen}
            onClick={() => onNavigate(item.path)}
          />
        ))}
      </div>
    </nav>
  );
}