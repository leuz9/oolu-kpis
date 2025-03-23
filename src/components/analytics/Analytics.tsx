import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import { Target, Users, PieChart, Briefcase } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { analyticsService } from '../../services/analyticsService';
import AnalyticsHeader from './components/AnalyticsHeader';
import MetricCard from './components/MetricCard';
import DepartmentPerformance from './components/DepartmentPerformance';
import ObjectiveProgress from './components/ObjectiveProgress';
import KeyResultsOverview from './components/KeyResultsOverview';
import RecentUpdates from './components/RecentUpdates';

export default function Analytics() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const analyticsData = await analyticsService.getAnalyticsByPeriod(selectedPeriod as any);
      setData(analyticsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAnalytics();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out p-8`}>
          <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out p-8`}>
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const analyticsCards = [
    {
      title: 'Objective Completion Rate',
      value: `${data.metrics.objectiveRate}%`,
      change: 12,
      trend: 'up' as const,
      period: `vs last ${selectedPeriod}`,
      icon: <Target className="h-6 w-6" />,
      color: 'primary'
    },
    {
      title: 'Team Performance',
      value: `${data.metrics.teamPerformance}%`,
      change: 5,
      trend: 'up' as const,
      period: `vs last ${selectedPeriod}`,
      icon: <Users className="h-6 w-6" />,
      color: 'blue'
    },
    {
      title: 'Key Results On Track',
      value: `${data.metrics.keyResultsOnTrack}%`,
      change: 0,
      trend: 'neutral' as const,
      period: `vs last ${selectedPeriod}`,
      icon: <PieChart className="h-6 w-6" />,
      color: 'green'
    },
    {
      title: 'Active Projects',
      value: data.metrics.activeProjects,
      change: -3,
      trend: 'down' as const,
      period: `vs last ${selectedPeriod}`,
      icon: <Briefcase className="h-6 w-6" />,
      color: 'purple'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out p-8`}>
        <div className="max-w-7xl mx-auto">
          <AnalyticsHeader
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            onRefresh={handleRefresh}
          />

          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {analyticsCards.map((card, index) => (
              <MetricCard key={index} {...card} />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Department Performance & Objective Progress */}
            <div className="lg:col-span-2 space-y-8">
              <DepartmentPerformance
                departments={data.departmentPerformance}
                selectedDepartment={selectedDepartment}
                onDepartmentChange={setSelectedDepartment}
              />
              <ObjectiveProgress progress={data.objectiveProgress} />
            </div>

            {/* Key Results Overview & Recent Updates */}
            <div className="space-y-8">
              <KeyResultsOverview metrics={data.keyResultMetrics} />
              <RecentUpdates updates={data.recentUpdates} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}