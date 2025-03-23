import React from 'react';
import { useNavigate } from 'react-router-dom';
import MenuItem from './MenuItem';
import type { MenuItem as MenuItemType } from './types';

interface NavigationProps {
  items: MenuItemType[];
  sidebarOpen: boolean;
  currentPath: string;
}

export default function Navigation({ items, sidebarOpen, currentPath }: NavigationProps) {
  const navigate = useNavigate();

  const handleClick = (item: MenuItemType) => {
    if (item.external) {
      window.open(item.path, '_blank');
    } else {
      navigate(item.path);
    }
  };

  return (
    <nav className="flex-1 pt-4">
      <div className="space-y-1">
        {items.map((item) => (
          <MenuItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            isActive={!item.external && currentPath === item.path}
            sidebarOpen={sidebarOpen}
            onClick={() => handleClick(item)}
          />
        ))}
      </div>
    </nav>
  );
}