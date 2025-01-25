import React from 'react';
import { Target } from 'lucide-react';
import type { Objective } from '../../../../types';
import StatusBadge from './StatusBadge';

interface HeaderProps {
  objective: Objective;
}

export default function Header({ objective }: HeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center space-x-3">
          <Target className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            {objective.title}
          </h2>
        </div>
        <p className="mt-2 text-gray-600">{objective.description}</p>
      </div>
      <StatusBadge status={objective.status} />
    </div>
  );
}