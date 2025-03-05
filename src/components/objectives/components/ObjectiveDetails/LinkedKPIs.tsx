import React from 'react';
import { Link, AlertTriangle, RefreshCw } from 'lucide-react';
import type { KPI } from '../../../../types';

interface LinkedKPIsProps {
  kpis: KPI[];
  loading: boolean;
  onUnlink?: (kpiId: string) => Promise<void>;
  canManage?: boolean;
}

export default function LinkedKPIs({ 
  kpis = [], 
  loading, 
  onUnlink,
  canManage = false
}: LinkedKPIsProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-20">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (kpis.length === 0) {
    return (
      <div className="text-sm text-gray-500 text-center py-4">
        No KPIs linked to this objective
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {kpis.map((kpi) => (
        <div
          key={kpi.id}
          className="p-4 bg-gray-50 rounded-lg"
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-sm font-medium text-gray-900">{kpi.name}</h4>
              <p className="text-xs text-gray-500 mt-1">{kpi.category}</p>
            </div>
            {canManage && onUnlink && (
              <button
                onClick={() => onUnlink(kpi.id)}
                className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Unlink KPI"
              >
                <Link className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              kpi.trend === 'up' ? 'bg-green-100 text-green-800' :
              kpi.trend === 'down' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {kpi.value} / {kpi.target} {kpi.unit}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              kpi.status === 'on-track' ? 'bg-green-100 text-green-800' :
              kpi.status === 'at-risk' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {kpi.status.replace('-', ' ')}
            </span>
          </div>
          <div className="mt-2">
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 rounded-full bg-primary-600 transition-all duration-300"
                style={{ width: `${(kpi.value / kpi.target) * 100}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-gray-500 text-right">
              Last updated: {new Date(kpi.lastUpdated).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}