import React from 'react';
import { TrendingUp, TrendingDown, Minus, Pencil, Trash2, Users } from 'lucide-react';
import type { KPI, User } from '../../../types';

interface ListViewProps {
  kpis: KPI[];
  contributors: Map<string, User[]>;
  onEdit: (kpi: KPI) => void;
  onDelete: (id: string) => void;
  onUpdate?: (kpiId: string, value: number, comment: string) => Promise<void>;
  isAdmin: boolean;
}

export default function ListView({
  kpis,
  contributors,
  onEdit,
  onDelete,
  onUpdate,
  isAdmin
}: ListViewProps) {
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
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Key Result
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contributors
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {kpis.map((kpi) => (
              <tr key={kpi.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{kpi.name}</div>
                    <div className="text-sm text-gray-500">{kpi.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {kpi.category}
                  </span>
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex -space-x-2">
                      {(contributors.get(kpi.id) || []).slice(0, 3).map((contributor, index) => (
                        <div
                          key={contributor.id}
                          className="h-6 w-6 rounded-full ring-2 ring-white"
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
                              <span className="text-primary-600 font-medium text-xs">
                                {contributor.displayName?.charAt(0) || contributor.email.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {(contributors.get(kpi.id)?.length || 0) > 3 && (
                      <span className="ml-2 text-xs text-gray-500">
                        +{(contributors.get(kpi.id)?.length || 0) - 3} more
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(kpi.lastUpdated).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onEdit(kpi)}
                      className="p-1 text-gray-400 hover:text-primary-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => onDelete(kpi.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}