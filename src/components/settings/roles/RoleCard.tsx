import React from 'react';
import { Check, X } from 'lucide-react';
import type { Role } from '../../../types';

interface RoleCardProps {
  role: Role;
  isSelected: boolean;
  onClick: (role: Role) => void;
}

export default function RoleCard({ role, isSelected, onClick }: RoleCardProps) {
  const permissionCount = Object.values(role.permissions).filter(Boolean).length;
  const totalPermissions = Object.keys(role.permissions).length;
  const permissionPercentage = (permissionCount / totalPermissions) * 100;

  const PermissionIcon = ({ enabled }: { enabled: boolean }) => (
    <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${
      enabled ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
    }`}>
      {enabled ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
    </span>
  );

  return (
    <div 
      className={`bg-white rounded-lg border ${
        isSelected ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200'
      } p-6 cursor-pointer hover:border-primary-300 transition-colors`}
      onClick={() => onClick(role)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{role.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{role.description}</p>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
          Level {role.level}
        </span>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Permissions</span>
          <span>{permissionCount} / {totalPermissions}</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-primary-600 rounded-full transition-all duration-300"
            style={{ width: `${permissionPercentage}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {Object.entries(role.permissions).slice(0, 4).map(([key, value]) => (
          <div key={key} className="flex items-center space-x-2">
            <PermissionIcon enabled={value} />
            <span className="text-sm text-gray-600">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}