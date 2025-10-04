import React, { useState } from 'react';
import Sidebar from '../Sidebar';
import { Target, AlertTriangle, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useObjectives } from './hooks/useObjectives';
import { useObjectiveFilters } from './hooks/useObjectiveFilters';
import ObjectiveHierarchy from './components/ObjectiveHierarchy';
import ObjectiveDetails from './components/ObjectiveDetails';
import ObjectiveForm from './ObjectiveForm';
import ObjectiveHeader from './components/ObjectiveHeader';
import Filters from './components/Filters';
import ViewToggle from './components/ViewToggle';
import GridView from './components/GridView';
import KanbanView from './components/KanbanView';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import type { Objective } from '../../types';

export default function Objectives() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const [view, setView] = useState<'hierarchy' | 'grid' | 'kanban'>('grid');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { user } = useAuth();

  const {
    objectives,
    loading,
    error,
    addObjective,
    updateObjective,
    archiveObjective,
    deleteObjective
  } = useObjectives();

  const {
    filters,
    setFilters,
    sort,
    setSort,
    showFilters,
    setShowFilters,
    departments,
    contributors,
    filteredObjectives
  } = useObjectiveFilters(objectives);

  const handleAddObjective = async (objective: Omit<Objective, 'id'>) => {
    try {
      const newObjective = await addObjective(objective);
      setShowForm(false);
      setSelectedObjective(newObjective);
    } catch (err) {
      console.error('Error adding objective:', err);
    }
  };

  const handleEditObjective = async (objective: Objective) => {
    try {
      await updateObjective(objective);
      setEditingObjective(null);
      setSelectedObjective(objective);
    } catch (err) {
      console.error('Error updating objective:', err);
    }
  };

  const handleDeleteObjective = async () => {
    if (!selectedObjective || !user || user.role !== 'superadmin') {
      return;
    }

    try {
      await deleteObjective(selectedObjective.id);
      setShowDeleteConfirm(false);
      setSelectedObjective(null);
    } catch (err) {
      console.error('Error deleting objective:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out p-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Objectives</h1>
              <p className="mt-1 text-sm text-gray-500">
                {selectedObjective 
                  ? `Adding sub-objective to "${selectedObjective.title}"`
                  : 'Track and manage company, department, and individual objectives'
                }
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <ViewToggle view={view} setView={setView} />
              <button
                onClick={() => setShowForm(true)}
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  selectedObjective?.level === 'company' 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : selectedObjective?.level === 'department'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}
              >
                <Plus className="h-5 w-5 mr-2" />
                {selectedObjective 
                  ? selectedObjective.level === 'company'
                    ? 'Add Department Objective'
                    : 'Add Individual Objective'
                  : 'New Objective'
                }
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <p className="ml-3 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <Filters
            filters={filters}
            setFilters={setFilters}
            departments={departments}
            contributors={contributors}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            sort={sort}
            setSort={setSort}
            loading={loading}
            totalObjectives={objectives.length}
            filteredCount={filteredObjectives.length}
          />

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {view === 'hierarchy' ? (
                <>
                  <div className="lg:col-span-1">
                    <ObjectiveHierarchy 
                      objectives={filteredObjectives}
                      onObjectiveSelect={setSelectedObjective}
                    />
                  </div>
                  
                  <div className="lg:col-span-2">
                    {selectedObjective ? (
                      <ObjectiveDetails
                        objective={selectedObjective}
                        onEdit={() => setEditingObjective(selectedObjective)}
                        onArchive={() => archiveObjective(selectedObjective.id)}
                        onDelete={() => setShowDeleteConfirm(true)}
                      />
                    ) : (
                      <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center justify-center text-gray-500 h-96">
                        <Target className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium mb-2">No objective selected</p>
                        <p className="text-sm">Select an objective from the hierarchy to view details</p>
                      </div>
                    )}
                  </div>
                </>
              ) : view === 'grid' ? (
                <div className="lg:col-span-3">
                  <GridView
                    objectives={filteredObjectives}
                    selectedObjective={selectedObjective}
                    onObjectiveSelect={setSelectedObjective}
                    onEdit={() => setEditingObjective(selectedObjective)}
                    onArchive={archiveObjective}
                    onDelete={() => setShowDeleteConfirm(true)}
                  />
                </div>
              ) : (
                <div className="lg:col-span-3">
                  <KanbanView
                    objectives={filteredObjectives}
                    selectedObjective={selectedObjective}
                    onObjectiveSelect={setSelectedObjective}
                    onEdit={() => setEditingObjective(selectedObjective)}
                    onArchive={archiveObjective}
                    onDelete={() => setShowDeleteConfirm(true)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {(showForm || editingObjective) && (
        <ObjectiveForm
          onClose={() => {
            setShowForm(false);
            setEditingObjective(null);
          }}
          onSubmit={editingObjective ? handleEditObjective : handleAddObjective}
          initialData={editingObjective}
          parentObjective={selectedObjective}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmModal
          onConfirm={handleDeleteObjective}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}