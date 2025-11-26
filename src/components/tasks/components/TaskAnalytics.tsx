import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Calendar, Target, Award, Flame } from 'lucide-react';
import type { Task } from '../../../types';

interface TaskAnalyticsProps {
  tasks: Task[];
  filteredTasks: Task[];
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    dueToday: number;
    overdue: number;
    urgent: number;
    completionRate: number;
  };
}

export default function TaskAnalytics({ tasks, filteredTasks, stats }: TaskAnalyticsProps) {
  const analytics = useMemo(() => {
    // Priority distribution (based on filtered tasks)
    const priorityDistribution = {
      urgent: filteredTasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length,
      high: filteredTasks.filter(t => t.priority === 'high' && t.status !== 'done').length,
      medium: filteredTasks.filter(t => t.priority === 'medium' && t.status !== 'done').length,
      low: filteredTasks.filter(t => t.priority === 'low' && t.status !== 'done').length,
    };

    // Status distribution (based on filtered tasks)
    const statusDistribution = {
      todo: filteredTasks.filter(t => t.status === 'todo').length,
      'in-progress': filteredTasks.filter(t => t.status === 'in-progress').length,
      review: filteredTasks.filter(t => t.status === 'review').length,
      blocked: filteredTasks.filter(t => t.status === 'blocked').length,
      done: filteredTasks.filter(t => t.status === 'done').length,
    };

    // Completion trend (last 7 days) - based on filtered tasks
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });

    const completionTrend = last7Days.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      return filteredTasks.filter(t => {
        if (t.status !== 'done') return false;
        const completedDate = new Date(t.updatedAt).toISOString().split('T')[0];
        return completedDate === dateStr;
      }).length;
    });

    // Average completion time (based on filtered tasks)
    const completedTasks = filteredTasks.filter(t => t.status === 'done');
    const avgCompletionTime = completedTasks.length > 0
      ? completedTasks.reduce((sum, task) => {
          const created = new Date(task.createdAt).getTime();
          const updated = new Date(task.updatedAt).getTime();
          return sum + (updated - created);
        }, 0) / completedTasks.length
      : 0;

    const avgDays = Math.round(avgCompletionTime / (1000 * 60 * 60 * 24));

    return {
      priorityDistribution,
      statusDistribution,
      completionTrend,
      avgDays,
    };
  }, [filteredTasks]);

  const maxTrend = Math.max(...analytics.completionTrend, 1);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-100 text-sm mb-1">Completion Rate</p>
              <p className="text-4xl font-bold">{stats.completionRate.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-white/20 rounded-full">
              <Target className="h-8 w-8" />
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-green-100 text-sm mb-1">Completed Tasks</p>
              <p className="text-4xl font-bold">{stats.completed}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-full">
              <Award className="h-8 w-8" />
            </div>
          </div>
          <p className="text-green-100 text-sm">Out of {stats.total} total tasks</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-purple-100 text-sm mb-1">Avg. Completion</p>
              <p className="text-4xl font-bold">{analytics.avgDays}</p>
              <p className="text-purple-100 text-sm mt-1">days</p>
            </div>
            <div className="p-3 bg-white/20 rounded-full">
              <Calendar className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary-600" />
            Status Distribution
          </h3>
          <div className="space-y-4">
            {Object.entries(analytics.statusDistribution).map(([status, count]) => {
              const percentage = filteredTasks.length > 0 ? (count / filteredTasks.length) * 100 : 0;
              const colors = {
                todo: 'bg-gray-500',
                'in-progress': 'bg-blue-500',
                review: 'bg-yellow-500',
                blocked: 'bg-red-500',
                done: 'bg-green-500',
              };
              
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 capitalize">{status.replace('-', ' ')}</span>
                    <span className="text-sm text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${colors[status as keyof typeof colors]} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Flame className="h-5 w-5 text-red-600" />
            Priority Distribution
          </h3>
          <div className="space-y-4">
            {Object.entries(analytics.priorityDistribution).map(([priority, count]) => {
              const totalActive = Object.values(analytics.priorityDistribution).reduce((a, b) => a + b, 0);
              const percentage = totalActive > 0 ? (count / totalActive) * 100 : 0;
              const colors = {
                urgent: 'bg-red-500',
                high: 'bg-orange-500',
                medium: 'bg-yellow-500',
                low: 'bg-green-500',
              };
              
              return (
                <div key={priority}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 capitalize">{priority}</span>
                    <span className="text-sm text-gray-600">{count} ({totalActive > 0 ? percentage.toFixed(1) : 0}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${colors[priority as keyof typeof colors]} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Completion Trend */}
        <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            Completion Trend (Last 7 Days)
          </h3>
          <div className="flex items-end justify-between h-64 gap-2">
            {analytics.completionTrend.map((count, index) => {
              const date = new Date();
              date.setDate(date.getDate() - (6 - index));
              const height = (count / maxTrend) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center justify-end h-full">
                    <div
                      className="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg transition-all duration-500 hover:from-primary-600 hover:to-primary-500"
                      style={{ height: `${Math.max(height, 5)}%` }}
                      title={`${count} tasks completed`}
                    />
                  </div>
                  <div className="mt-2 text-xs text-gray-600 text-center">
                    <div>{date.toLocaleDateString('en-US', { month: 'short' })}</div>
                    <div className="font-semibold">{date.getDate()}</div>
                  </div>
                  <div className="mt-1 text-xs font-semibold text-primary-600">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
          <div className="text-2xl font-bold text-gray-900">{stats.urgent}</div>
          <div className="text-sm text-gray-600">Urgent Tasks</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
          <div className="text-2xl font-bold text-gray-900">{stats.inProgress}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-orange-500">
          <div className="text-2xl font-bold text-gray-900">{stats.dueToday}</div>
          <div className="text-sm text-gray-600">Due Today</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-600">
          <div className="text-2xl font-bold text-gray-900">{stats.overdue}</div>
          <div className="text-sm text-gray-600">Overdue</div>
        </div>
      </div>
    </div>
  );
}

