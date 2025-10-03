import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Logo from './Logo';
import MenuItem from './MenuItem';
import { menuItems } from './menuItems';
import { useNotifications } from '../../contexts/NotificationContext';
import { User, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    if (item.superAdminOnly) {
      return !!user?.isAdmin;
    }
    if (item.adminOnly) {
      return !!user?.isAdmin;
    }
    return true;
  });

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 shadow-lg transition-all duration-300 ease-in-out flex flex-col fixed h-full overflow-y-auto`}>
      <Logo sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main Navigation */}
      <nav className="flex-1 pt-4">
        <div className="space-y-1">
          {filteredMenuItems.map((item) => {
            const badge = item.label === 'Notifications' ? unreadCount : undefined;
            return (
              <MenuItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                isActive={location.pathname === item.path}
                sidebarOpen={sidebarOpen}
                onClick={() => navigate(item.path)}
                badgeCount={badge}
              />
            );
          })}
        </div>
      </nav>

      {/* User Section */}
      {user && (
        <div className="border-t border-gray-800 p-4">
          <div className="space-y-2">
            {/* Profile Link */}
            <MenuItem
              icon={User}
              label={user.displayName || user.email}
              isActive={location.pathname === '/profile'}
              sidebarOpen={sidebarOpen}
              onClick={() => navigate('/profile')}
            />

            {/* Settings Link */}
            <MenuItem
              icon={Settings}
              label="Settings"
              isActive={location.pathname === '/settings'}
              sidebarOpen={sidebarOpen}
              onClick={() => navigate('/settings')}
            />

            {/* Logout Button */}
            <MenuItem
              icon={LogOut}
              label="Sign out"
              isActive={false}
              sidebarOpen={sidebarOpen}
              onClick={handleLogout}
            />
          </div>
        </div>
      )}
    </div>
  );
}