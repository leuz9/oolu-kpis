import React from 'react';
import { Calendar } from 'lucide-react';
import type { KeyResult } from '../../../types';

interface KeyResultCardProps {
  keyResult: KeyResult;
}

export default function KeyResultCard({ keyResult }: KeyResultCardProps) {
  const progressColor = keyResult.progress >= 100 ? 'bg-green-500' : 
                       keyResult.progress >= 70 ? 'bg-blue-500' :
                       keyResult.progress >= 40 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-sm font-medium text-gray-900">{keyResult.title}</h4>
        <span className="text-sm font-medium text-gray-500">
          {keyResult.current} / {keyResult.target} {keyResult.unit}
        </span>
      </div>
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-gray-600 bg-gray-100">
              Progress
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-gray-600">
              {keyResult.progress}%
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
          <div
            style={{ width: `${keyResult.progress}%` }}
            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${progressColor} transition-all duration-500`}
          />
        </div>
      </div>
      <div className="flex items-center text-xs text-gray-500">
        <Calendar className="h-3 w-3 mr-1" />
        Due: {new Date(keyResult.dueDate).toLocaleDateString()}
      </div>
    </div>
  );
}