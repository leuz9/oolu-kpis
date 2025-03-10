import React from 'react';
import type { RolePermissions } from '../../../types';

interface PermissionGroupProps {
  name: string;
  permissions: Array<{
    key: keyof RolePermissions;
    label: string;
  }>;
  values: RolePermissions;
  isEditing: boolean;
  onToggle?: (key: keyof RolePermissions) => void;
}

export default function PermissionGroup({
  name,
  permissions,
  values,
  isEditing,
  onToggle
}: PermissionGroupProps) {
  const PermissionIcon = ({ enabled }: { enabled: boolean }) => (
    <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${
      enabled ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
    }`}>
      {enabled ? '✓' : '×'}
    </span>
  );

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-gray-900">{name}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {permissions.map(({ key, label }) => (
          <div
            key={key}
            className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg ${
              isEditing ? 'cursor-pointer hover:bg-gray-100' : ''
            }`}
            onClick={() => isEditing && onToggle?.(key)}
          >
            <div className="flex items-center space-x-3">
              <PermissionIcon enabled={values[key]} />
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </div>
            {values[key] ? (
              <span className="text-xs font-medium text-green-600">Enabled</span>
            ) : (
              <span className="text-xs font-medium text-red-600">Disabled</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}