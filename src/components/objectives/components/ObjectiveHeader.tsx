import React from 'react';
import { Plus, Target, Building2, User } from 'lucide-react';
import type { Objective } from '../../../types';

interface ObjectiveHeaderProps {
  onAddClick: () => void;
  parentObjective?: Objective | null;
}

export default function ObjectiveHeader({ onAddClick, parentObjective }: ObjectiveHeaderProps) {
  const getLevelIcon = (level?: string) => {
    switch (level) {
      case 'company':
        return <Building2 className="h-5 w-5 mr-2" />;
      case 'department':
        return <User className="h-5 w-5 mr-2" />;
      default:
        return <Target className="h-5 w-5 mr-2" />;
    }
  };

  const getButtonStyle = () => {
    if (!parentObjective) {
      return 'bg-primary-600 hover:bg-primary-700 text-white';
    }

    switch (parentObjective.level) {
      case 'company':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'department':
        return 'bg-green-600 hover:bg-green-700 text-white';
      default:
        return 'bg-primary-600 hover:bg-primary-700 text-white';
    }
  };

  const getButtonText = () => {
    if (!parentObjective) {
      return 'New Objective';
    }

    switch (parentObjective.level) {
      case 'company':
        return 'Add Department Objective';
      case 'department':
        return 'Add Individual Objective';
      default:
        return 'New Objective';
    }
  };

  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Objectives</h1>
        <p className="mt-1 text-sm text-gray-500">
          {parentObjective 
            ? `Adding sub-objective to "${parentObjective.title}"`
            : 'Track and manage company, department, and individual objectives'
          }
        </p>
      </div>
      <button
        onClick={onAddClick}
        className={`flex items-center px-4 py-2 rounded-md transition-colors ${getButtonStyle()}`}
      >
        <Plus className="h-5 w-5 mr-2" />
        {getLevelIcon(parentObjective?.level)}
        {getButtonText()}
      </button>
    </div>
  );
}