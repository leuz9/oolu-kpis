import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Target, 
  Award, 
  Users, 
  Briefcase, 
  Book, 
  Bell,
  UserCog,
  BarChart3,
  FileText,
  Shield,
  Building2,
  Calendar,
  MessageSquare,
  Link2,
  Database,
  FileCode,
  CheckSquare,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    // Main Menu
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Target, label: 'Objectives', path: '/objectives' },
  { icon: Award, label: 'Annual Appraisals', path: '/appraisals' },
    { icon: BookOpen, label: 'Directory', path: '/directory' },
    { icon: Users, label: 'Team', path: '/team' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    { icon: Briefcase, label: 'Projects', path: '/projects', adminOnly: true },
    { icon: Book, label: 'Documentation', path: '/documentation', adminOnly: true },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    
    // Admin Only Menus
    { icon: UserCog, label: 'User Management', path: '/users', adminOnly: true },
    { icon: BarChart3, label: 'Analytics', path: '/analytics', adminOnly: true },
    { icon: FileText, label: 'Reports', path: '/reports', adminOnly: true },
    { icon: Shield, label: 'Security', path: '/security', adminOnly: true },
    { icon: Building2, label: 'Departments', path: '/departments', adminOnly: true },
    { icon: Calendar, label: 'Planning', path: '/planning' },
    { icon: MessageSquare, label: 'Messages', path: 'https://mail.google.com/chat', external: true },
    { icon: Link2, label: 'Integrations', path: '/integrations', adminOnly: true },
    { icon: Database, label: 'API', path: '/api', adminOnly: true },
    { icon: FileCode, label: 'Support', path: 'https://chat.google.com/room/AAAA3XV7nxY?cls=7', external: true }
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    // For items marked as adminOnly, check the isAdmin flag
    if (item.adminOnly) {
      return user?.isAdmin;
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

  const handleMenuItemClick = (path: string, external?: boolean) => {
    if (external) {
      window.open(path, '_blank');
    } else {
      navigate(path);
    }
  };

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 shadow-lg transition-all duration-300 ease-in-out flex flex-col fixed h-full overflow-y-auto`}>
      <div className="p-4 flex items-center justify-between border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
        <div className="flex items-center">
          <img 
            src="https://igniteaccess.com/wp-content/uploads/2025/01/logo-new.png" 
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
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.path}
                onClick={() => handleMenuItemClick(item.path, item.external)}
                className={`
                  flex items-center px-4 py-3 cursor-pointer
                  ${location.pathname === item.path ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
                  ${sidebarOpen ? 'justify-start' : 'justify-center'}
                  transition-all duration-200
                `}
              >
                <div className={`${sidebarOpen ? '' : 'w-6'} flex items-center`}>
                  <Icon className={`h-5 w-5 ${location.pathname === item.path ? 'text-white' : 'text-current'}`} />
                </div>
                {sidebarOpen && (
                  <span className="ml-3 text-sm font-medium truncate">
                    {item.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* User Section */}
      {user && (
        <div className="border-t border-gray-800 p-4">
          <div className="space-y-2">
            {/* Profile Link */}
            <div
              onClick={() => navigate('/profile')}
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
              onClick={() => navigate('/settings')}
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
        </div>
      )}
    </div>
  );
}