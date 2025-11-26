import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { objectiveService } from '../services/objectiveService';
import { kpiService } from '../services/kpiService';
import { teamService } from '../services/teamService';
import { projectService } from '../services/projectService';
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
  Activity,
  Clock,
  BarChart3,
  Building2,
  Flag,
  Award,
  Star,
  Zap,
  Layers,
  GitBranch,
  GitPullRequest,
  GitMerge,
  MessageSquare,
  FileText,
  Bell
} from 'lucide-react';
import type { Objective, KPI, TeamMember, Project } from '../types';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [keyResults, setKeyResults] = useState<KPI[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
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
      const [fetchedObjectives, fetchedKeyResults, fetchedTeam, fetchedProjects] = await Promise.all([
        objectiveService.getObjectives(),
        kpiService.getKPIs(),
        teamService.getTeamMembers(),
        projectService.getProjects()
      ]);
      setObjectives(fetchedObjectives);
      setKeyResults(fetchedKeyResults);
      setTeamMembers(fetchedTeam);
      setProjects(fetchedProjects);
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

  const calculateOverallProgress = () => {
    if (!objectives.length) return 0;
    return Math.round(objectives.reduce((sum, obj) => sum + obj.progress, 0) / objectives.length);
  };

  const calculateKeyResultsHealth = () => {
    if (!keyResults.length) return { onTrack: 0, atRisk: 0, behind: 0 };
    return keyResults.reduce((acc, kr) => {
      acc[kr.status === 'on-track' ? 'onTrack' : kr.status === 'at-risk' ? 'atRisk' : 'behind']++;
      return acc;
    }, { onTrack: 0, atRisk: 0, behind: 0 });
  };

  const calculateProjectMetrics = () => {
    const total = projects.length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const inProgress = projects.filter(p => p.status === 'in-progress').length;
    const onHold = projects.filter(p => p.status === 'on-hold').length;
    const atRisk = projects.filter(p => p.progress < 80 && new Date(p.dueDate) < new Date()).length;
    
    return {
      total,
      completed,
      inProgress,
      onHold,
      atRisk,
      completionRate: total ? Math.round((completed / total) * 100) : 0
    };
  };

  const calculateTeamMetrics = () => {
    const total = teamMembers.length;
    const active = teamMembers.filter(m => m.status === 'active').length;
    const utilization = teamMembers.reduce((sum, member) => sum + (member.utilization || 0), 0) / total;
    
    return {
      total,
      active,
      utilization: Math.round(utilization),
      departments: new Set(teamMembers.map(m => m.department)).size
    };
  };

  const projectMetrics = calculateProjectMetrics();
  const teamMetrics = calculateTeamMetrics();

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
      
      <div className={`flex-1 w-full ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out p-3 sm:p-4 lg:p-6`}>
        <div className="w-full">
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

          {/* Quick Stats */}
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
                    <p className="text-sm font-medium text-gray-600">Key Results</p>
                    <p className="text-2xl font-semibold text-gray-900">{keyResults.length}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-green-600">{calculateKeyResultsHealth().onTrack} on track</span>
                  <span className="text-xs text-gray-500">{calculateKeyResultsHealth().atRisk} at risk</span>
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
                    <p className="text-sm font-medium text-gray-600">Projects</p>
                    <p className="text-2xl font-semibold text-gray-900">{projects.length}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end text-sm">
                  <span className="text-green-600">{projectMetrics.completed} completed</span>
                  <span className="text-yellow-600">{projectMetrics.inProgress} in progress</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Performance Overview */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Performance Overview</h2>
                  <select className="text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last quarter</option>
                  </select>
                </div>
                <div className="space-y-6">
                  {/* Objectives Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-700">Objectives Progress</h3>
                      <span className="text-sm text-gray-500">{objectives.length} total</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-700">On Track</span>
                          <span className="text-lg font-semibold text-green-700">
                            {objectives.filter(o => o.status === 'on-track').length}
                          </span>
                        </div>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-yellow-700">At Risk</span>
                          <span className="text-lg font-semibold text-yellow-700">
                            {objectives.filter(o => o.status === 'at-risk').length}
                          </span>
                        </div>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-red-700">Behind</span>
                          <span className="text-lg font-semibold text-red-700">
                            {objectives.filter(o => o.status === 'behind').length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key Results Performance */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-700">Key Results Performance</h3>
                      <span className="text-sm text-gray-500">{keyResults.length} total</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-700">Achieved</span>
                          <span className="text-lg font-semibold text-green-700">
                            {keyResults.filter(k => k.value >= k.target).length}
                          </span>
                        </div>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-yellow-700">Near Target</span>
                          <span className="text-lg font-semibold text-yellow-700">
                            {keyResults.filter(k => k.value >= k.target * 0.8 && k.value < k.target).length}
                          </span>
                        </div>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-red-700">Below Target</span>
                          <span className="text-lg font-semibold text-red-700">
                            {keyResults.filter(k => k.value < k.target * 0.8).length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project Status */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-700">Project Status</h3>
                      <span className="text-sm text-gray-500">{projects.length} total</span>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-700">In Progress</span>
                          <span className="text-lg font-semibold text-blue-700">
                            {projectMetrics.inProgress}
                          </span>
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-700">Completed</span>
                          <span className="text-lg font-semibold text-green-700">
                            {projectMetrics.completed}
                          </span>
                        </div>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-yellow-700">On Hold</span>
                          <span className="text-lg font-semibold text-yellow-700">
                            {projectMetrics.onHold}
                          </span>
                        </div>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-red-700">At Risk</span>
                          <span className="text-lg font-semibold text-red-700">
                            {projectMetrics.atRisk}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Overview */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Team Overview</h2>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Active Members</span>
                      <span className="text-sm font-medium text-gray-900">
                        {teamMetrics.active}/{teamMetrics.total}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-green-500 rounded-full"
                        style={{ width: `${(teamMetrics.active / teamMetrics.total) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Resource Utilization</span>
                      <span className="text-sm font-medium text-gray-900">{teamMetrics.utilization}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${teamMetrics.utilization}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Departments</span>
                      <span className="text-sm font-medium text-gray-900">{teamMetrics.departments}</span>
                    </div>
                    <div className="flex -space-x-2">
                      {Array.from({ length: Math.min(5, teamMetrics.departments) }).map((_, i) => (
                        <div
                          key={i}
                          className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center ring-2 ring-white"
                        >
                          <Building2 className="h-4 w-4 text-primary-600" />
                        </div>
                      ))}
                      {teamMetrics.departments > 5 && (
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-2 ring-white">
                          <span className="text-xs text-gray-600">+{teamMetrics.departments - 5}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Flag className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">New objective created</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Award className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">Key result target achieved</p>
                      <p className="text-xs text-gray-500">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <Star className="h-4 w-4 text-purple-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">Project milestone completed</p>
                      <p className="text-xs text-gray-500">Yesterday</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Upcoming Deadlines</h2>
                  <button className="text-sm text-primary-600 hover:text-primary-700">View all</button>
                </div>
                <div className="space-y-4">
                  {objectives
                    .filter(obj => new Date(obj.dueDate) > new Date())
                    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                    .slice(0, 3)
                    .map(objective => (
                      <div key={objective.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {objective.level === 'company' && <Target className="h-5 w-5 text-primary-600" />}
                            {objective.level === 'department' && <Building2 className="h-5 w-5 text-blue-600" />}
                            {objective.level === 'individual' && <Users className="h-5 w-5 text-green-600" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{objective.title}</p>
                            <p className="text-xs text-gray-500">Due {new Date(objective.dueDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-gray-500">{objective.progress}% complete</div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(objective.status)}`}>
                            {objective.status.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Recent Updates */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Recent Updates</h2>
                  <button className="text-sm text-primary-600 hover:text-primary-700">View all</button>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <GitBranch className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">New objective branch created</p>
                      <p className="text-xs text-gray-500">by John Doe • 2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <GitPullRequest className="h-4 w-4 text-purple-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">Key result target adjustment proposed</p>
                      <p className="text-xs text-gray-500">by Sarah Smith • 4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <GitMerge className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">Project milestone merged</p>
                      <p className="text-xs text-gray-500">by Mike Johnson • 6 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}