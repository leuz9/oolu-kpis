import React, { useState } from 'react';
import { Target, Users, Building2, Calendar, PieChart } from 'lucide-react';
import type { Objective } from '../../../types';
import ObjectiveDetailsModal from './ObjectiveDetailsModal';

interface KanbanViewProps {
  objectives: Objective[];
  onObjectiveSelect: (objective: Objective) => void;
  selectedObjective: Objective | null;
  onEdit: (objective: Objective) => void;
  onArchive: (objectiveId: string) => Promise<void>;
  onLinkKPI: (objectiveId: string, kpiId: string) => Promise<void>;
  onUnlinkKPI: (objectiveId: string, kpiId: string) => Promise<void>;
}

export default function KanbanView({
  objectives,
  selectedObjective,
  onObjectiveSelect,
  onEdit,
  onArchive,
  onLinkKPI,
  onUnlinkKPI
}: KanbanViewProps) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const columns = [
    { id: 'on-track', title: 'On Track', color: 'bg-green-500' },
    { id: 'at-risk', title: 'At Risk', color: 'bg-yellow-500' },
    { id: 'behind', title: 'Behind', color: 'bg-red-500' }
  ];

  const getObjectivesByStatus = (status: string) => {
    return objectives.filter(obj => obj.status === status);
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'company':
        return <Target className="h-5 w-5 text-primary-600" />;
      case 'department':
        return <Building2 className="h-5 w-5 text-blue-600" />;
      case 'individual':
        return <Users className="h-5 w-5 text-green-600" />;
      default:
        return null;
    }
  };

  const handleObjectiveClick = (objective: Objective) => {
    onObjectiveSelect(objective);
    setShowDetailsModal(true);
  };

  return (
    <>
      <div className="h-full flex space-x-6 p-6">
        {columns.map(column => (
          <div
            key={column.id}
            className="flex-1 flex flex-col bg-gray-50 rounded-lg p-4"
          >
            <div className="flex items-center mb-4">
              <div className={`w-3 h-3 rounded-full ${column.color} mr-2`} />
              <h3 className="text-lg font-medium text-gray-900">
                {column.title}
              </h3>
              <span className="ml-2 text-sm text-gray-500">
                ({getObjectivesByStatus(column.id).length})
              </span>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="space-y-4">
                {getObjectivesByStatus(column.id).map(objective => (
                  <div
                    key={objective.id}
                    onClick={() => handleObjectiveClick(objective)}
                    className={`bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow ${
                      selectedObjective?.id === objective.id ? 'ring-2 ring-primary-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        {getLevelIcon(objective.level)}
                        <div className="ml-2">
                          <h4 className="text-sm font-medium text-gray-900">{objective.title}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {objective.level.charAt(0).toUpperCase() + objective.level.slice(1)}
                            {objective.department && ` • ${objective.department}`}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{objective.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full">
                        <div
                          className="h-1.5 bg-primary-600 rounded-full transition-all duration-300"
                          style={{ width: `${objective.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {new Date(objective.dueDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <PieChart className="h-3.5 w-3.5 mr-1" />
                        {objective.kpiIds?.length || 0} KPIs
                      </div>
                    </div>

                    {objective.contributors && objective.contributors.length > 0 && (
                      <div className="mt-3 flex items-center text-xs text-gray-500">
                        <Users className="h-3.5 w-3.5 mr-1" />
                        {objective.contributors.length} contributors
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showDetailsModal && selectedObjective && (
        <ObjectiveDetailsModal
          objective={selectedObjective}
          onClose={() => setShowDetailsModal(false)}
          onEdit={() => {
            setShowDetailsModal(false);
            onEdit(selectedObjective);
          }}
          onArchive={() => onArchive(selectedObjective.id)}
          onLinkKPI={(kpiId) => onLinkKPI(selectedObjective.id, kpiId)}
          onUnlinkKPI={(kpiId) => onUnlinkKPI(selectedObjective.id, kpiId)}
        />
      )}
    </>
  );
}