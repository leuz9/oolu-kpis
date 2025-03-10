import React, { useState } from 'react';
import { Shield, Info, Search, Eye, EyeOff } from 'lucide-react';
import { ROLES, canManageRole } from '../../config/roles';
import type { Role, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/adminService';
import RoleCard from './roles/RoleCard';
import RoleDetails from './roles/RoleDetails';

export default function RolesManagement() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showPermissionDetails, setShowPermissionDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user } = useAuth();

  const filteredRoles = Object.values(ROLES).filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canManageSelectedRole = (role: Role) => {
    if (!user?.isAdmin) return false;
    return canManageRole(user.role as UserRole, role.id as UserRole);
  };

  const handleEditRole = (role: Role) => {
    if (!canManageSelectedRole(role)) return;
    setEditingRole({ ...role });
  };

  const handlePermissionToggle = (key: keyof Role['permissions']) => {
    if (!editingRole) return;
    setEditingRole({
      ...editingRole,
      permissions: {
        ...editingRole.permissions,
        [key]: !editingRole.permissions[key]
      }
    });
  };

  const handleSaveRole = async () => {
    if (!editingRole) return;

    try {
      await adminService.updateRole(editingRole.id, editingRole);
      setSuccess(`Role "${editingRole.name}" updated successfully`);
      setSelectedRole(editingRole);
      setEditingRole(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update role permissions');
      console.error('Error updating role:', err);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Shield className="h-6 w-6 text-primary-600 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Roles and Permissions</h2>
        </div>
        <button
          onClick={() => setShowPermissionDetails(!showPermissionDetails)}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          {showPermissionDetails ? (
            <EyeOff className="h-4 w-4 mr-2" />
          ) : (
            <Eye className="h-4 w-4 mr-2" />
          )}
          {showPermissionDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex">
            <Info className="h-5 w-5 text-red-400" />
            <p className="ml-3 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4 rounded">
          <div className="flex">
            <Info className="h-5 w-5 text-green-400" />
            <p className="ml-3 text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {filteredRoles.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            isSelected={selectedRole?.id === role.id}
            onClick={setSelectedRole}
          />
        ))}
      </div>

      {(selectedRole || editingRole) && showPermissionDetails && (
        <RoleDetails
          role={editingRole || selectedRole!}
          isEditing={!!editingRole}
          onTogglePermission={handlePermissionToggle}
          onSave={handleSaveRole}
        />
      )}
    </div>
  );
}