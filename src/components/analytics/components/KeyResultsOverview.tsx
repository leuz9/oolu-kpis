import React from 'react';
import { PieChart } from 'lucide-react';

interface KeyResultMetrics {
  total: number;
  onTrack: number;
  atRisk: number;
  behind: number;
  trending: {
    up: number;
    down: number;
    neutral: number;
  };
}

interface KeyResultsOverviewProps {
  metrics: KeyResultMetrics;
}

export default function KeyResultsOverview({ metrics }: KeyResultsOverviewProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Key Results Overview</h2>
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Total Key Results</span>
            <span className="text-lg font-semibold text-gray-900">{metrics.total}</span>
          </div>
          <div className="flex space-x-2">
            <div className="flex-1 h-2 bg-green-100 rounded-full">
              <div
                className="h-2 bg-green-500 rounded-full"
                style={{ width: `${(metrics.onTrack / metrics.total) * 100}%` }}
              />
            </div>
            <div className="flex-1 h-2 bg-yellow-100 rounded-full">
              <div
                className="h-2 bg-yellow-500 rounded-full"
                style={{ width: `${(metrics.atRisk / metrics.total) * 100}%` }}
              />
            </div>
            <div className="flex-1 h-2 bg-red-100 rounded-full">
              <div
                className="h-2 bg-red-500 rounded-full"
                style={{ width: `${(metrics.behind / metrics.total) * 100}%` }}
              />
            </div>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <div className="flex items-center">
              <div className="h-3 w-3 bg-green-500 rounded-full mr-1" />
              <span>{metrics.onTrack} On Track</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 bg-yellow-500 rounded-full mr-1" />
              <span>{metrics.atRisk} At Risk</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 bg-red-500 rounded-full mr-1" />
              <span>{metrics.behind} Behind</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Key Results Trends</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-green-500 mb-1">↑</div>
              <span className="block text-2xl font-semibold text-gray-900">{metrics.trending.up}</span>
              <span className="text-xs text-gray-500">Improving</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-gray-500 mb-1">−</div>
              <span className="block text-2xl font-semibold text-gray-900">{metrics.trending.neutral}</span>
              <span className="text-xs text-gray-500">Stable</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-red-500 mb-1">↓</div>
              <span className="block text-2xl font-semibold text-gray-900">{metrics.trending.down}</span>
              <span className="text-xs text-gray-500">Declining</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}