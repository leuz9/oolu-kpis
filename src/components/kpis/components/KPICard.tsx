import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Pencil, Trash2, RefreshCw, Users } from 'lucide-react';
import type { KPI, User } from '../../../types';
import KPIUpdateModal from './KPIUpdateModal';

interface KPICardProps {
  kpi: KPI;
  contributors?: User[];
  onEdit: () => void;
  onDelete: () => void;
  onUpdate?: (kpiId: string, value: number, comment: string) => Promise<void>;
  isAdmin: boolean;
}

export default function KPICard({ 
  kpi, 
  contributors = [], 
  onEdit, 
  onDelete, 
  onUpdate,
  isAdmin 
}: KPICardProps) {
  const [showUpdateModal, setShowUpdateModal] = useState(false);

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

  const getStatusColor = (status: KPI['status']) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-100 text-green-800';
      case 'at-risk':
        return 'bg-yellow-100 text-yellow-800';
      case 'behind':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{kpi.name}</h3>
            <p className="text-sm text-gray-500">{kpi.category}</p>
          </div>
          <div className="flex items-center space-x-2">
            {onUpdate && (
              <button
                onClick={() => setShowUpdateModal(true)}
                className="p-1 text-gray-400 hover:text-primary-600"
                title="Update Value"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onEdit}
              className="p-1 text-gray-400 hover:text-primary-600"
            >
              <Pencil className="h-4 w-4" />
            </button>
            {isAdmin && (
              <button
                onClick={onDelete}
                className="p-1 text-gray-400 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-semibold text-gray-900">
            {kpi.value} {kpi.unit}
          </div>
          {getTrendIcon(kpi.trend)}
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Progress</span>
            <span>{kpi.progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-primary-600 rounded-full transition-all duration-300"
              style={{ width: `${kpi.progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Current: {kpi.value}</span>
            <span>Target: {kpi.target}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(kpi.status)}`}>
            {kpi.status.replace('-', ' ')}
          </span>
          <div className="flex items-center text-gray-500">
            <Users className="h-4 w-4 mr-1" />
            {contributors.length} contributors
          </div>
          <span className="text-gray-500">
            Updated {new Date(kpi.lastUpdated).toLocaleDateString()}
          </span>
        </div>

        {contributors.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex -space-x-2 overflow-hidden">
              {contributors.map((contributor, index) => (
                <div
                  key={contributor.id}
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                  title={contributor.displayName || contributor.email}
                >
                  {contributor.photoURL ? (
                    <img
                      src={contributor.photoURL}
                      alt={contributor.displayName || ''}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-medium text-sm">
                        {contributor.displayName?.charAt(0) || contributor.email.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showUpdateModal && (
        <KPIUpdateModal
          kpi={kpi}
          onClose={() => setShowUpdateModal(false)}
          onUpdate={onUpdate!}
        />
      )}
    </>
  );
}