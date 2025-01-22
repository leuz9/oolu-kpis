import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Target, PieChart, Users, Briefcase, Settings, Menu, X } from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: <Home />, label: 'Dashboard', path: '/' },
    { icon: <Target />, label: 'Objectives', path: '/objectives' },
    { icon: <PieChart />, label: 'KPIs', path: '/kpis' },
    { icon: <Users />, label: 'Team', path: '/team' },
    { icon: <Briefcase />, label: 'Projects', path: '/projects' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col fixed h-full`}>
      <div className="p-4 flex items-center justify-between border-b">
        <div className="flex items-center">
          <img 
            src="https://ignite-power.com/wp-content/uploads/2024/03/ignite-logo.png" 
            alt="Ignite Power" 
            className="h-8 w-8 object-contain"
          />
          {sidebarOpen && <span className="ml-2 text-xl font-semibold text-gray-900">OKRFlow</span>}
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 rounded-lg hover:bg-gray-100"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      <nav className="flex-1 pt-4">
        {menuItems.map((item) => (
          <div
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            className={`
              flex items-center px-4 py-3 cursor-pointer
              ${location.pathname === item.path ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              ${sidebarOpen ? 'justify-start' : 'justify-center'}
            `}
          >
            <div className={`${sidebarOpen ? '' : 'w-6'} flex items-center`}>
              {React.cloneElement(item.icon, {
                className: `h-5 w-5 ${location.pathname === item.path ? 'text-indigo-600' : 'text-gray-500'}`
              })}
            </div>
            {sidebarOpen && <span className="ml-3 text-sm font-medium">{item.label}</span>}
          </div>
        ))}
        <div className="mt-auto mb-4">
          <div
            onClick={() => handleNavigation('/settings')}
            className={`
              flex items-center px-4 py-3 cursor-pointer
              ${location.pathname === '/settings' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              ${sidebarOpen ? 'justify-start' : 'justify-center'}
            `}
          >
            <div className={`${sidebarOpen ? '' : 'w-6'} flex items-center`}>
              <Settings className={`h-5 w-5 ${location.pathname === '/settings' ? 'text-indigo-600' : 'text-gray-500'}`} />
            </div>
            {sidebarOpen && <span className="ml-3 text-sm font-medium">Settings</span>}
          </div>
        </div>
      </nav>
    </div>
  );
}