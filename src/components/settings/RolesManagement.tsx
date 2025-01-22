import React, { useState } from 'react';
import { Shield, Info, Check, X, AlertTriangle, Search, Eye, EyeOff, Save } from 'lucide-react';
import { ROLES, canManageRole } from '../../config/roles';
import type { Role, UserRole, RolePermissions } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/adminService';

interface PermissionGroup {
  name: string;
  permissions: Array<{
    key: keyof RolePermissions;
    label: string;
  }>;
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    name: 'User Management',
    permissions: [
      { key: 'canManageUsers', label: 'Manage Users' },
      { key: 'canCreateUsers', label: 'Create Users' },
      { key: 'canEditUsers', label: 'Edit Users' },
      { key: 'canDeleteUsers', label: 'Delete Users' },
      { key: 'canViewUsers', label: 'View Users' },
      { key: 'canManageRoles', label: 'Manage Roles' },
      { key: 'canAssignRoles', label: 'Assign Roles' },
    ]
  },
  {
    name: 'Team Management',
    permissions: [
      { key: 'canManageTeam', label: 'Manage Team' },
      { key: 'canCreateTeamMembers', label: 'Create Team Members' },
      { key: 'canEditTeamMembers', label: 'Edit Team Members' },
      { key: 'canDeleteTeamMembers', label: 'Delete Team Members' },
      { key: 'canViewTeam', label: 'View Team' },
      { key: 'canManageDepartments', label: 'Manage Departments' },
    ]
  },
  {
    name: 'Project Management',
    permissions: [
      { key: 'canManageProjects', label: 'Manage Projects' },
      { key: 'canCreateProjects', label: 'Create Projects' },
      { key: 'canEditProjects', label: 'Edit Projects' },
      { key: 'canDeleteProjects', label: 'Delete Projects' },
      { key: 'canViewProjects', label: 'View Projects' },
      { key: 'canAssignProjectMembers', label: 'Assign Project Members' },
      { key: 'canManageProjectBudget', label: 'Manage Project Budget' },
      { key: 'canApproveProjectMilestones', label: 'Approve Project Milestones' },
    ]
  },
  {
    name: 'Objective Management',
    permissions: [
      { key: 'canManageObjectives', label: 'Manage Objectives' },
      { key: 'canCreateObjectives', label: 'Create Objectives' },
      { key: 'canEditObjectives', label: 'Edit Objectives' },
      { key: 'canDeleteObjectives', label: 'Delete Objectives' },
      { key: 'canViewObjectives', label: 'View Objectives' },
      { key: 'canAlignObjectives', label: 'Align Objectives' },
      { key: 'canApproveObjectives', label: 'Approve Objectives' },
      { key: 'canManageKeyResults', label: 'Manage Key Results' },
    ]
  },
  {
    name: 'KPI Management',
    permissions: [
      { key: 'canManageKPIs', label: 'Manage KPIs' },
      { key: 'canCreateKPIs', label: 'Create KPIs' },
      { key: 'canEditKPIs', label: 'Edit KPIs' },
      { key: 'canDeleteKPIs', label: 'Delete KPIs' },
      { key: 'canViewKPIs', label: 'View KPIs' },
      { key: 'canSetKPITargets', label: 'Set KPI Targets' },
      { key: 'canApproveKPIChanges', label: 'Approve KPI Changes' },
    ]
  },
  {
    name: 'Reports & Analytics',
    permissions: [
      { key: 'canViewReports', label: 'View Reports' },
      { key: 'canCreateReports', label: 'Create Reports' },
      { key: 'canExportReports', label: 'Export Reports' },
      { key: 'canViewAnalytics', label: 'View Analytics' },
      { key: 'canViewDashboards', label: 'View Dashboards' },
      { key: 'canCustomizeDashboards', label: 'Customize Dashboards' },
      { key: 'canShareReports', label: 'Share Reports' },
      { key: 'canScheduleReports', label: 'Schedule Reports' },
    ]
  },
  {
    name: 'System Administration',
    permissions: [
      { key: 'canAccessAdmin', label: 'Access Admin Panel' },
      { key: 'canManageSettings', label: 'Manage Settings' },
      { key: 'canConfigureSystem', label: 'Configure System' },
      { key: 'canViewAuditLogs', label: 'View Audit Logs' },
      { key: 'canManageIntegrations', label: 'Manage Integrations' },
      { key: 'canManageAPIKeys', label: 'Manage API Keys' },
      { key: 'canManageWebhooks', label: 'Manage Webhooks' },
    ]
  },
  {
    name: 'Security & Compliance',
    permissions: [
      { key: 'canManageSecurity', label: 'Manage Security' },
      { key: 'canViewSecurityLogs', label: 'View Security Logs' },
      { key: 'canManageCompliance', label: 'Manage Compliance' },
      { key: 'canExportData', label: 'Export Data' },
      { key: 'canImportData', label: 'Import Data' },
      { key: 'canManageBackups', label: 'Manage Backups' },
      { key: 'canManageEncryption', label: 'Manage Encryption' },
    ]
  },
];

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
    return canManageRole(user.role, role.id as UserRole);
  };

  const handleEditRole = (role: Role) => {
    if (!canManageSelectedRole(role)) return;
    setEditingRole({ ...role });
  };

  const handlePermissionToggle = (key: keyof RolePermissions) => {
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

  const PermissionIcon = ({ enabled, onClick }: { enabled: boolean, onClick?: () => void }) => (
    <span 
      className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${
        enabled ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
      } ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
      onClick={onClick}
    >
      {enabled ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
    </span>
  );

  const RoleCard = ({ role }: { role: Role }) => {
    const permissionCount = Object.values(role.permissions).filter(Boolean).length;
    const totalPermissions = Object.keys(role.permissions).length;
    const permissionPercentage = (permissionCount / totalPermissions) * 100;

    return (
      <div 
        className={`bg-white rounded-lg border ${
          selectedRole?.id === role.id ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200'
        } p-6 cursor-pointer hover:border-primary-300 transition-colors`}
        onClick={() => setSelectedRole(role)}
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
          {PERMISSION_GROUPS.slice(0, 2).map(group => (
            <div key={group.name} className="space-y-2">
              {group.permissions.slice(0, 2).map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <PermissionIcon enabled={role.permissions[key]} />
                  <span className="text-sm text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const PermissionDetails = ({ permissions, isEditing = false }: { permissions: RolePermissions, isEditing?: boolean }) => (
    <div className="space-y-8">
      {PERMISSION_GROUPS.map(group => (
        <div key={group.name} className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">{group.name}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {group.permissions.map(({ key, label }) => (
              <div key={key} className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg ${
                isEditing ? 'cursor-pointer hover:bg-gray-100' : ''
              }`} onClick={() => isEditing && handlePermissionToggle(key)}>
                <div className="flex items-center space-x-3">
                  <PermissionIcon 
                    enabled={permissions[key]} 
                    onClick={isEditing ? () => handlePermissionToggle(key) : undefined}
                  />
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </div>
                {permissions[key] ? (
                  <span className="text-xs font-medium text-green-600">Enabled</span>
                ) : (
                  <span className="text-xs font-medium text-red-600">Disabled</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

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
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <p className="ml-3 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4 rounded">
          <div className="flex">
            <Check className="h-5 w-5 text-green-400" />
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
          <RoleCard key={role.id} role={role} />
        ))}
      </div>

      {(selectedRole || editingRole) && (
        <div className="mt-8 border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Role Details: {editingRole?.name || selectedRole?.name}
            </h3>
            {user?.isAdmin && !editingRole && (
              <button
                onClick={() => handleEditRole(selectedRole!)}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
              >
                Edit Permissions
              </button>
            )}
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <Info className="h-5 w-5 text-blue-400" />
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Access Level: {editingRole?.level || selectedRole?.level} - {editingRole?.description || selectedRole?.description}
                </p>
              </div>
            </div>
          </div>

          {showPermissionDetails && (
            <>
              <PermissionDetails 
                permissions={editingRole?.permissions || selectedRole!.permissions} 
                isEditing={!!editingRole}
              />
              {editingRole && (
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setEditingRole(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveRole}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}