import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import { kpiService } from '../../services/kpiService';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Pencil, 
  Trash2, 
  X,
  LayoutGrid,
  List,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import KPIForm from './components/KPIForm';
import KPICard from './components/KPICard';
import KPIListItem from './components/KPIListItem';
import type { KPI } from '../../types';

export default function KPIs() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingKpi, setEditingKpi] = useState<KPI | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

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

  const filteredKpis = kpis.filter(kpi => {
    const matchesSearch = kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kpi.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || kpi.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || kpi.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = Array.from(new Set(kpis.map(kpi => kpi.category)));

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
            <div className="flex items-center space-x-4">
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-l-md ${
                    viewMode === 'grid'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } border border-gray-300`}
                >
                  <LayoutGrid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-r-md ${
                    viewMode === 'list'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } border border-l-0 border-gray-300`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add KPI
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search KPIs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="on-track">On Track</option>
                  <option value="at-risk">At Risk</option>
                  <option value="behind">Behind</option>
                </select>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span>{filteredKpis.length} KPIs</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredKpis.map((kpi) => (
                <KPICard
                  key={kpi.id}
                  kpi={kpi}
                  onEdit={() => setEditingKpi(kpi)}
                  onDelete={() => handleDeleteKpi(kpi.id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
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
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredKpis.map((kpi) => (
                    <KPIListItem
                      key={kpi.id}
                      kpi={kpi}
                      onEdit={() => setEditingKpi(kpi)}
                      onDelete={() => handleDeleteKpi(kpi.id)}
                    />
                  ))}
                </tbody>
              </table>
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