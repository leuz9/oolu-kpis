import React, { useState } from 'react';
import { ChevronRight, Circle, Plus, Pencil, Trash2 } from 'lucide-react';

const initialObjectives = [
  {
    id: '1',
    title: 'Increase Customer Satisfaction',
    description: 'Improve overall customer satisfaction score by implementing feedback-driven improvements',
    progress: 75,
    status: 'on-track',
    dueDate: '2024-06-30',
    keyResults: [
      { id: 'kr1', title: 'Achieve NPS score of 60+', current: 55, target: 60 },
      { id: 'kr2', title: 'Reduce customer support response time', current: 4, target: 2 }
    ]
  },
  {
    id: '2',
    title: 'Launch Mobile Application',
    description: 'Develop and launch a mobile application for improved user accessibility',
    progress: 45,
    status: 'at-risk',
    dueDate: '2024-05-15',
    keyResults: [
      { id: 'kr3', title: 'Complete MVP development', current: 70, target: 100 },
      { id: 'kr4', title: 'Achieve 1000 beta users', current: 250, target: 1000 }
    ]
  },
  {
    id: '3',
    title: 'Optimize Operation Costs',
    description: 'Reduce operational costs while maintaining service quality',
    progress: 90,
    status: 'on-track',
    dueDate: '2024-04-30',
    keyResults: [
      { id: 'kr5', title: 'Reduce cloud infrastructure costs', current: 18, target: 20 },
      { id: 'kr6', title: 'Automate manual processes', current: 85, target: 90 }
    ]
  },
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
                keyResults: []
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
                  <StatusDot status={objective.status} />
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
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-900">Key Results</h4>
                    {objective.keyResults.map((kr) => (
                      <div key={kr.id} className="bg-gray-50 p-3 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">{kr.title}</span>
                          <span className="text-sm text-gray-500">
                            {kr.current} / {kr.target}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-green-500 rounded-full"
                            style={{ width: `${(kr.current / kr.target) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors = {
    'on-track': 'text-green-500',
    'at-risk': 'text-yellow-500',
    'behind': 'text-red-500',
  };

  return <Circle className={`h-3 w-3 ${colors[status as keyof typeof colors]} fill-current`} />;
}