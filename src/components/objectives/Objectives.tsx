import React, { useState, useEffect } from 'react';
import { objectiveService } from '../../services/objectiveService';
import Sidebar from '../Sidebar';
import ObjectiveHierarchy from './components/ObjectiveHierarchy';
import ObjectiveForm from './ObjectiveForm';
import ObjectiveHeader from './components/ObjectiveHeader';
import ObjectiveDetails from './components/ObjectiveDetails';
import { Target, AlertTriangle } from 'lucide-react';
import type { Objective } from '../../types';

export default function Objectives() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchObjectives();
  }, []);

  const fetchObjectives = async () => {
    try {
      setLoading(true);
      const fetchedObjectives = await objectiveService.getObjectives();
      setObjectives(fetchedObjectives);
    } catch (err) {
      setError('Failed to load objectives. Please try again later.');
      console.error('Error fetching objectives:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleObjectiveSelect = (objective: Objective) => {
    setSelectedObjective(objective);
  };

  const handleAddObjective = async (newObjective: any) => {
    try {
      const createdObjective = await objectiveService.addObjective(newObjective);
      setObjectives(prev => [...prev, createdObjective]);
      setShowAddModal(false);
    } catch (err) {
      setError('Failed to create objective. Please try again.');
      console.error('Error adding objective:', err);
    }
  };

  const handleEditObjective = async (updatedObjective: any) => {
    try {
      await objectiveService.updateObjective(updatedObjective.id, updatedObjective);
      setObjectives(prev => prev.map(obj =>
        obj.id === updatedObjective.id ? updatedObjective : obj
      ));
      setShowEditModal(false);
      setSelectedObjective(updatedObjective);
    } catch (err) {
      setError('Failed to update objective. Please try again.');
      console.error('Error updating objective:', err);
    }
  };

  const handleArchiveObjective = async () => {
    if (!selectedObjective) return;

    try {
      await objectiveService.archiveObjective(selectedObjective.id);
      setObjectives(prev => prev.filter(obj => obj.id !== selectedObjective.id));
      setSelectedObjective(null);
    } catch (err) {
      setError('Failed to archive objective. Please try again.');
      console.error('Error archiving objective:', err);
    }
  };

  const handleLinkKPI = async (kpiId: string) => {
    if (!selectedObjective) return;

    try {
      await objectiveService.linkKPI(selectedObjective.id, kpiId);
      const updatedObjective = {
        ...selectedObjective,
        kpiIds: [...(selectedObjective.kpiIds || []), kpiId]
      };
      setObjectives(prev => prev.map(obj =>
        obj.id === selectedObjective.id ? updatedObjective : obj
      ));
      setSelectedObjective(updatedObjective);
    } catch (err) {
      setError('Failed to link KPI to objective. Please try again.');
      console.error('Error linking KPI:', err);
    }
  };

  const handleUnlinkKPI = async (kpiId: string) => {
    if (!selectedObjective) return;

    try {
      await objectiveService.unlinkKPI(selectedObjective.id, kpiId);
      const updatedObjective = {
        ...selectedObjective,
        kpiIds: selectedObjective.kpiIds?.filter(id => id !== kpiId) || []
      };
      setObjectives(prev => prev.map(obj =>
        obj.id === selectedObjective.id ? updatedObjective : obj
      ));
      setSelectedObjective(updatedObjective);
    } catch (err) {
      setError('Failed to unlink KPI from objective. Please try again.');
      console.error('Error unlinking KPI:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out p-8`}>
        <div className="max-w-7xl mx-auto">
          <ObjectiveHeader 
            onAddClick={() => setShowAddModal(true)} 
            parentObjective={selectedObjective}
          />

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <p className="ml-3 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <ObjectiveHierarchy 
                  objectives={objectives}
                  onObjectiveSelect={handleObjectiveSelect}
                />
              </div>
              
              <div className="lg:col-span-2">
                {selectedObjective ? (
                  <ObjectiveDetails
                    objective={selectedObjective}
                    onEdit={() => setShowEditModal(true)}
                    onArchive={handleArchiveObjective}
                    onLinkKPI={handleLinkKPI}
                    onUnlinkKPI={handleUnlinkKPI}
                  />
                ) : (
                  <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center justify-center text-gray-500 h-96">
                    <Target className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium mb-2">No objective selected</p>
                    <p className="text-sm">Select an objective from the hierarchy to view details</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <ObjectiveForm
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddObjective}
          parentObjective={selectedObjective}
        />
      )}

      {showEditModal && selectedObjective && (
        <ObjectiveForm
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditObjective}
          initialData={selectedObjective}
        />
      )}
    </div>
  );
}