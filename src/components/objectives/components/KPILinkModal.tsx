import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Unlink, Filter, BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { kpiService } from '../../../services/kpiService';
import type { KPI } from '../../../types';

interface KPILinkModalProps {
  objectiveId: string;
  linkedKPIs: KPI[];
  onClose: () => void;
  onLink: (kpiId: string) => Promise<void>;
  onUnlink: (kpiId: string) => Promise<void>;
}

export default function KPILinkModal({
  objectiveId,
  linkedKPIs,
  onClose,
  onLink,
  onUnlink
}: KPILinkModalProps) {
  const [availableKPIs, setAvailableKPIs] = useState<KPI[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTrend, setSelectedTrend] = useState<string>('all');

  useEffect(() => {
    fetchAvailableKPIs();
  }, []);

  const fetchAvailableKPIs = async () => {
    try {
      setLoading(true);
      const kpis = await kpiService.getUnlinkedKPIs();
      setAvailableKPIs(kpis);
    } catch (err) {
      setError('Failed to load available KPIs');
      console.error('Error fetching KPIs:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(availableKPIs.map(kpi => kpi.category))];
  const statuses = ['all', 'on-track', 'at-risk', 'behind'];
  const trends = ['all', 'up', 'down', 'stable'];

  const filteredKPIs = availableKPIs.filter(kpi => {
    const matchesSearch = kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kpi.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || kpi.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || kpi.status === selectedStatus;
    const matchesTrend = selectedTrend === 'all' || kpi.trend === selectedTrend;

    return matchesSearch && matchesCategory && matchesStatus && matchesTrend;
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Link KPIs</h3>
            <p className="text-sm text-gray-500 mt-1">Connect KPIs to track objective progress</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search KPIs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="all">All Categories</option>
                {categories.filter(c => c !== 'all').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="all">All Statuses</option>
                {statuses.filter(s => s !== 'all').map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
              <select
                value={selectedTrend}
                onChange={(e) => setSelectedTrend(e.target.value)}
                className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="all">All Trends</option>
                {trends.filter(t => t !== 'all').map(trend => (
                  <option key={trend} value={trend}>
                    {trend.charAt(0).toUpperCase() + trend.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Linked KPIs */}
            <div className="flex flex-col">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <BarChart3 className="h-4 w-4 mr-2 text-primary-600" />
                Linked KPIs ({linkedKPIs.length})
              </h4>
              <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4">
                {linkedKPIs.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-8">
                    No KPIs linked to this objective yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {linkedKPIs.map((kpi) => (
                      <div
                        key={kpi.id}
                        className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="text-sm font-medium text-gray-900 mb-1">{kpi.name}</h5>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-xs text-gray-500">{kpi.category}</span>
                              <span className="text-xs text-gray-300">•</span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(kpi.status)}`}>
                                {kpi.status.replace('-', ' ')}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">
                                {kpi.value} / {kpi.target} {kpi.unit}
                              </span>
                              <div className="flex items-center">
                                {getTrendIcon(kpi.trend)}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => onUnlink(kpi.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Unlink KPI"
                          >
                            <Unlink className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-2">
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-2 bg-primary-600 rounded-full transition-all duration-300"
                              style={{ width: `${(kpi.value / kpi.target) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Available KPIs */}
            <div className="flex flex-col">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Filter className="h-4 w-4 mr-2 text-primary-600" />
                Available KPIs ({filteredKPIs.length})
              </h4>
              <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4">
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : error ? (
                  <div className="text-sm text-red-600 text-center py-8">{error}</div>
                ) : filteredKPIs.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-8">
                    No matching KPIs found
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredKPIs.map((kpi) => (
                      <div
                        key={kpi.id}
                        className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="text-sm font-medium text-gray-900 mb-1">{kpi.name}</h5>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-xs text-gray-500">{kpi.category}</span>
                              <span className="text-xs text-gray-300">•</span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(kpi.status)}`}>
                                {kpi.status.replace('-', ' ')}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">
                                {kpi.value} / {kpi.target} {kpi.unit}
                              </span>
                              <div className="flex items-center">
                                {getTrendIcon(kpi.trend)}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => onLink(kpi.id)}
                            className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                            title="Link KPI"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-2">
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-2 bg-primary-600 rounded-full transition-all duration-300"
                              style={{ width: `${(kpi.value / kpi.target) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}