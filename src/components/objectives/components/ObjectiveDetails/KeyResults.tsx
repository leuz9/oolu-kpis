import React from 'react';
import type { KeyResult } from '../../../../types';
import KeyResultCard from '../KeyResultCard';

interface KeyResultsProps {
  keyResults?: KeyResult[];
}

export default function KeyResults({ keyResults = [] }: KeyResultsProps) {
  return (
    <div>
      <div className="space-y-4">
        {keyResults.map(kr => (
          <KeyResultCard key={kr.id} keyResult={kr} />
        ))}
      </div>
    </div>
  );
}