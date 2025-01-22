import React, { useState } from 'react';
import { Bell, LogOut, UserCircle, Target, Users, PieChart, Briefcase } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import ObjectivesList from './ObjectivesList';
import KPIOverview from './KPIOverview';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out`}>
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-end h-16">
              <div className="flex items-center space-x-4">
                <Bell className="h-6 w-6 text-gray-500 hover:text-gray-700 cursor-pointer" />
                <div className="relative">
                  <button 
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    {user?.photoURL ? (
                      <img 
                        src={user.photoURL}
                        alt={user.displayName || 'Profile'} 
                        className="h-8 w-8 rounded-full object-cover"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = "https://ignite-power.com/wp-content/uploads/2024/03/ignite-logo.png";
                        }}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-medium text-sm">
                          {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
                        </span>
                      </div>
                    )}
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setProfileOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <UserCircle className="h-4 w-4 mr-2" />
                        My Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<Target className="h-6 w-6 text-indigo-600" />}
              title="Active OKRs"
              value="12"
              trend="+2 this quarter"
            />
            <StatCard
              icon={<Users className="h-6 w-6 text-blue-600" />}
              title="Team Members"
              value="8"
              trend="Full participation"
            />
            <StatCard
              icon={<PieChart className="h-6 w-6 text-purple-600" />}
              title="Key Results"
              value="36"
              trend="28 on track"
            />
            <StatCard
              icon={<Briefcase className="h-6 w-6 text-green-600" />}
              title="Projects"
              value="5"
              trend="3 in progress"
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <ObjectivesList />
            <KPIOverview />
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, trend }: {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        {icon}
        <h3 className="ml-3 text-lg font-medium text-gray-900">{title}</h3>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <p className="mt-1 text-sm text-gray-500">{trend}</p>
      </div>
    </div>
  );
}