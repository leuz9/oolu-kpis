import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import { kpiService } from '../../services/kpiService';
import { Plus, TrendingUp, TrendingDown, Minus, Pencil, Trash2, X } from 'lucide-react';
import type { KPI } from '../../types';

export default function KPIs() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingKpi, setEditingKpi] = useState<Partial<KPI> | null>(null);

  useEffect(() => {
    fetchKPIs();
  }, []);

  const fetchKPIs = async () => {
    try {
      setLoading(true);
      const fetchedKpis = await kpiService.getKPIs();
      setKpis(fetchedKpis);
    } catch (err) {
      setError('Failed to load KPIs. Please try again later.');
      console.error('Error fetching KPIs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKpi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKpi) return;

    try {
      const newKpi = {
        ...editingKpi,
        history: [],
        lastUpdated: new Date().toISOString()
      };
      
      const createdKpi = await kpiService.addKPI(newKpi as KPI);
      setKpis(prev => [...prev, createdKpi]);
      setIsEditing(false);
      setEditingKpi(null);
    } catch (err) {
      setError('Failed to add KPI. Please try again.');
      console.error('Error adding KPI:', err);
    }
  };

  const handleEditKpi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKpi?.id) return;

    try {
      await kpiService.updateKPI(editingKpi.id, editingKpi);
      setKpis(prev => prev.map(kpi => 
        kpi.id === editingKpi.id ? { ...kpi, ...editingKpi } : kpi
      ));
      setIsEditing(false);
      setEditingKpi(null);
    } catch (err) {
      setError('Failed to update KPI. Please try again.');
      console.error('Error updating KPI:', err);
    }
  };

  const handleDeleteKpi = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this KPI?')) return;

    try {
      await kpiService.deleteKPI(id);
      setKpis(prev => prev.filter(kpi => kpi.id !== id));
    } catch (err) {
      setError('Failed to delete KPI. Please try again.');
      console.error('Error deleting KPI:', err);
    }
  };

  const handleUpdateValue = async (kpi: KPI, newValue: number) => {
    try {
      await kpiService.addKPIHistory(kpi.id, newValue);
      setKpis(prev => prev.map(k => 
        k.id === kpi.id ? {
          ...k,
          value: newValue,
          lastUpdated: new Date().toISOString(),
          history: [...k.history, { date: new Date().toISOString(), value: newValue }]
        } : k
      ));
    } catch (err) {
      setError('Failed to update KPI value. Please try again.');
      console.error('Error updating KPI value:', err);
    }
  };

  const KPIForm = ({ onSubmit }: { onSubmit: (e: React.FormEvent) => Promise<void> }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {editingKpi?.id ? 'Edit KPI' : 'Add KPI'}
          </h3>
          <button
            onClick={() => {
              setIsEditing(false);
              setEditingKpi(null);
            }}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              required
              value={editingKpi?.name || ''}
              onChange={e => setEditingKpi(prev => prev ? {...prev, name: e.target.value} : null)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Value</label>
              <input
                type="number"
                step="0.01"
                required
                value={editingKpi?.value || 0}
                onChange={e => setEditingKpi(prev => prev ? {...prev, value: parseFloat(e.target.value)} : null)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Target</label>
              <input
                type="number"
                step="0.01"
                required
                value={editingKpi?.target || 0}
                onChange={e => setEditingKpi(prev => prev ? {...prev, target: parseFloat(e.target.value)} : null)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              required
              value={editingKpi?.category || ''}
              onChange={e => setEditingKpi(prev => prev ? {...prev, category: e.target.value} : null)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Frequency</label>
            <select
              required
              value={editingKpi?.frequency || 'monthly'}
              onChange={e => setEditingKpi(prev => prev ? {...prev, frequency: e.target.value as KPI['frequency']} : null)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Trend</label>
            <select
              required
              value={editingKpi?.trend || 'stable'}
              onChange={e => setEditingKpi(prev => prev ? {...prev, trend: e.target.value as KPI['trend']} : null)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="up">Up</option>
              <option value="down">Down</option>
              <option value="stable">Stable</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditingKpi(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              {editingKpi?.id ? 'Save Changes' : 'Add KPI'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const TrendIndicator = ({ trend }: { trend: KPI['trend'] }) => {
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
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out p-8`}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Key Performance Indicators</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track and manage your organization's KPIs
            </p>
          </div>
          <button
            onClick={() => {
              setEditingKpi({
                name: '',
                value: 0,
                target: 0,
                trend: 'stable',
                category: '',
                frequency: 'monthly',
                history: []
              });
              setIsEditing(true);
            }}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add KPI
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {kpis.map((kpi) => (
              <div
                key={kpi.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{kpi.name}</h3>
                    <p className="text-sm text-gray-500">{kpi.category}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingKpi(kpi);
                        setIsEditing(true);
                      }}
                      className="p-1 text-gray-400 hover:text-indigo-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteKpi(kpi.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl font-semibold text-gray-900">
                    {kpi.value.toLocaleString()}
                  </div>
                  <TrendIndicator trend={kpi.trend} />
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{((kpi.value / kpi.target) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-indigo-600 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0</span>
                    <span>Target: {kpi.target.toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Last updated: {new Date(kpi.lastUpdated).toLocaleDateString()}
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      const newValue = prompt('Enter new value:', kpi.value.toString());
                      if (newValue && !isNaN(parseFloat(newValue))) {
                        handleUpdateValue(kpi, parseFloat(newValue));
                      }
                    }}
                    className="w-full px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
                  >
                    Update Value
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isEditing && editingKpi && (
          <KPIForm onSubmit={editingKpi.id ? handleEditKpi : handleAddKpi} />
        )}
      </div>
    </div>
  );
}