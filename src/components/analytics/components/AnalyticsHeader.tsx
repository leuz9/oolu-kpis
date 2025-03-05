import React from 'react';
import { Download, RefreshCw } from 'lucide-react';

interface AnalyticsHeaderProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  onRefresh: () => void;
}

export default function AnalyticsHeader({ selectedPeriod, onPeriodChange, onRefresh }: AnalyticsHeaderProps) {
  return (
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
          onChange={(e) => onPeriodChange(e.target.value)}
          className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
          <option value="year">Last Year</option>
        </select>
        <button 
          onClick={onRefresh}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
        <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </button>
      </div>
    </div>
  );
}