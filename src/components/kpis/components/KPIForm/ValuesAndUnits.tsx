import React from 'react';
import { UNITS } from './constants';

interface ValuesAndUnitsProps {
  value: number;
  target: number;
  unit: string;
  customUnit: string;
  onValueChange: (value: number) => void;
  onTargetChange: (target: number) => void;
  onUnitChange: (unit: string) => void;
  onCustomUnitChange: (unit: string) => void;
}

export default function ValuesAndUnits({
  value,
  target,
  unit,
  customUnit,
  onValueChange,
  onTargetChange,
  onUnitChange,
  onCustomUnitChange
}: ValuesAndUnitsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Current Value</label>
        <input
          type="number"
          step="0.01"
          value={value}
          onChange={e => onValueChange(parseFloat(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Target Value</label>
        <input
          type="number"
          step="0.01"
          value={target}
          onChange={e => onTargetChange(parseFloat(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Unit</label>
        <select
          value={unit}
          onChange={e => onUnitChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          {UNITS.map(u => (
            <option key={u.value} value={u.value}>{u.label}</option>
          ))}
        </select>
        {unit === 'custom' && (
          <input
            type="text"
            value={customUnit}
            onChange={e => onCustomUnitChange(e.target.value)}
            placeholder="Enter custom unit"
            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        )}
      </div>
    </div>
  );
}