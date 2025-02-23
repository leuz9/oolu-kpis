import React from 'react';
import { CATEGORIES, FREQUENCIES } from './constants';
import type { KPI } from '../../../../types';

interface CategoryAndFrequencyProps {
  category: string;
  frequency: KPI['frequency'];
  onChange: (field: string, value: string) => void;
}

export default function CategoryAndFrequency({ category, frequency, onChange }: CategoryAndFrequencyProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <select
          value={category}
          onChange={e => onChange('category', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="">Select Category</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Measurement Frequency</label>
        <select
          value={frequency}
          onChange={e => onChange('frequency', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          {FREQUENCIES.map(freq => (
            <option key={freq.value} value={freq.value}>{freq.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}