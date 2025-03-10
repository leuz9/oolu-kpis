import React from 'react';
import { Info, Save } from 'lucide-react';
import type { Role } from '../../../types';
import PermissionGroup from './PermissionGroup';
import { PERMISSION_GROUPS } from './constants';

interface RoleDetailsProps {
  role: Role;
  isEditing: boolean;
  onTogglePermission: (key: keyof Role['permissions']) => void;
  onSave: () => void;
}

export default function RoleDetails({
  role,
  isEditing,
  onTogglePermission,
  onSave
}: RoleDetailsProps) {
  return (
    <div className="mt-8 border-t pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Role Details: {role.name}
        </h3>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex">
          <Info className="h-5 w-5 text-blue-400" />
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Access Level: {role.level} - {role.description}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {PERMISSION_GROUPS.map(group => (
          <PermissionGroup
            key={group.name}
            name={group.name}
            permissions={group.permissions}
            values={role.permissions}
            isEditing={isEditing}
            onToggle={onTogglePermission}
          />
        ))}
      </div>

      {isEditing && (
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onSave}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}