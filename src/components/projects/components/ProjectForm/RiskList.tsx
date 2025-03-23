import React, { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import type { Project } from '../../../../types';

interface RiskListProps {
  risks: Project['risks'];
  onAdd: (risk: Omit<Project['risks'][0], 'id' | 'status'>) => void;
  onRemove: (index: number) => void;
}

export default function RiskList({ risks, onAdd, onRemove }: RiskListProps) {
  const [newRisk, setNewRisk] = useState({
    description: '',
    impact: 'medium' as const,
    probability: 'medium' as const,
    mitigation: ''
  });

  const handleAdd = () => {
    if (newRisk.description.trim()) {
      onAdd(newRisk);
      setNewRisk({
        description: '',
        impact: 'medium',
        probability: 'medium',
        mitigation: ''
      });
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">Risks</h4>
        <span className="text-sm text-gray-500">{risks.length} risks</span>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            value={newRisk.description}
            onChange={e => setNewRisk({ ...newRisk, description: e.target.value })}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="Risk description"
          />
          <input
            type="text"
            value={newRisk.mitigation}
            onChange={e => setNewRisk({ ...newRisk, mitigation: e.target.value })}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="Mitigation strategy"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <select
            value={newRisk.impact}
            onChange={e => setNewRisk({ ...newRisk, impact: e.target.value as 'low' | 'medium' | 'high' })}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="low">Low Impact</option>
            <option value="medium">Medium Impact</option>
            <option value="high">High Impact</option>
          </select>
          <select
            value={newRisk.probability}
            onChange={e => setNewRisk({ ...newRisk, probability: e.target.value as 'low' | 'medium' | 'high' })}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="low">Low Probability</option>
            <option value="medium">Medium Probability</option>
            <option value="high">High Probability</option>
          </select>
          <button
            type="button"
            onClick={handleAdd}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Add Risk
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {risks.map((risk, index) => (
          <div
            key={risk.id}
            className="flex items-center justify-between p-2 bg-white rounded-md"
          >
            <div>
              <div className="flex items-center">
                <AlertTriangle className={`h-5 w-5 mr-2 ${
                  risk.impact === 'high' ? 'text-red-500' :
                  risk.impact === 'medium' ? 'text-yellow-500' :
                  'text-green-500'
                }`} />
                <span className="text-sm font-medium text-gray-900">{risk.description}</span>
              </div>
              <p className="text-sm text-gray-500">{risk.mitigation}</p>
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <span className={`px-2 py-0.5 rounded-full ${
                  risk.impact === 'high' ? 'bg-red-100 text-red-800' :
                  risk.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  Impact: {risk.impact}
                </span>
                <span className={`px-2 py-0.5 rounded-full ${
                  risk.probability === 'high' ? 'bg-red-100 text-red-800' :
                  risk.probability === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  Probability: {risk.probability}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="text-gray-400 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}