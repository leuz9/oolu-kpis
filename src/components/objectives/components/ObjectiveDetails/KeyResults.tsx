import React from 'react';
import type { KeyResult } from '../../../../types';
import KeyResultCard from '../KeyResultCard';

interface KeyResultsProps {
  keyResults: KeyResult[];
}

export default function KeyResults({ keyResults = [] }: KeyResultsProps) {
  if (keyResults.length === 0) {
    return (
      <div className="text-sm text-gray-500 text-center py-4">
        No key results defined for this objective
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {keyResults.map(kr => (
        <KeyResultCard key={kr.id} keyResult={kr} />
      ))}
    </div>
  );
}