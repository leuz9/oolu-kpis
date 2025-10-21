import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Award, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star
} from 'lucide-react';
import { userService } from '../../../services/userService';
import type { AppraisalCycle, Appraisal, AppraisalAnalytics, User } from '../../../types';

const formatDate = (date: any): string => {
  if (!date) return 'N/A';
  try {
    // Handle Firestore Timestamp
    if (date?.toDate && typeof date.toDate === 'function') {
      return date.toDate().toLocaleDateString();
    }
    // Handle string or Date object
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'N/A';
    }
    return dateObj.toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

interface AppraisalDashboardProps {
  cycles: AppraisalCycle[];
  appraisals: Appraisal[];
  analytics: AppraisalAnalytics | null;
  selectedCycle: string | null;
  onCycleChange: (cycleId: string) => void;
}

export function AppraisalDashboard({ 
  cycles, 
  appraisals, 
  analytics, 
  selectedCycle, 
  onCycleChange 
}: AppraisalDashboardProps) {
  const [users, setUsers] = useState<{ [key: string]: User }>({});
  const [loadingUsers, setLoadingUsers] = useState(true);

  const currentCycle = cycles.find(c => c.id === selectedCycle);
  const cycleAppraisals = appraisals.filter(a => a.cycleId === selectedCycle);

  useEffect(() => {
    loadUsers();
  }, [appraisals]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const userIds = new Set<string>();
      
      // Collect employee IDs
      appraisals.forEach(appraisal => {
        if (appraisal.employeeId && typeof appraisal.employeeId === 'string' && appraisal.employeeId.trim()) {
          userIds.add(appraisal.employeeId);
        }
      });

      const usersMap: { [key: string]: User } = {};
      await Promise.all(
        Array.from(userIds).map(async (userId) => {
          try {
            const user = await userService.getUser(userId);
            if (user) {
              usersMap[userId] = user;
            }
          } catch (error) {
            console.error(`Error loading user ${userId}:`, error);
          }
        })
      );

      setUsers(usersMap);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const getEmployeeName = (employeeId: string): string => {
    if (!employeeId || typeof employeeId !== 'string') return 'N/A';
    return users[employeeId]?.displayName || employeeId;
  };

  const getStatusStats = () => {
    const statusCounts = {
      draft: 0,
      'self-review': 0,
      'manager-review': 0,
      'hr-review': 0,
      completed: 0,
      cancelled: 0
    };

    cycleAppraisals.forEach(appraisal => {
      if (statusCounts.hasOwnProperty(appraisal.status)) {
        statusCounts[appraisal.status as keyof typeof statusCounts]++;
      }
    });

    return statusCounts;
  };

  const getRatingDistribution = () => {
    const ratings = cycleAppraisals
      .filter(a => a.overallRating && typeof a.overallRating === 'number' && !isNaN(a.overallRating))
      .map(a => a.overallRating!);
    
    const distribution = {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0
    };

    ratings.forEach(rating => {
      const key = Math.floor(rating).toString() as keyof typeof distribution;
      if (distribution[key] !== undefined) {
        distribution[key]++;
      }
    });

    return distribution;
  };

  const getAverageRating = () => {
    const ratings = cycleAppraisals
      .filter(a => a.overallRating && typeof a.overallRating === 'number' && !isNaN(a.overallRating))
      .map(a => a.overallRating!);
    
    if (ratings.length === 0) return 0;
    
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    return sum / ratings.length;
  };

  const getProgressData = () => {
    const now = new Date();
    const startDate = currentCycle ? new Date(currentCycle.startDate) : now;
    const endDate = currentCycle ? new Date(currentCycle.endDate) : now;
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      totalDays: Math.max(totalDays, 1),
      elapsedDays: Math.max(elapsedDays, 0),
      progress: Math.min((elapsedDays / totalDays) * 100, 100)
    };
  };

  const statusStats = getStatusStats();
  const ratingDistribution = getRatingDistribution();
  const averageRating = getAverageRating();
  const progressData = getProgressData();

  return (
    <div className="space-y-6">
      {/* Cycle Overview */}
      {currentCycle && (
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6 border border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-primary-900">{currentCycle.name}</h2>
              <p className="text-primary-700 mt-1">{currentCycle.description}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-primary-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(currentCycle.startDate)} - {formatDate(currentCycle.endDate)}
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="h-4 w-4" />
                  {currentCycle.status.charAt(0).toUpperCase() + currentCycle.status.slice(1)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-900">{cycleAppraisals.length}</div>
              <div className="text-sm text-primary-600">Total Appraisals</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-primary-600 mb-2">
              <span>Cycle Progress</span>
              <span>{progressData.progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-primary-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressData.progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {cycleAppraisals.length > 0 
                  ? ((statusStats.completed / cycleAppraisals.length) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {cycleAppraisals.filter(a => a.overallRating && typeof a.overallRating === 'number').length} rated
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {statusStats['self-review'] + statusStats['manager-review'] + statusStats['hr-review']}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{statusStats.draft}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
          <div className="space-y-3">
            {Object.entries(statusStats).map(([status, count]) => {
              const percentage = cycleAppraisals.length > 0 ? (count / cycleAppraisals.length) * 100 : 0;
              const statusColors = {
                draft: 'bg-gray-500',
                'self-review': 'bg-blue-500',
                'manager-review': 'bg-yellow-500',
                'hr-review': 'bg-purple-500',
                completed: 'bg-green-500',
                cancelled: 'bg-red-500'
              };
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${statusColors[status as keyof typeof statusColors]}`}></div>
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {status.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{count}</span>
                    <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {Object.entries(ratingDistribution).map(([rating, count]) => {
              const totalRatings = Object.values(ratingDistribution).reduce((sum, c) => sum + c, 0);
              const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${
                            i < parseInt(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{rating} Star{rating !== '1' ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{count}</span>
                    <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {cycleAppraisals
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 5)
            .map((appraisal) => (
              <div key={appraisal.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    appraisal.status === 'completed' ? 'bg-green-500' :
                    ['self-review', 'manager-review', 'hr-review'].includes(appraisal.status) ? 'bg-yellow-500' :
                    'bg-gray-400'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {getEmployeeName(appraisal.employeeId)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {appraisal.status.charAt(0).toUpperCase() + appraisal.status.slice(1).replace('-', ' ')}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(appraisal.updatedAt)}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
