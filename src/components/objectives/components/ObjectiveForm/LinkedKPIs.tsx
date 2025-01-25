import React from 'react';
import { Plus } from 'lucide-react';
import type { KPI } from '../../../../types';

interface LinkedKPIsProps {
  kpis: KPI[];
  selectedKPIs: string[];
  loading: boolean;
  onSelect: (kpiId: string) => void;
  onCreateNew: () => void;
}

export default function LinkedKPIs({ 
  kpis, 
  selectedKPIs, 
  loading, 
  onSelect,
  onCreateNew 
}: LinkedKPIsProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">Key Performance Indicators</label>
        <button
          type="button"
          onClick={onCreateNew}
          className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" />
          Create New KPI
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-20">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.id}
              className={`p-4 rounded-lg border ${
                selectedKPIs.includes(kpi.id)
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300'
              } cursor-pointer transition-colors`}
              onClick={() => onSelect(kpi.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{kpi.name}</h4>
                  <p className="text-xs text-gray-500">{kpi.category}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    kpi.status === 'on-track' ? 'bg-green-100 text-green-800' :
                    kpi.status === 'at-risk' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {kpi.status.replace('-', ' ')}
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{kpi.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full">
                  <div
                    className="h-1.5 bg-indigo-600 rounded-full"
                    style={{ width: `${kpi.progress}%` }}
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