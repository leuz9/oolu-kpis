import React, { useState } from 'react';
import { ChevronRight, Circle, Plus, Pencil, Trash2, Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { Objective, KPI } from '../types';

interface ObjectiveWithKPIs extends Objective {
  linkedKPIs?: KPI[];
}

const initialObjectives: ObjectiveWithKPIs[] = [
  {
    id: '1',
    title: 'Increase Customer Satisfaction',
    description: 'Improve overall customer satisfaction score by implementing feedback-driven improvements',
    progress: 75,
    status: 'on-track',
    dueDate: '2024-06-30',
    level: 'company',
    kpiIds: ['1', '2'],
    linkedKPIs: [
      {
        id: '1',
        name: 'Customer Satisfaction Score',
        value: 85,
        target: 90,
        unit: '%',
        progress: 94,
        trend: 'up',
        status: 'on-track',
        category: 'Customer',
        startDate: '2024-01-01',
        dueDate: '2024-12-31',
        lastUpdated: '2024-03-15',
        history: [],
        objectiveIds: ['1']
      },
      {
        id: '2',
        name: 'Support Response Time',
        value: 4,
        target: 2,
        unit: 'hours',
        progress: 50,
        trend: 'down',
        status: 'at-risk',
        category: 'Support',
        startDate: '2024-01-01',
        dueDate: '2024-12-31',
        lastUpdated: '2024-03-15',
        history: [],
        objectiveIds: ['1']
      }
    ],
    contributors: [],
    createdAt: '2024-01-01',
    updatedAt: '2024-03-15'
  },
  {
    id: '2',
    title: 'Launch Mobile Application',
    description: 'Develop and launch a mobile application for improved user accessibility',
    progress: 45,
    status: 'at-risk',
    dueDate: '2024-05-15',
    level: 'department',
    kpiIds: ['3'],
    linkedKPIs: [
      {
        id: '3',
        name: 'Development Progress',
        value: 70,
        target: 100,
        unit: '%',
        progress: 70,
        trend: 'up',
        status: 'on-track',
        category: 'Development',
        startDate: '2024-01-01',
        dueDate: '2024-05-15',
        lastUpdated: '2024-03-15',
        history: [],
        objectiveIds: ['2']
      }
    ],
    contributors: [],
    createdAt: '2024-01-01',
    updatedAt: '2024-03-15'
  }
];

export default function ObjectivesList() {
  const [objectives, setObjectives] = useState(initialObjectives);
  const [selectedObjective, setSelectedObjective] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingObjective, setEditingObjective] = useState<any>(null);

  const handleObjectiveClick = (id: string) => {
    setSelectedObjective(selectedObjective === id ? null : id);
  };

  const handleEditClick = (objective: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingObjective(objective);
    setIsEditing(true);
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setObjectives(objectives.filter(obj => obj.id !== id));
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setObjectives(objectives.map(obj => 
      obj.id === editingObjective.id ? editingObjective : obj
    ));
    setIsEditing(false);
    setEditingObjective(null);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
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
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Current Objectives</h2>
          <button
            onClick={() => {
              setEditingObjective({
                id: Date.now().toString(),
                title: '',
                description: '',
                progress: 0,
                status: 'on-track',
                dueDate: '',
                kpiIds: []
              });
              setIsEditing(true);
            }}
            className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Objective
          </button>
        </div>

        {isEditing && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h3 className="text-lg font-medium mb-4">
                {editingObjective.id ? 'Edit Objective' : 'New Objective'}
              </h3>
              <form onSubmit={handleSaveEdit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      value={editingObjective.title}
                      onChange={e => setEditingObjective({...editingObjective, title: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={editingObjective.description}
                      onChange={e => setEditingObjective({...editingObjective, description: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Progress (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editingObjective.progress}
                      onChange={e => setEditingObjective({...editingObjective, progress: parseInt(e.target.value)})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={editingObjective.status}
                      onChange={e => setEditingObjective({...editingObjective, status: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="on-track">On Track</option>
                      <option value="at-risk">At Risk</option>
                      <option value="behind">Behind</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Due Date</label>
                    <input
                      type="date"
                      value={editingObjective.dueDate}
                      onChange={e => setEditingObjective({...editingObjective, dueDate: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditingObjective(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-4">
          {objectives.map((objective) => (
            <div
              key={objective.id}
              onClick={() => handleObjectiveClick(objective.id)}
              className="rounded-lg border border-gray-200 hover:border-indigo-200 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    objective.status === 'on-track' ? 'bg-green-500' :
                    objective.status === 'at-risk' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {objective.title}
                    </h3>
                    <div className="mt-1 flex items-center space-x-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-indigo-600 rounded-full"
                          style={{ width: `${objective.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500">
                        {objective.progress}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    Due {new Date(objective.dueDate).toLocaleDateString()}
                  </span>
                  <button
                    onClick={(e) => handleEditClick(objective, e)}
                    className="p-1 text-gray-400 hover:text-indigo-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(objective.id, e)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <ChevronRight
                    className={`h-5 w-5 text-gray-400 transform transition-transform ${
                      selectedObjective === objective.id ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </div>
              {selectedObjective === objective.id && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-gray-600 mb-4">{objective.description}</p>
                  
                  {/* Linked KPIs Section */}
                  {objective.linkedKPIs && objective.linkedKPIs.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-900">Linked KPIs</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {objective.linkedKPIs.map((kpi) => (
                          <div key={kpi.id} className="bg-gray-50 p-3 rounded-md">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="text-sm font-medium text-gray-700">{kpi.name}</span>
                                <p className="text-xs text-gray-500">{kpi.category}</p>
                              </div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(kpi.status)}`}>
                                {kpi.status.replace('-', ' ')}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">
                                {kpi.value} / {kpi.target} {kpi.unit}
                              </span>
                              {getTrendIcon(kpi.trend)}
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full">
                              <div
                                className="h-1.5 bg-indigo-600 rounded-full"
                                style={{ width: `${kpi.progress}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}