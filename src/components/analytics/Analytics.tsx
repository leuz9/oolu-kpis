import React, { useState } from 'react';
import Sidebar from '../Sidebar';
import { BarChart3, TrendingUp, Users, Target, PieChart, Calendar, ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface AnalyticCard {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  period: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

const analyticsCards: AnalyticCard[] = [
  {
    title: 'Objective Completion Rate',
    value: '78%',
    change: 12,
    trend: 'up',
    period: 'vs last quarter'
  },
  {
    title: 'Active Projects',
    value: '24',
    change: -3,
    trend: 'down',
    period: 'vs last month'
  },
  {
    title: 'Team Performance',
    value: '92%',
    change: 5,
    trend: 'up',
    period: 'vs last month'
  },
  {
    title: 'KPIs On Track',
    value: '85%',
    change: 0,
    trend: 'neutral',
    period: 'vs last month'
  }
];

const performanceData: ChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Objectives',
      data: [65, 72, 78, 75, 82, 88]
    },
    {
      label: 'KPIs',
      data: [70, 75, 72, 80, 85, 90]
    }
  ]
};

export default function Analytics() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const TrendIcon = ({ trend, value }: { trend: string; value: number }) => {
    if (trend === 'up') {
      return <ArrowUp className="h-4 w-4 text-green-500" />;
    } else if (trend === 'down') {
      return <ArrowDown className="h-4 w-4 text-red-500" />;
    }
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out p-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Monitor performance metrics and trends
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {analyticsCards.map((card, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {card.period}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                    <div className="ml-2 flex items-center text-sm">
                      <TrendIcon trend={card.trend} value={card.change} />
                      <span className={`ml-1 ${
                        card.trend === 'up' ? 'text-green-600' : 
                        card.trend === 'down' ? 'text-red-600' : 
                        'text-gray-500'
                      }`}>
                        {card.change > 0 ? '+' : ''}{card.change}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Performance Trends */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Performance Trends</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <span className="h-3 w-3 bg-primary-500 rounded-full"></span>
                    <span className="ml-2 text-sm text-gray-500">Objectives</span>
                  </div>
                  <div className="flex items-center">
                    <span className="h-3 w-3 bg-primary-200 rounded-full"></span>
                    <span className="ml-2 text-sm text-gray-500">KPIs</span>
                  </div>
                </div>
              </div>
              <div className="h-80">
                {/* Chart placeholder - In a real app, use a charting library like Chart.js or Recharts */}
                <div className="w-full h-full bg-gray-50 rounded flex items-center justify-center">
                  <BarChart3 className="h-12 w-12 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Team Analytics */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Team Analytics</h3>
                <div className="flex items-center space-x-4">
                  <button className="text-sm text-gray-500 hover:text-gray-700">Export</button>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-400" />
                    <span className="ml-2 text-sm font-medium text-gray-900">Active Members</span>
                  </div>
                  <span className="text-sm text-gray-500">32/35</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Target className="h-5 w-5 text-gray-400" />
                    <span className="ml-2 text-sm font-medium text-gray-900">Objectives Assigned</span>
                  </div>
                  <span className="text-sm text-gray-500">128</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <PieChart className="h-5 w-5 text-gray-400" />
                    <span className="ml-2 text-sm font-medium text-gray-900">KPIs Monitored</span>
                  </div>
                  <span className="text-sm text-gray-500">45</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="ml-2 text-sm font-medium text-gray-900">Check-ins This Week</span>
                  </div>
                  <span className="text-sm text-gray-500">156</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}