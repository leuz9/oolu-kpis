import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Target, 
  PieChart, 
  Users, 
  Briefcase, 
  Settings, 
  Menu, 
  X,
  BarChart3,
  FileText,
  Bell,
  Shield,
  Building2,
  Calendar,
  MessageSquare,
  HelpCircle,
  FileCode,
  Database,
  UserCog,
  Book,
  Link2,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  adminOnly?: boolean;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems: MenuItem[] = [
    // Main Menu
    { icon: <Home />, label: 'Dashboard', path: '/' },
    { icon: <Target />, label: 'Objectives', path: '/objectives' },
    { icon: <PieChart />, label: 'KPIs', path: '/kpis' },
    { icon: <Users />, label: 'Team', path: '/team' },
    { icon: <Briefcase />, label: 'Projects', path: '/projects' },
    { icon: <Book />, label: 'Documentation', path: '/documentation' },
    { icon: <Bell />, label: 'Notifications', path: '/notifications' },
    
    // Admin Only Menus
    { icon: <UserCog />, label: 'User Management', path: '/users', adminOnly: true },
    { icon: <BarChart3 />, label: 'Analytics', path: '/analytics', adminOnly: true },
    { icon: <FileText />, label: 'Reports', path: '/reports', adminOnly: true },
    { icon: <Shield />, label: 'Security', path: '/security', adminOnly: true },
    { icon: <Building2 />, label: 'Departments', path: '/departments', adminOnly: true },
    { icon: <Calendar />, label: 'Planning', path: '/planning' },
    { icon: <MessageSquare />, label: 'Messages', path: '/messages' },
    { icon: <Link2 />, label: 'Integrations', path: '/integrations', adminOnly: true },
    { icon: <Database />, label: 'API', path: '/api', adminOnly: true },
    { icon: <FileCode />, label: 'Support', path: '/support' }
  ];

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
      <div className="p-4 flex items-center justify-between border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
        <div className="flex items-center">
          <img 
            src="https://ignite-power.com/wp-content/uploads/2024/03/ignite-logo.png" 
            alt="Ignite Power" 
            className="h-8 w-8 object-contain bg-white rounded-lg p-1"
          />
          {sidebarOpen && <span className="ml-2 text-xl font-semibold text-white">OKRFlow</span>}
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <nav className="flex-1 pt-4">
        <div className="space-y-1">
          {filteredMenuItems.map((item) => (
            <div
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`
                flex items-center px-4 py-3 cursor-pointer
                ${location.pathname === item.path ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
                ${sidebarOpen ? 'justify-start' : 'justify-center'}
                transition-all duration-200
              `}
            >
              <div className={`${sidebarOpen ? '' : 'w-6'} flex items-center`}>
                {React.cloneElement(item.icon as React.ReactElement, {
                  className: `h-5 w-5 ${location.pathname === item.path ? 'text-white' : 'text-current'}`
                })}
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

      {/* User Profile and Settings */}
      <div className="border-t border-gray-800 p-4">
        {user && (
          <div className="space-y-2">
            {/* Profile Link */}
            <div
              onClick={() => handleNavigation('/profile')}
              className={`
                flex items-center px-4 py-3 cursor-pointer
                ${location.pathname === '/profile' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
                rounded-lg transition-all duration-200
              `}
            >
              <User className="h-5 w-5" />
              {sidebarOpen && (
                <div className="ml-3">
                  <p className="text-sm font-medium truncate">
                    {user.displayName || user.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.role}
                  </p>
                </div>
              )}
            </div>

            {/* Settings Link */}
            <div
              onClick={() => handleNavigation('/settings')}
              className={`
                flex items-center px-4 py-3 cursor-pointer
                ${location.pathname === '/settings' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
                rounded-lg transition-all duration-200
              `}
            >
              <Settings className="h-5 w-5" />
              {sidebarOpen && (
                <span className="ml-3 text-sm font-medium">Settings</span>
              )}
            </div>

            {/* Logout Button */}
            <div
              onClick={handleLogout}
              className="flex items-center px-4 py-3 cursor-pointer text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
              {sidebarOpen && (
                <span className="ml-3 text-sm font-medium">Sign out</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}