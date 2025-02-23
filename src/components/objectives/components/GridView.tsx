import React, { useState } from 'react';
import { ChevronDown, Target, Building2, Users, Calendar, PieChart, ArrowRight, Eye } from 'lucide-react';
import type { Objective } from '../../../types';
import ObjectiveDetailsModal from './ObjectiveDetailsModal';

interface GridViewProps {
  objectives: Objective[];
  selectedObjective: Objective | null;
  onObjectiveSelect: (objective: Objective) => void;
  onEdit: (objective: Objective) => void;
  onArchive: (objectiveId: string) => Promise<void>;
  onLinkKPI: (objectiveId: string, kpiId: string) => Promise<void>;
  onUnlinkKPI: (objectiveId: string, kpiId: string) => Promise<void>;
}

export default function GridView({ 
  objectives, 
  selectedObjective, 
  onObjectiveSelect,
  onEdit,
  onArchive,
  onLinkKPI,
  onUnlinkKPI
}: GridViewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const { companyObjectives, objectiveMap } = organizeObjectivesHierarchy(objectives);

  const renderObjectiveCard = (objective: Objective, level: number = 0) => {
    const childObjectives = objectiveMap.get(objective.id) || [];
    const hasChildren = childObjectives.length > 0;
    const isExpanded = expandedIds.has(objective.id);

    return (
      <div key={objective.id} className={`col-span-3 ${level > 0 ? 'ml-8' : ''}`}>
        <div
          className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow relative ${
            selectedObjective?.id === objective.id ? 'ring-2 ring-primary-500' : ''
          }`}
        >
          {/* Connection Lines */}
          {level > 0 && (
            <>
              <div className="absolute -left-8 top-1/2 w-8 h-px bg-gray-300" />
              <div className="absolute -left-8 top-0 bottom-1/2 w-px bg-gray-300" />
            </>
          )}
          {hasChildren && isExpanded && (
            <div className="absolute left-1/2 bottom-0 w-px h-8 bg-gray-300 transform translate-y-full" />
          )}

          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              {hasChildren && (
                <button
                  onClick={(e) => toggleExpand(objective.id, e)}
                  className="p-1 rounded-full hover:bg-gray-100 mr-2"
                >
                  <ChevronDown
                    className={`h-5 w-5 text-gray-400 transform transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              )}
              {objective.level === 'company' && <Target className="h-5 w-5 text-primary-600 mr-2" />}
              {objective.level === 'department' && <Building2 className="h-5 w-5 text-blue-600 mr-2" />}
              {objective.level === 'individual' && <Users className="h-5 w-5 text-green-600 mr-2" />}
              <div>
                <h3 className="text-lg font-medium text-gray-900">{objective.title}</h3>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <span className="capitalize">{objective.level} Level</span>
                  {objective.department && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{objective.department}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                objective.status === 'on-track' ? 'bg-green-100 text-green-800' :
                objective.status === 'at-risk' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {objective.status.replace('-', ' ')}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onObjectiveSelect(objective);
                  setShowDetailsModal(true);
                }}
                className="p-1 text-gray-400 hover:text-primary-600 rounded-full hover:bg-gray-100"
                title="View Details"
              >
                <Eye className="h-5 w-5" />
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{objective.description}</p>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Progress</span>
                <span>{objective.progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-primary-600 rounded-full transition-all duration-300"
                  style={{ width: `${objective.progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(objective.dueDate).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <PieChart className="h-4 w-4 mr-1" />
                {objective.keyResults?.length || 0} Key Results
              </div>
            </div>

            {objective.contributors && objective.contributors.length > 0 && (
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-1" />
                {objective.contributors.length} contributors
              </div>
            )}

            {hasChildren && (
              <div className="flex items-center text-sm text-gray-500">
                <Target className="h-4 w-4 mr-1" />
                {childObjectives.length} sub-objectives
              </div>
            )}

            {/* Parent Link */}
            {objective.parentId && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-500">
                  <ArrowRight className="h-4 w-4 mr-1" />
                  <span>Contributes to:</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const parentObjective = objectives.find(obj => obj.id === objective.parentId);
                      if (parentObjective) {
                        onObjectiveSelect(parentObjective);
                        setExpandedIds(new Set([...expandedIds, parentObjective.id]));
                      }
                    }}
                    className="ml-2 text-primary-600 hover:text-primary-700"
                  >
                    {objectives.find(obj => obj.id === objective.parentId)?.title}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="mt-8 space-y-8 relative">
            {childObjectives.map(childObj => renderObjectiveCard(childObj, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-6">
        {companyObjectives.map(objective => renderObjectiveCard(objective))}
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
          onLinkKPI={onLinkKPI}
          onUnlinkKPI={onUnlinkKPI}
        />
      )}
    </>
  );
}

function organizeObjectivesHierarchy(objectives: Objective[]) {
  const companyObjectives = objectives.filter(obj => obj.level === 'company');
  const objectiveMap = new Map<string, Objective[]>();

  objectives.forEach(obj => {
    if (obj.parentId) {
      const children = objectiveMap.get(obj.parentId) || [];
      objectiveMap.set(obj.parentId, [...children, obj]);
    }
  });

  return { companyObjectives, objectiveMap };
}