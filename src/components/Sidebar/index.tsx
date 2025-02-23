import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Logo from './Logo';
import Navigation from './Navigation';
import UserSection from './UserSection';
import NotificationBadge from '../notifications/NotificationBadge';
import { menuItems } from './menuItems';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const filteredMenuItems = menuItems.filter(item => !item.adminOnly || user?.isAdmin);

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 shadow-lg transition-all duration-300 ease-in-out flex flex-col fixed h-full overflow-y-auto`}>
      <Logo sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <Navigation
        items={filteredMenuItems}
        sidebarOpen={sidebarOpen}
        onNavigate={handleNavigation}
      />

      <UserSection
        user={user}
        sidebarOpen={sidebarOpen}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
      />
    </div>
  );
}

const Navigation = ({ items, sidebarOpen, onNavigate }) => {
  const location = useLocation();

  return (
    <nav className="flex-1 pt-4">
      <div className="space-y-1">
        {items.map((item) => (
          <div
            key={item.path}
            onClick={() => onNavigate(item.path)}
            className={`
              flex items-center px-4 py-3 cursor-pointer
              ${location.pathname === item.path ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
              ${sidebarOpen ? 'justify-start' : 'justify-center'}
              transition-all duration-200
            `}
          >
            <div className={`${sidebarOpen ? '' : 'w-6'} flex items-center relative`}>
              {React.cloneElement(item.icon, {
                className: `h-5 w-5 ${location.pathname === item.path ? 'text-white' : 'text-current'}`
              })}
              {item.path === '/notifications' && <NotificationBadge />}
            </div>
            {sidebarOpen && (
              <span className="ml-3 text-sm font-medium truncate">
                {item.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
};