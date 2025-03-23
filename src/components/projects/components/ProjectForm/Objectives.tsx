import React, { useState, useEffect } from 'react';
import { Target, Trash2, Plus } from 'lucide-react';
import { objectiveService } from '../../../../services/objectiveService';
import type { Objective } from '../../../../types';

interface ObjectivesProps {
  objectives: string[];
  departmentId: string;
  onAdd: (objective: string) => void;
  onRemove: (index: number) => void;
}

export default function Objectives({ objectives, departmentId, onAdd, onRemove }: ObjectivesProps) {
  const [departmentObjectives, setDepartmentObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedObjective, setSelectedObjective] = useState('');

  useEffect(() => {
    if (departmentId) {
      fetchDepartmentObjectives();
    }
  }, [departmentId]);

  const fetchDepartmentObjectives = async () => {
    try {
      setLoading(true);
      const allObjectives = await objectiveService.getObjectives();
      const filteredObjectives = allObjectives.filter(obj => 
        obj.department === departmentId && obj.status !== 'completed'
      );
      setDepartmentObjectives(filteredObjectives);
    } catch (err) {
      console.error('Error fetching department objectives:', err);
      setError('Failed to load objectives');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (selectedObjective) {
      onAdd(selectedObjective);
      setSelectedObjective('');
    }
  };

  if (!departmentId) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-500">Please select a department first to add objectives.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">Objectives</h4>
        <span className="text-sm text-gray-500">{objectives.length} objectives</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-20">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-sm text-gray-500">Loading objectives...</span>
        </div>
      ) : (
        <>
          <div className="flex space-x-2">
            <select
              value={selectedObjective}
              onChange={e => setSelectedObjective(e.target.value)}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Select objective</option>
              {departmentObjectives.map(objective => (
                <option key={objective.id} value={objective.id}>
                  {objective.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!selectedObjective}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-2">
            {objectives.map((objectiveId, index) => {
              const objective = departmentObjectives.find(o => o.id === objectiveId);
              return (
                <div
                  key={objectiveId}
                  className="flex items-center justify-between p-2 bg-white rounded-md"
                >
                  <div className="flex items-center">
                    <Target className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {objective ? objective.title : objectiveId}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}