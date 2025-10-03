import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  sidebarOpen: boolean;
  onClick: () => void;
  badgeCount?: number;
}

export default function MenuItem({ icon: Icon, label, isActive, sidebarOpen, onClick, badgeCount }: MenuItemProps) {
  return (
    <div
      onClick={onClick}
      className={`
        flex items-center px-4 py-3 cursor-pointer
        ${isActive ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
        ${sidebarOpen ? 'justify-start' : 'justify-center'}
        transition-all duration-200
      `}
    >
      <div className={`${sidebarOpen ? '' : 'w-6'} flex items-center relative`}>
        <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-current'}`} />
        {!sidebarOpen && badgeCount && badgeCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] leading-4 text-center">
            {badgeCount > 99 ? '99+' : badgeCount}
          </span>
        )}
      </div>
      {sidebarOpen && (
        <span className="ml-3 text-sm font-medium truncate flex items-center gap-2">
          {label}
          {badgeCount && badgeCount > 0 && (
            <span className="ml-auto inline-flex items-center justify-center min-w-[18px] h-5 px-1.5 rounded-full bg-red-600 text-white text-xs">
              {badgeCount > 99 ? '99+' : badgeCount}
            </span>
          )}
        </span>
      )}
    </div>
  );
}