import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { KPI } from '../../../../types';

interface StatusPreviewProps {
  trend: KPI['trend'];
  value: number;
  target: number;
  status: KPI['status'];
}

export default function StatusPreview({ trend, value, target, status }: StatusPreviewProps) {
  const getTrendIcon = (trend: KPI['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="text-sm font-medium text-gray-700 mb-3">KPI Status Preview</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-500">Trend:</div>
          <div className="flex items-center">
            {getTrendIcon(trend)}
            <span className="ml-1 text-sm font-medium capitalize">{trend}</span>
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Progress:</div>
          <div className="mt-1">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-2 bg-primary-600 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((value / target) * 100))}%` }}
              />
            </div>
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Status:</div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status === 'on-track' ? 'bg-green-100 text-green-800' :
            status === 'at-risk' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {status.replace('-', ' ')}
          </span>
        </div>
      </div>
    </div>
  );
}