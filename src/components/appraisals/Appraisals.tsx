import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import { 
  Calendar, 
  Users, 
  BarChart3, 
  FileText, 
  Star, 
  Target, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AppraisalService } from '../../services/appraisalService';
import type { AppraisalCycle, Appraisal, AppraisalAnalytics } from '../../types';
import { AppraisalDashboard } from './components/AppraisalDashboard';
import { CycleManagement } from './components/CycleManagement';
import { AppraisalList } from './components/AppraisalList';
import { TemplateManagement } from './components/TemplateManagement';
import { AnalyticsView } from './components/AnalyticsView';
import { Feedback360 } from './components/Feedback360';

type ViewType = 'dashboard' | 'cycles' | 'appraisals' | 'templates' | 'analytics' | 'feedback360';

export default function Appraisals() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [cycles, setCycles] = useState<AppraisalCycle[]>([]);
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [analytics, setAnalytics] = useState<AppraisalAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Set default view based on user permissions
  useEffect(() => {
    if (user) {
      const isAdmin = user.role === 'admin' || user.role === 'superadmin';
      if (!isAdmin && currentView === 'dashboard') {
        setCurrentView('appraisals');
      }
    }
  }, [user, currentView]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cyclesData, appraisalsData] = await Promise.all([
        AppraisalService.getCycles(),
        AppraisalService.getAppraisals()
      ]);
      
      setCycles(cyclesData);
      setAppraisals(appraisalsData);
      
      // Set the most recent active cycle as selected
      const activeCycle = cyclesData.find(c => c.status === 'active');
      if (activeCycle) {
        setSelectedCycle(activeCycle.id);
        loadAnalytics(activeCycle.id);
      }
    } catch (error) {
      console.error('Error loading appraisal data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async (cycleId: string) => {
    try {
      const analyticsData = await AppraisalService.getAppraisalAnalytics(cycleId);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const handleCycleChange = (cycleId: string) => {
    setSelectedCycle(cycleId);
    loadAnalytics(cycleId);
  };

  const getStats = () => {
    const currentCycle = cycles.find(c => c.id === selectedCycle);
    if (!currentCycle) return null;

    const cycleAppraisals = appraisals.filter(a => a.cycleId === selectedCycle);
    const completed = cycleAppraisals.filter(a => a.status === 'completed').length;
    const inProgress = cycleAppraisals.filter(a => ['self-review', 'manager-review', 'hr-review'].includes(a.status)).length;
    const pending = cycleAppraisals.filter(a => a.status === 'draft').length;
    const cancelled = cycleAppraisals.filter(a => a.status === 'cancelled').length;

    // Calculate average rating for completed appraisals
    const completedAppraisals = cycleAppraisals.filter(a => a.status === 'completed' && a.overallRating);
    const averageRating = completedAppraisals.length > 0 
      ? completedAppraisals.reduce((sum, a) => sum + (a.overallRating || 0), 0) / completedAppraisals.length 
      : 0;

    return {
      total: cycleAppraisals.length,
      completed,
      inProgress,
      pending,
      cancelled,
      completionRate: cycleAppraisals.length > 0 ? (completed / cycleAppraisals.length) * 100 : 0,
      averageRating: averageRating,
      ratedCount: completedAppraisals.length
    };
  };

  const stats = getStats();

  // Check if user has admin access - only admin and superadmin roles
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  
  // Debug log to check user permissions (remove in production)
  if (user) {
    console.log('User permissions check:', {
      userId: user.id,
      role: user.role,
      isAdmin: user.isAdmin,
      calculatedIsAdmin: isAdmin
    });
  }
  
  const allMenuItems = [
    {
      id: 'dashboard' as ViewType,
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Overview and key metrics',
      adminOnly: true
    },
    {
      id: 'cycles' as ViewType,
      label: 'Cycles',
      icon: Calendar,
      description: 'Manage appraisal cycles',
      adminOnly: true
    },
    {
      id: 'appraisals' as ViewType,
      label: 'Appraisals',
      icon: FileText,
      description: 'Review and manage appraisals',
      adminOnly: false
    },
    {
      id: 'templates' as ViewType,
      label: 'Templates',
      icon: Edit,
      description: 'Create and manage templates',
      adminOnly: true
    },
    {
      id: 'feedback360' as ViewType,
      label: '360° Feedback',
      icon: Users,
      description: 'Multi-rater feedback system',
      adminOnly: false
    },
    {
      id: 'analytics' as ViewType,
      label: 'Analytics',
      icon: TrendingUp,
      description: 'Reports and insights',
      adminOnly: true
    }
  ];

  // Filter menu items based on user permissions
  const menuItems = allMenuItems.filter(item => !item.adminOnly || isAdmin);

  // Check if current view is admin-only and user doesn't have access
  const currentMenuItem = allMenuItems.find(item => item.id === currentView);
  if (currentMenuItem?.adminOnly && !isAdmin) {
    // Redirect to first available view
    const firstAvailableView = menuItems[0]?.id || 'appraisals';
    setCurrentView(firstAvailableView);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out p-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Star className="h-8 w-8 text-primary-600" />
                    Annual Appraisals
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Comprehensive performance evaluation and development system
                  </p>
                </div>
                
                {/* Cycle Selector */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <select
                      value={selectedCycle || ''}
                      onChange={(e) => handleCycleChange(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select Cycle</option>
                      {cycles.map(cycle => (
                        <option key={cycle.id} value={cycle.id}>
                          {cycle.name} ({cycle.year})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">Total Appraisals</p>
                        <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                      </div>
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600">Completed</p>
                        <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-yellow-600">In Progress</p>
                        <p className="text-2xl font-bold text-yellow-900">{stats.inProgress}</p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600">Completion Rate</p>
                        <p className="text-2xl font-bold text-purple-900">{stats.completionRate.toFixed(1)}%</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id)}
                        className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          currentView === item.id
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Content */}
              <div className="p-6">
                {currentView === 'dashboard' && (
                  <AppraisalDashboard 
                    cycles={cycles}
                    appraisals={appraisals}
                    analytics={analytics}
                    selectedCycle={selectedCycle}
                    onCycleChange={handleCycleChange}
                  />
                )}
                
                {currentView === 'cycles' && (
                  <CycleManagement 
                    cycles={cycles}
                    onCyclesChange={setCycles}
                    onRefresh={loadData}
                  />
                )}
                
                {currentView === 'appraisals' && (
                  <AppraisalList 
                    appraisals={appraisals}
                    cycles={cycles}
                    selectedCycle={selectedCycle}
                    onAppraisalsChange={setAppraisals}
                    onRefresh={loadData}
                  />
                )}
                
                {currentView === 'templates' && (
                  <TemplateManagement />
                )}
                
                {currentView === 'feedback360' && (
                  <Feedback360 
                    appraisals={appraisals}
                    selectedCycle={selectedCycle}
                  />
                )}
                
                {currentView === 'analytics' && (
                  <AnalyticsView 
                    analytics={analytics}
                    cycles={cycles}
                    selectedCycle={selectedCycle}
                    onCycleChange={handleCycleChange}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
