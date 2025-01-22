import React, { useState, useEffect } from 'react';
import { objectiveService } from '../../services/objectiveService';
import Sidebar from '../Sidebar';
import ObjectiveHierarchy from './ObjectiveHierarchy';
import ObjectiveForm from './ObjectiveForm';
import KeyResultForm from './KeyResultForm';
import { Plus, Target, Calendar, Users, ChevronRight, CheckCircle2, AlertTriangle, XCircle, Pencil, Archive } from 'lucide-react';
import type { Objective, KeyResult } from '../../types';

export default function Objectives() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showKeyResultModal, setShowKeyResultModal] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
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

  const handleAddKeyResult = async (newKeyResult: Partial<KeyResult>) => {
    if (!selectedObjective) return;

    try {
      const addedKeyResult = await objectiveService.addKeyResult(
        selectedObjective.id,
        newKeyResult as KeyResult
      );

      const updatedObjective = {
        ...selectedObjective,
        keyResults: [...selectedObjective.keyResults, addedKeyResult]
      };

      setObjectives(prev => prev.map(obj =>
        obj.id === selectedObjective.id ? updatedObjective : obj
      ));
      setSelectedObjective(updatedObjective);
      setShowKeyResultModal(false);
    } catch (err) {
      setError('Failed to add key result. Please try again.');
      console.error('Error adding key result:', err);
    }
  };

  const handleArchiveObjective = async () => {
    if (!selectedObjective) return;

    try {
      await objectiveService.archiveObjective(selectedObjective.id);
      setObjectives(prev => prev.filter(obj => obj.id !== selectedObjective.id));
      setShowArchiveConfirm(false);
      setSelectedObjective(null);
    } catch (err) {
      setError('Failed to archive objective. Please try again.');
      console.error('Error archiving objective:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'text-green-500';
      case 'at-risk':
        return 'text-yellow-500';
      case 'behind':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'at-risk':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'behind':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const renderKeyResult = (kr: KeyResult) => {
    const progressColor = kr.progress >= 100 ? 'bg-green-500' : 
                         kr.progress >= 70 ? 'bg-blue-500' :
                         kr.progress >= 40 ? 'bg-yellow-500' : 'bg-red-500';

    return (
      <div key={kr.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-3">
          <h4 className="text-sm font-medium text-gray-900">{kr.title}</h4>
          <span className="text-sm font-medium text-gray-500">
            {kr.current} / {kr.target} {kr.unit}
          </span>
        </div>
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-gray-600 bg-gray-100">
                Progress
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-gray-600">
                {kr.progress}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
            <div
              style={{ width: `${kr.progress}%` }}
              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${progressColor} transition-all duration-500`}
            />
          </div>
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="h-3 w-3 mr-1" />
          Due: {new Date(kr.dueDate).toLocaleDateString()}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out p-8`}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Objectives</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track and manage company, department, and individual objectives
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Objective
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-400" />
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <ObjectiveHierarchy 
                objectives={objectives}
                onObjectiveSelect={handleObjectiveSelect}
              />
            </div>
            
            <div className="lg:col-span-2">
              {selectedObjective ? (
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-3">
                          <Target className="h-6 w-6 text-indigo-600" />
                          <h2 className="text-xl font-semibold text-gray-900">
                            {selectedObjective.title}
                          </h2>
                        </div>
                        <p className="mt-2 text-gray-600">{selectedObjective.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(selectedObjective.status)}
                        <span className={`text-sm font-medium capitalize ${getStatusColor(selectedObjective.status)}`}>
                          {selectedObjective.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-500 mb-1">Progress</div>
                        <div className="text-2xl font-bold text-gray-900">{selectedObjective.progress}%</div>
                        <div className="mt-2 w-full h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 rounded-full bg-indigo-600"
                            style={{ width: `${selectedObjective.progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-500 mb-1">Due Date</div>
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-gray-900">
                            {new Date(selectedObjective.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-500 mb-1">Contributors</div>
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-gray-900">
                            {selectedObjective.contributors.length} members
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Key Results</h3>
                    <div className="space-y-4">
                      {selectedObjective.keyResults.map(kr => renderKeyResult(kr))}
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setShowEditModal(true)}
                          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Objective
                        </button>
                        <button
                          onClick={() => setShowKeyResultModal(true)}
                          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Key Result
                        </button>
                      </div>
                      <button
                        onClick={() => setShowArchiveConfirm(true)}
                        className="px-4 py-2 bg-red-50 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-100 flex items-center"
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Archive Objective
                      </button>
                    </div>
                  </div>
                </div>
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

        {showKeyResultModal && selectedObjective && (
          <KeyResultForm
            onClose={() => setShowKeyResultModal(false)}
            onSubmit={handleAddKeyResult}
            dueDate={selectedObjective.dueDate}
          />
        )}

        {showArchiveConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900">Archive Objective</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Are you sure you want to archive this objective? This action will hide the objective from active views but preserve its history.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowArchiveConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleArchiveObjective}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Archive
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}