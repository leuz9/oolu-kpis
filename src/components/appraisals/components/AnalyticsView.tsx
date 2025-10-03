import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Download, 
  Filter,
  Calendar,
  Users,
  Star,
  Target,
  Award,
  TrendingDown
} from 'lucide-react';
import { AppraisalService } from '../../../services/appraisalService';
import type { AppraisalCycle, AppraisalAnalytics } from '../../../types';

interface AnalyticsViewProps {
  analytics: AppraisalAnalytics | null;
  cycles: AppraisalCycle[];
  selectedCycle: string | null;
  onCycleChange: (cycleId: string) => void;
}

export function AnalyticsView({ 
  analytics, 
  cycles, 
  selectedCycle, 
  onCycleChange 
}: AnalyticsViewProps) {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('year');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  const getRatingTrend = () => {
    // Mock data for rating trends over time
    return [
      { month: 'Jan', rating: 3.2 },
      { month: 'Feb', rating: 3.4 },
      { month: 'Mar', rating: 3.1 },
      { month: 'Apr', rating: 3.6 },
      { month: 'May', rating: 3.8 },
      { month: 'Jun', rating: 4.0 },
      { month: 'Jul', rating: 3.9 },
      { month: 'Aug', rating: 4.1 },
      { month: 'Sep', rating: 4.2 },
      { month: 'Oct', rating: 4.0 },
      { month: 'Nov', rating: 4.3 },
      { month: 'Dec', rating: 4.1 }
    ];
  };

  const getCompetencyGaps = () => {
    return analytics?.competencyGaps || [
      { competency: 'Communication', averageRating: 3.2, improvementNeeded: true },
      { competency: 'Leadership', averageRating: 3.8, improvementNeeded: false },
      { competency: 'Technical Skills', averageRating: 4.1, improvementNeeded: false },
      { competency: 'Problem Solving', averageRating: 3.5, improvementNeeded: true },
      { competency: 'Teamwork', averageRating: 4.0, improvementNeeded: false }
    ];
  };

  const getDepartmentPerformance = () => {
    return analytics?.departmentBreakdown || {
      'Engineering': { count: 25, averageRating: 4.2 },
      'Sales': { count: 18, averageRating: 3.8 },
      'Marketing': { count: 12, averageRating: 3.9 },
      'HR': { count: 8, averageRating: 4.1 },
      'Finance': { count: 6, averageRating: 3.7 }
    };
  };

  const ratingTrend = getRatingTrend();
  const competencyGaps = getCompetencyGaps();
  const departmentPerformance = getDepartmentPerformance();

  const handleExport = () => {
    if (!analytics) return;

    // Create CSV content
    let csvContent = 'Appraisal Analytics Report\n\n';
    csvContent += `Cycle ID: ${analytics.cycleId}\n`;
    csvContent += `Total Appraisals: ${analytics.totalAppraisals}\n`;
    csvContent += `Completed Appraisals: ${analytics.completedAppraisals}\n`;
    csvContent += `Average Rating: ${analytics.averageRating.toFixed(2)}\n\n`;

    csvContent += 'Rating Distribution\n';
    csvContent += 'Rating,Count\n';
    Object.entries(analytics.ratingDistribution).forEach(([rating, count]) => {
      csvContent += `${rating},${count}\n`;
    });

    csvContent += '\nDepartment Performance\n';
    csvContent += 'Department,Count,Average Rating\n';
    Object.entries(departmentPerformance).forEach(([dept, data]) => {
      csvContent += `${dept},${data.count},${data.averageRating.toFixed(2)}\n`;
    });

    csvContent += '\nCompetency Analysis\n';
    csvContent += 'Competency,Average Rating,Improvement Needed\n';
    competencyGaps.forEach(comp => {
      csvContent += `${comp.competency},${comp.averageRating.toFixed(2)},${comp.improvementNeeded ? 'Yes' : 'No'}\n`;
    });

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `appraisal-analytics-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Analytics & Reports</h2>
          <p className="text-gray-600 mt-1">Comprehensive insights and performance analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Download className="h-5 w-5" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.averageRating ? analytics.averageRating.toFixed(1) : 'N/A'}
              </p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">+0.3 from last cycle</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Star className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics ? ((analytics.completedAppraisals / analytics.totalAppraisals) * 100).toFixed(1) : 0}%
              </p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">+5% from last cycle</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Target className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Appraisals</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.totalAppraisals || 0}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">+12 from last cycle</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Top Performers</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.ratingDistribution ? 
                  (analytics.ratingDistribution['5'] || 0) + (analytics.ratingDistribution['4'] || 0) : 0}
              </p>
              <div className="flex items-center mt-1">
                <Award className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-yellow-600 ml-1">4+ star ratings</span>
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {Object.entries(analytics?.ratingDistribution || { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }).map(([rating, count]) => {
              const total = Object.values(analytics?.ratingDistribution || {}).reduce((sum, c) => sum + c, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              
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
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Performance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Performance</h3>
          <div className="space-y-4">
            {Object.entries(departmentPerformance).map(([department, data]) => (
              <div key={department} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{department}</p>
                  <p className="text-xs text-gray-500">{data.count} appraisals</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${
                          i < Math.floor(data.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{data.averageRating.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Competency Analysis */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Competency Analysis</h3>
        <div className="space-y-4">
          {competencyGaps.map((competency, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  competency.improvementNeeded ? 'bg-red-500' : 'bg-green-500'
                }`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{competency.competency}</p>
                  <p className="text-xs text-gray-500">
                    {competency.improvementNeeded ? 'Needs improvement' : 'Performing well'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${
                        i < Math.floor(competency.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-900">{competency.averageRating.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rating Trend */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Trend Over Time</h3>
        <div className="h-64 flex items-end justify-between gap-2">
          {ratingTrend.map((data, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div 
                className="bg-primary-600 rounded-t w-8 transition-all duration-300 hover:bg-primary-700"
                style={{ height: `${(data.rating / 5) * 200}px` }}
                title={`${data.month}: ${data.rating}`}
              ></div>
              <span className="text-xs text-gray-500">{data.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
