import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Target, Users, User } from 'lucide-react';
import type { Objective } from '../../types';

interface ObjectiveHierarchyProps {
  objectives: Objective[];
  onObjectiveSelect: (objective: Objective) => void;
}

export default function ObjectiveHierarchy({ objectives, onObjectiveSelect }: ObjectiveHierarchyProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  // Organize objectives by level
  const companyObjectives = objectives.filter(obj => obj.level === 'company');
  
  const getChildObjectives = (parentId: string) => {
    return objectives.filter(obj => obj.parentId === parentId);
  };

  const renderObjective = (objective: Objective, level: number = 0) => {
    const childObjectives = getChildObjectives(objective.id);
    const hasChildren = childObjectives.length > 0;
    const isExpanded = expandedNodes.has(objective.id);

    return (
      <div key={objective.id} className="select-none">
        <div 
          className={`
            flex items-center p-2 hover:bg-gray-50 cursor-pointer
            ${level > 0 ? 'ml-6' : ''}
          `}
          onClick={() => {
            if (hasChildren) {
              toggleNode(objective.id);
            }
            onObjectiveSelect(objective);
          }}
        >
          <div className="flex items-center flex-1">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-400 mr-2" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400 mr-2" />
              )
            ) : (
              <div className="w-4 mr-2" />
            )}
            
            {objective.level === 'company' && <Target className="h-4 w-4 text-indigo-500 mr-2" />}
            {objective.level === 'department' && <Users className="h-4 w-4 text-blue-500 mr-2" />}
            {objective.level === 'individual' && <User className="h-4 w-4 text-green-500 mr-2" />}
            
            <div>
              <div className="text-sm font-medium text-gray-900">{objective.title}</div>
              <div className="text-xs text-gray-500">
                Progress: {objective.progress}% | Status: {objective.status}
              </div>
            </div>
          </div>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="ml-4 border-l border-gray-200">
            {childObjectives.map(child => renderObjective(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium text-gray-900">Objectives Hierarchy</h2>
      </div>
      <div className="p-4">
        <div className="space-y-2">
          {companyObjectives.map(objective => renderObjective(objective))}
        </div>
      </div>
    </div>
  );
}