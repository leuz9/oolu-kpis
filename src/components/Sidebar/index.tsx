import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Logo from './Logo';
import Navigation from './Navigation';
import UserSection from './UserSection';
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