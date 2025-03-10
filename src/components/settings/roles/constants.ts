import type { RolePermissions } from '../../../types';

export const PERMISSION_GROUPS = [
  {
    name: 'User Management',
    permissions: [
      { key: 'canManageUsers' as keyof RolePermissions, label: 'Manage Users' },
      { key: 'canCreateUsers' as keyof RolePermissions, label: 'Create Users' },
      { key: 'canEditUsers' as keyof RolePermissions, label: 'Edit Users' },
      { key: 'canDeleteUsers' as keyof RolePermissions, label: 'Delete Users' },
      { key: 'canViewUsers' as keyof RolePermissions, label: 'View Users' },
      { key: 'canManageRoles' as keyof RolePermissions, label: 'Manage Roles' },
      { key: 'canAssignRoles' as keyof RolePermissions, label: 'Assign Roles' }
    ]
  },
  {
    name: 'Team Management',
    permissions: [
      { key: 'canManageTeam' as keyof RolePermissions, label: 'Manage Team' },
      { key: 'canCreateTeamMembers' as keyof RolePermissions, label: 'Create Team Members' },
      { key: 'canEditTeamMembers' as keyof RolePermissions, label: 'Edit Team Members' },
      { key: 'canDeleteTeamMembers' as keyof RolePermissions, label: 'Delete Team Members' },
      { key: 'canViewTeam' as keyof RolePermissions, label: 'View Team' },
      { key: 'canManageDepartments' as keyof RolePermissions, label: 'Manage Departments' }
    ]
  },
  {
    name: 'Project Management',
    permissions: [
      { key: 'canManageProjects' as keyof RolePermissions, label: 'Manage Projects' },
      { key: 'canCreateProjects' as keyof RolePermissions, label: 'Create Projects' },
      { key: 'canEditProjects' as keyof RolePermissions, label: 'Edit Projects' },
      { key: 'canDeleteProjects' as keyof RolePermissions, label: 'Delete Projects' },
      { key: 'canViewProjects' as keyof RolePermissions, label: 'View Projects' },
      { key: 'canAssignProjectMembers' as keyof RolePermissions, label: 'Assign Project Members' },
      { key: 'canManageProjectBudget' as keyof RolePermissions, label: 'Manage Project Budget' },
      { key: 'canApproveProjectMilestones' as keyof RolePermissions, label: 'Approve Project Milestones' }
    ]
  },
  {
    name: 'Objective Management',
    permissions: [
      { key: 'canManageObjectives' as keyof RolePermissions, label: 'Manage Objectives' },
      { key: 'canCreateObjectives' as keyof RolePermissions, label: 'Create Objectives' },
      { key: 'canEditObjectives' as keyof RolePermissions, label: 'Edit Objectives' },
      { key: 'canDeleteObjectives' as keyof RolePermissions, label: 'Delete Objectives' },
      { key: 'canViewObjectives' as keyof RolePermissions, label: 'View Objectives' },
      { key: 'canAlignObjectives' as keyof RolePermissions, label: 'Align Objectives' },
      { key: 'canApproveObjectives' as keyof RolePermissions, label: 'Approve Objectives' },
      { key: 'canManageKeyResults' as keyof RolePermissions, label: 'Manage Key Results' }
    ]
  },
  {
    name: 'KPI Management',
    permissions: [
      { key: 'canManageKPIs' as keyof RolePermissions, label: 'Manage KPIs' },
      { key: 'canCreateKPIs' as keyof RolePermissions, label: 'Create KPIs' },
      { key: 'canEditKPIs' as keyof RolePermissions, label: 'Edit KPIs' },
      { key: 'canDeleteKPIs' as keyof RolePermissions, label: 'Delete KPIs' },
      { key: 'canViewKPIs' as keyof RolePermissions, label: 'View KPIs' },
      { key: 'canSetKPITargets' as keyof RolePermissions, label: 'Set KPI Targets' },
      { key: 'canApproveKPIChanges' as keyof RolePermissions, label: 'Approve KPI Changes' }
    ]
  },
  {
    name: 'Reports & Analytics',
    permissions: [
      { key: 'canViewReports' as keyof RolePermissions, label: 'View Reports' },
      { key: 'canCreateReports' as keyof RolePermissions, label: 'Create Reports' },
      { key: 'canExportReports' as keyof RolePermissions, label: 'Export Reports' },
      { key: 'canViewAnalytics' as keyof RolePermissions, label: 'View Analytics' },
      { key: 'canViewDashboards' as keyof RolePermissions, label: 'View Dashboards' },
      { key: 'canCustomizeDashboards' as keyof RolePermissions, label: 'Customize Dashboards' },
      { key: 'canShareReports' as keyof RolePermissions, label: 'Share Reports' },
      { key: 'canScheduleReports' as keyof RolePermissions, label: 'Schedule Reports' }
    ]
  },
  {
    name: 'System Administration',
    permissions: [
      { key: 'canAccessAdmin' as keyof RolePermissions, label: 'Access Admin Panel' },
      { key: 'canManageSettings' as keyof RolePermissions, label: 'Manage Settings' },
      { key: 'canConfigureSystem' as keyof RolePermissions, label: 'Configure System' },
      { key: 'canViewAuditLogs' as keyof RolePermissions, label: 'View Audit Logs' },
      { key: 'canManageIntegrations' as keyof RolePermissions, label: 'Manage Integrations' },
      { key: 'canManageAPIKeys' as keyof RolePermissions, label: 'Manage API Keys' },
      { key: 'canManageWebhooks' as keyof RolePermissions, label: 'Manage Webhooks' }
    ]
  },
  {
    name: 'Security & Compliance',
    permissions: [
      { key: 'canManageSecurity' as keyof RolePermissions, label: 'Manage Security' },
      { key: 'canViewSecurityLogs' as keyof RolePermissions, label: 'View Security Logs' },
      { key: 'canManageCompliance' as keyof RolePermissions, label: 'Manage Compliance' },
      { key: 'canExportData' as keyof RolePermissions, label: 'Export Data' },
      { key: 'canImportData' as keyof RolePermissions, label: 'Import Data' },
      { key: 'canManageBackups' as keyof RolePermissions, label: 'Manage Backups' },
      { key: 'canManageEncryption' as keyof RolePermissions, label: 'Manage Encryption' }
    ]
  }
];