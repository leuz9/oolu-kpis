import React from 'react';
import { Link, AlertTriangle } from 'lucide-react';
import type { KPI } from '../../../../types';

interface LinkedKPIsProps {
  linkedKPIs: KPI[];
  loading: boolean;
  error: string | null;
  onManageKPIs: () => void;
}

export default function LinkedKPIs({ linkedKPIs, loading, error, onManageKPIs }: LinkedKPIsProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Linked KPIs</h3>
        <button
          onClick={onManageKPIs}
          className="flex items-center px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          <Link className="h-4 w-4 mr-1" />
          Manage KPIs
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <p className="ml-3 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-20">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        </div>
      ) : linkedKPIs.length === 0 ? (
        <p className="text-sm text-gray-500">No KPIs linked to this objective</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {linkedKPIs.map((kpi) => (
            <div
              key={kpi.id}
              className="p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{kpi.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{kpi.category}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  kpi.trend === 'up' ? 'bg-green-100 text-green-800' :
                  kpi.trend === 'down' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {kpi.value} / {kpi.target} {kpi.unit}
                </span>
              </div>
              <div className="mt-2">
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 rounded-full bg-primary-600"
                    style={{ width: `${(kpi.value / kpi.target) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}