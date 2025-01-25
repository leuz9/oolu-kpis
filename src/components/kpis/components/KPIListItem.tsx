import React from 'react';
import { TrendingUp, TrendingDown, Minus, Pencil, Trash2 } from 'lucide-react';
import type { KPI } from '../../../types';

interface KPIListItemProps {
  kpi: KPI;
  onEdit: () => void;
  onDelete: () => void;
}

export default function KPIListItem({ kpi, onEdit, onDelete }: KPIListItemProps) {
  const getTrendIcon = (trend: KPI['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
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
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div>
            <div className="text-sm font-medium text-gray-900">{kpi.name}</div>
            <div className="text-sm text-gray-500">{kpi.description}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{kpi.category}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-1 mr-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{kpi.value} / {kpi.target} {kpi.unit}</span>
              <span>{kpi.progress}%</span>
            </div>
            <div className="w-32 h-1.5 bg-gray-200 rounded-full">
              <div
                className="h-1.5 bg-primary-600 rounded-full"
                style={{ width: `${kpi.progress}%` }}
              />
            </div>
          </div>
          {getTrendIcon(kpi.trend)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(kpi.status)}`}>
          {kpi.status.replace('-', ' ')}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(kpi.lastUpdated).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-2">
          <button
            onClick={onEdit}
            className="text-indigo-600 hover:text-indigo-900"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-900"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}