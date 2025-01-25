import React from 'react';
import type { KeyResult } from '../../../../types';
import KeyResultCard from '../KeyResultCard';

interface KeyResultsProps {
  keyResults?: KeyResult[];
}

export default function KeyResults({ keyResults = [] }: KeyResultsProps) {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Key Results</h3>
      <div className="space-y-4">
        {keyResults.map(kr => (
          <KeyResultCard key={kr.id} keyResult={kr} />
        ))}
      </div>
    </div>
  );
}