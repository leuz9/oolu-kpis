import React from 'react';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  sidebarOpen: boolean;
  onClick: () => void;
}

export default function MenuItem({ icon, label, isActive, sidebarOpen, onClick }: MenuItemProps) {
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
      <div className={`${sidebarOpen ? '' : 'w-6'} flex items-center`}>
        {React.cloneElement(icon as React.ReactElement, {
          className: `h-5 w-5 ${isActive ? 'text-white' : 'text-current'}`
        })}
      </div>
      {sidebarOpen && (
        <span className="ml-3 text-sm font-medium truncate">
          {label}
        </span>
      )}
    </div>
  );
}