import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { objectiveService } from '../services/objectiveService';
import { kpiService } from '../services/kpiService';
import { teamService } from '../services/teamService';
import Sidebar from './Sidebar';
import { 
  Target, 
  Users, 
  PieChart, 
  Briefcase,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Activity
} from 'lucide-react';
import type { Objective, KPI, TeamMember } from '../types';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [fetchedObjectives, fetchedKpis, fetchedTeam] = await Promise.all([
        objectiveService.getObjectives(),
        kpiService.getKPIs(),
        teamService.getTeamMembers()
      ]);
      setObjectives(fetchedObjectives);
      setKpis(fetchedKpis);
      setTeamMembers(fetchedTeam);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-100 text-green-800';
      case 'at-risk':
        return 'bg-yellow-100 text-yellow-800';
      case 'behind':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'at-risk':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'behind':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const calculateOverallProgress = () => {
    if (!objectives.length) return 0;
    return Math.round(objectives.reduce((sum, obj) => sum + obj.progress, 0) / objectives.length);
  };

  const calculateKPIHealth = () => {
    if (!kpis.length) return { onTrack: 0, atRisk: 0, behind: 0 };
    return kpis.reduce((acc, kpi) => {
      acc[kpi.status === 'on-track' ? 'onTrack' : kpi.status === 'at-risk' ? 'atRisk' : 'behind']++;
      return acc;
    }, { onTrack: 0, atRisk: 0, behind: 0 });
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out p-8`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.displayName || 'User'}!</h1>
            <p className="mt-1 text-sm text-gray-500">
              Here's an overview of your organization's performance
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <p className="ml-3 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Key Metrics */}
          <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Target className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                    <p className="text-2xl font-semibold text-gray-900">{calculateOverallProgress()}%</p>
                  </div>
                </div>
                <Activity className="h-8 w-8 text-primary-200" />
              </div>
              <div className="mt-4">
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 rounded-full bg-primary-600"
                    style={{ width: `${calculateOverallProgress()}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <PieChart className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">KPIs</p>
                    <p className="text-2xl font-semibold text-gray-900">{kpis.length}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-green-600">{calculateKPIHealth().onTrack} on track</span>
                  <span className="text-xs text-gray-500">{calculateKPIHealth().atRisk} at risk</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Team Members</p>
                    <p className="text-2xl font-semibold text-gray-900">{teamMembers.length}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {teamMembers.filter(m => m.status === 'active').length} active
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Briefcase className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Objectives</p>
                    <p className="text-2xl font-semibold text-gray-900">{objectives.length}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end text-sm">
                  <span className="text-green-600">{objectives.filter(o => o.status === 'on-track').length} on track</span>
                  <span className="text-yellow-600">{objectives.filter(o => o.status === 'at-risk').length} at risk</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Recent Objectives */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Recent Objectives</h2>
                  <button
                    onClick={() => navigate('/objectives')}
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                  >
                    View all
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {objectives.slice(0, 5).map((objective) => (
                  <div key={objective.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{objective.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">{objective.description}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(objective.status)}`}>
                        {objective.status.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{objective.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-primary-600 rounded-full"
                          style={{ width: `${objective.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Performance Indicators */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Key Performance Indicators</h2>
                  <button
                    onClick={() => navigate('/kpis')}
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                  >
                    View all
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {kpis.slice(0, 5).map((kpi) => (
                  <div key={kpi.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{kpi.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">{kpi.category}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(kpi.trend)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(kpi.status)}`}>
                          {kpi.value} / {kpi.target} {kpi.unit}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{kpi.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-primary-600 rounded-full"
                          style={{ width: `${kpi.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}