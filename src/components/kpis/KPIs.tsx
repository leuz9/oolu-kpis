import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import { kpiService } from '../../services/kpiService';
import KPICard from './components/KPICard';
import KPIListView from './components/KPIListView';
import KPIForm from './components/KPIForm/index';
import ViewToggle from './components/ViewToggle';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { AlertTriangle, Plus, Search, Filter } from 'lucide-react';
import type { KPI, User } from '../../types';

function KPIs() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingKpi, setEditingKpi] = useState<KPI | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [kpiContributors, setKpiContributors] = useState<Map<string, User[]>>(new Map());
  const [view, setView] = useState<'grid' | 'list'>('list'); // Changed default to 'list'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fetchedKpis, fetchedUsers] = await Promise.all([
        kpiService.getKPIs(),
        userService.getAllUsers()
      ]);
      setKpis(fetchedKpis);
      setUsers(fetchedUsers);

      // Map contributors to users
      const contributorsMap = new Map<string, User[]>();
      fetchedKpis.forEach(kpi => {
        if (kpi.contributors?.length) {
          contributorsMap.set(
            kpi.id,
            fetchedUsers.filter(user => kpi.contributors.includes(user.id))
          );
        }
      });
      setKpiContributors(contributorsMap);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load KPIs and users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddKpi = async (kpi: Partial<KPI>) => {
    try {
      const newKpi = await kpiService.addKPI(kpi as Omit<KPI, 'id'>);
      setKpis(prev => [newKpi, ...prev]);
      
      // Update contributors map
      if (kpi.contributors?.length) {
        setKpiContributors(prev => new Map(prev).set(
          newKpi.id,
          users.filter(user => kpi.contributors?.includes(user.id))
        ));
      }
      
      setShowForm(false);
    } catch (err) {
      console.error('Error adding KPI:', err);
      setError('Failed to create KPI. Please try again.');
    }
  };

  const handleEditKpi = async (kpi: KPI) => {
    try {
      await kpiService.updateKPI(kpi.id, kpi);
      setKpis(prev => prev.map(k => k.id === kpi.id ? kpi : k));
      
      // Update contributors map
      if (kpi.contributors?.length) {
        setKpiContributors(prev => new Map(prev).set(
          kpi.id,
          users.filter(user => kpi.contributors.includes(user.id))
        ));
      }
      
      setEditingKpi(null);
    } catch (err) {
      console.error('Error updating KPI:', err);
      setError('Failed to update KPI. Please try again.');
    }
  };

  const handleDeleteKpi = async (id: string) => {
    // Check if user is admin
    if (!user?.isAdmin) {
      setError('Only administrators can delete KPIs');
      return;
    }

    try {
      await kpiService.deleteKPI(id);
      setKpis(prev => prev.filter(kpi => kpi.id !== id));
      setKpiContributors(prev => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
    } catch (err: any) {
      console.error('Error deleting KPI:', err);
      setError(err.message || 'Failed to delete KPI. Please try again.');
    }
  };

  const handleUpdateKpiValue = async (kpiId: string, value: number, comment: string) => {
    try {
      const kpi = kpis.find(k => k.id === kpiId);
      if (!kpi) return;

      const updatedKpi = {
        ...kpi,
        value,
        progress: Math.min(100, Math.round((value / kpi.target) * 100)),
        trend: value > kpi.value ? 'up' : value < kpi.value ? 'down' : 'stable',
        status: value >= kpi.target ? 'on-track' : value >= kpi.target * 0.7 ? 'at-risk' : 'behind',
        lastUpdated: new Date().toISOString(),
        history: [
          ...(kpi.history || []),
          {
            value,
            comment,
            timestamp: new Date().toISOString()
          }
        ]
      };

      await kpiService.updateKPI(kpiId, updatedKpi);
      setKpis(prev => prev.map(k => k.id === kpiId ? updatedKpi : k));
    } catch (err) {
      console.error('Error updating KPI value:', err);
      setError('Failed to update KPI value. Please try again.');
      throw err;
    }
  };

  const filteredKpis = kpis.filter(kpi => {
    const matchesSearch = 
      kpi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kpi.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kpi.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || kpi.category === filterCategory;
    return matchesSearch && matchesCategory;
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
              <ViewToggle view={view} onViewChange={setView} />
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
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded">
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
            <div className="flex items-center space-x-4">
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
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredKpis.map((kpi) => (
                <KPICard
                  key={kpi.id}
                  kpi={kpi}
                  contributors={kpiContributors.get(kpi.id) || []}
                  onEdit={() => setEditingKpi(kpi)}
                  onDelete={() => handleDeleteKpi(kpi.id)}
                  onUpdate={handleUpdateKpiValue}
                  isAdmin={user?.isAdmin}
                />
              ))}
            </div>
          ) : (
            <KPIListView
              kpis={filteredKpis}
              contributors={kpiContributors}
              onEdit={(kpi) => setEditingKpi(kpi)}
              onDelete={handleDeleteKpi}
              onUpdate={handleUpdateKpiValue}
              isAdmin={user?.isAdmin}
            />
          )}
        </div>
      </div>

      {(showForm || editingKpi) && (
        <KPIForm
          onClose={() => {
            setShowForm(false);
            setEditingKpi(null);
          }}
          onSubmit={editingKpi ? handleEditKpi : handleAddKpi}
          initialData={editingKpi}
          availableUsers={users}
        />
      )}
    </div>
  );
}

export default KPIs;