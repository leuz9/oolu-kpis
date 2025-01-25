import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import { kpiService } from '../../services/kpiService';
import { Plus, TrendingUp, TrendingDown, Minus, Pencil, Trash2, X } from 'lucide-react';
import KPIForm from './components/KPIForm';
import type { KPI } from '../../types';

export default function KPIs() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingKpi, setEditingKpi] = useState<KPI | null>(null);

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

  const handleAddKpi = async (kpiData: Partial<KPI>) => {
    try {
      const newKpi = await kpiService.addKPI(kpiData as KPI);
      setKpis(prev => [...prev, newKpi]);
      setShowForm(false);
    } catch (err) {
      setError('Failed to add KPI. Please try again.');
      console.error('Error adding KPI:', err);
    }
  };

  const handleEditKpi = async (kpiData: Partial<KPI>) => {
    if (!editingKpi) return;
    
    try {
      await kpiService.updateKPI(editingKpi.id, kpiData);
      setKpis(prev => prev.map(kpi => 
        kpi.id === editingKpi.id ? { ...kpi, ...kpiData } : kpi
      ));
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
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out p-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Key Performance Indicators</h1>
              <p className="mt-1 text-sm text-gray-500">
                Track and manage your organization's KPIs
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add KPI
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <div className="flex">
                <X className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
                        onClick={() => setEditingKpi(kpi)}
                        className="p-1 text-gray-400 hover:text-primary-600"
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
                    <span className="text-gray-500">
                      Updated {new Date(kpi.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* KPI Form Modal */}
      {(showForm || editingKpi) && (
        <KPIForm
          onClose={() => {
            setShowForm(false);
            setEditingKpi(null);
          }}
          onSubmit={editingKpi ? handleEditKpi : handleAddKpi}
          initialData={editingKpi || undefined}
        />
      )}
    </div>
  );
}