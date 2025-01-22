import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Plus, Pencil, Trash2 } from 'lucide-react';

const initialKpis = [
  {
    id: '1',
    name: 'Revenue Growth',
    value: 12.5,
    target: 15,
    trend: 'up',
    category: 'Financial',
    lastUpdated: '2024-03-15',
  },
  {
    id: '2',
    name: 'Customer Churn',
    value: 2.3,
    target: 2,
    trend: 'down',
    category: 'Customer',
    lastUpdated: '2024-03-15',
  },
  {
    id: '3',
    name: 'Team Velocity',
    value: 85,
    target: 80,
    trend: 'up',
    category: 'Engineering',
    lastUpdated: '2024-03-15',
  },
];

export default function KPIOverview() {
  const [kpis, setKpis] = useState(initialKpis);
  const [isEditing, setIsEditing] = useState(false);
  const [editingKpi, setEditingKpi] = useState<any>(null);

  const handleEditClick = (kpi: any) => {
    setEditingKpi(kpi);
    setIsEditing(true);
  };

  const handleDeleteClick = (id: string) => {
    setKpis(kpis.filter(kpi => kpi.id !== id));
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingKpi.id) {
      setKpis(kpis.map(kpi => 
        kpi.id === editingKpi.id ? editingKpi : kpi
      ));
    } else {
      setKpis([...kpis, { ...editingKpi, id: Date.now().toString() }]);
    }
    setIsEditing(false);
    setEditingKpi(null);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Key Performance Indicators</h2>
          <button
            onClick={() => {
              setEditingKpi({
                name: '',
                value: 0,
                target: 0,
                trend: 'up',
                category: '',
                lastUpdated: new Date().toISOString().split('T')[0]
              });
              setIsEditing(true);
            }}
            className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add KPI
          </button>
        </div>

        {isEditing && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h3 className="text-lg font-medium mb-4">
                {editingKpi.id ? 'Edit KPI' : 'New KPI'}
              </h3>
              <form onSubmit={handleSaveEdit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={editingKpi.name}
                      onChange={e => setEditingKpi({...editingKpi, name: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Current Value</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingKpi.value}
                        onChange={e => setEditingKpi({...editingKpi, value: parseFloat(e.target.value)})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Target</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingKpi.target}
                        onChange={e => setEditingKpi({...editingKpi, target: parseFloat(e.target.value)})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <input
                      type="text"
                      value={editingKpi.category}
                      onChange={e => setEditingKpi({...editingKpi, category: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Trend</label>
                    <select
                      value={editingKpi.trend}
                      onChange={e => setEditingKpi({...editingKpi, trend: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="up">Up</option>
                      <option value="down">Down</option>
                      <option value="stable">Stable</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
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
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.id}
              className="p-4 hover:bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-200 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-medium text-gray-900">{kpi.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditClick(kpi)}
                        className="p-1 text-gray-400 hover:text-indigo-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(kpi.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{kpi.category}</p>
                </div>
                <TrendIndicator trend={kpi.trend} />
              </div>
              <div className="mt-2">
                <div className="flex items-baseline">
                  <span className="text-2xl font-semibold text-gray-900">
                    {kpi.value}%
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    of {kpi.target}% target
                  </span>
                </div>
                <div className="mt-2 w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className={`h-2 rounded-full ${
                      kpi.value >= kpi.target ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${(kpi.value / kpi.target) * 100}%` }}
                  />
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Last updated: {new Date(kpi.lastUpdated).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrendIndicator({ trend }: { trend: string }) {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    case 'down':
      return <TrendingDown className="h-5 w-5 text-red-500" />;
    default:
      return <Minus className="h-5 w-5 text-gray-500" />;
  }
}