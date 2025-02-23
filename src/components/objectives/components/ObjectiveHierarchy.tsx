import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Target, Building2, User } from 'lucide-react';
import type { Objective } from '../../../types';

interface ObjectiveHierarchyProps {
  objectives: Objective[];
  onObjectiveSelect: (objective: Objective) => void;
}

export default function ObjectiveHierarchy({
  objectives,
  onObjectiveSelect
}: ObjectiveHierarchyProps) {
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
          onClick={() => onObjectiveSelect(objective)}
        >
          <div className="flex items-center flex-1">
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(objective.id);
                }}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </button>
            ) : (
              <div className="w-6" />
            )}
            
            {objective.level === 'company' && <Target className="h-4 w-4 text-primary-600 mr-2" />}
            {objective.level === 'department' && <Building2 className="h-4 w-4 text-blue-600 mr-2" />}
            {objective.level === 'individual' && <User className="h-4 w-4 text-green-600 mr-2" />}
            
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{objective.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {objective.level.charAt(0).toUpperCase() + objective.level.slice(1)} Level
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                    objective.status === 'on-track' ? 'bg-green-100 text-green-800' :
                    objective.status === 'at-risk' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {objective.status.replace('-', ' ')}
                  </span>
                  <div className="w-16">
                    <div className="text-xs text-gray-500 text-right">{objective.progress}%</div>
                    <div className="mt-0.5 h-1 w-full bg-gray-200 rounded-full">
                      <div
                        className="h-1 rounded-full bg-primary-600"
                        style={{ width: `${objective.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="ml-4 border-l border-gray-200 mt-1">
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
        <div className="mt-2 flex items-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center">
            <Target className="h-4 w-4 text-primary-600 mr-1.5" />
            Company
          </div>
          <div className="flex items-center">
            <Building2 className="h-4 w-4 text-blue-600 mr-1.5" />
            Department
          </div>
          <div className="flex items-center">
            <User className="h-4 w-4 text-green-600 mr-1.5" />
            Individual
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="space-y-2">
          {companyObjectives.map(objective => renderObjective(objective))}
        </div>
      </div>
    </div>
  );
}