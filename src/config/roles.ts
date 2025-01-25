import type { Role, RolePermissions, UserRole } from '../types';

// Default permissions (all false)
const defaultPermissions: RolePermissions = {
  // User Management
  canManageUsers: false,
  canCreateUsers: false,
  canEditUsers: false,
  canDeleteUsers: false,
  canViewUsers: false,
  canManageRoles: false,
  canAssignRoles: false,

  // Team Management
  canManageTeam: false,
  canCreateTeamMembers: false,
  canEditTeamMembers: false,
  canDeleteTeamMembers: false,
  canViewTeam: false,
  canManageDepartments: false,

  // Project Management
  canManageProjects: false,
  canCreateProjects: false,
  canEditProjects: false,
  canDeleteProjects: false,
  canViewProjects: false,
  canAssignProjectMembers: false,
  canManageProjectBudget: false,
  canApproveProjectMilestones: false,

  // Objective Management
  canManageObjectives: false,
  canCreateObjectives: false,
  canEditObjectives: false,
  canDeleteObjectives: false,
  canViewObjectives: false,
  canAlignObjectives: false,
  canApproveObjectives: false,
  canManageKeyResults: false,

  // KPI Management
  canManageKPIs: false,
  canCreateKPIs: false,
  canEditKPIs: false,
  canDeleteKPIs: false,
  canViewKPIs: false,
  canSetKPITargets: false,
  canApproveKPIChanges: false,

  // Report & Analytics
  canViewReports: false,
  canCreateReports: false,
  canExportReports: false,
  canViewAnalytics: false,
  canViewDashboards: false,
  canCustomizeDashboards: false,
  canShareReports: false,
  canScheduleReports: false,

  // Document Management
  canManageDocuments: false,
  canUploadDocuments: false,
  canEditDocuments: false,
  canDeleteDocuments: false,
  canViewDocuments: false,
  canShareDocuments: false,
  canApproveDocuments: false,

  // Communication & Collaboration
  canManageAnnouncements: false,
  canCreateAnnouncements: false,
  canManageComments: false,
  canManageFeedback: false,
  canInitiateDiscussions: false,
  canModerateDiscussions: false,

  // System Administration
  canAccessAdmin: false,
  canManageSettings: false,
  canConfigureSystem: false,
  canViewAuditLogs: false,
  canManageIntegrations: false,
  canManageAPIKeys: false,
  canManageWebhooks: false,

  // Security & Compliance
  canManageSecurity: false,
  canViewSecurityLogs: false,
  canManageCompliance: false,
  canExportData: false,
  canImportData: false,
  canManageBackups: false,
  canManageEncryption: false,

  // Workflow & Automation
  canManageWorkflows: false,
  canCreateWorkflows: false,
  canEditWorkflows: false,
  canDeleteWorkflows: false,
  canActivateWorkflows: false,
  canManageAutomations: false,

  // Resource Management
  canManageResources: false,
  canAllocateResources: false,
  canViewResourceUtilization: false,
  canManageCapacityPlanning: false,
  canApproveResourceRequests: false,

  // Financial Management
  canManageBudgets: false,
  canViewFinancials: false,
  canApproveBudgets: false,
  canManageExpenses: false,
  canViewCostReports: false,
  canManageInvoicing: false,

  // Training & Development
  canManageTraining: false,
  canAssignTraining: false,
  canCreateTrainingContent: false,
  canViewTrainingMetrics: false,
  canManageCertifications: false,
  canIssueCertificates: false,

  // Quality Management
  canManageQuality: false,
  canCreateQualityMetrics: false,
  canPerformQualityChecks: false,
  canApproveQualityStandards: false,
  canViewQualityReports: false
};

// Role configurations with specific permissions
export const ROLES: Record<UserRole, Role> = {
  admin: {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access with all privileges',
    level: 1,
    permissions: Object.keys(defaultPermissions).reduce((acc, key) => ({
      ...acc,
      [key]: true
    }), {} as RolePermissions)
  },

  director: {
    id: 'director',
    name: 'Director',
    description: 'Strategic oversight and department management',
    level: 2,
    permissions: {
      ...defaultPermissions,
      // User & Team Management
      canViewUsers: true,
      canViewTeam: true,
      canManageTeam: true,
      canManageDepartments: true,
      canAssignRoles: true,

      // Project Management
      canManageProjects: true,
      canCreateProjects: true,
      canEditProjects: true,
      canDeleteProjects: true,
      canViewProjects: true,
      canAssignProjectMembers: true,
      canManageProjectBudget: true,
      canApproveProjectMilestones: true,

      // Objective Management
      canManageObjectives: true,
      canCreateObjectives: true,
      canEditObjectives: true,
      canDeleteObjectives: true,
      canViewObjectives: true,
      canAlignObjectives: true,
      canApproveObjectives: true,
      canManageKeyResults: true,

      // KPI Management
      canManageKPIs: true,
      canCreateKPIs: true,
      canEditKPIs: true,
      canViewKPIs: true,
      canSetKPITargets: true,
      canApproveKPIChanges: true,

      // Reports & Analytics
      canViewReports: true,
      canCreateReports: true,
      canExportReports: true,
      canViewAnalytics: true,
      canViewDashboards: true,
      canCustomizeDashboards: true,
      canShareReports: true,
      canScheduleReports: true,

      // Financial Management
      canManageBudgets: true,
      canViewFinancials: true,
      canApproveBudgets: true,
      canManageExpenses: true,
      canViewCostReports: true,

      // Resource Management
      canManageResources: true,
      canAllocateResources: true,
      canViewResourceUtilization: true,
      canManageCapacityPlanning: true,
      canApproveResourceRequests: true,

      // Communication & Collaboration
      canManageAnnouncements: true,
      canCreateAnnouncements: true,
      canManageComments: true,
      canInitiateDiscussions: true,
      canModerateDiscussions: true,

      // Document Management
      canManageDocuments: true,
      canUploadDocuments: true,
      canEditDocuments: true,
      canViewDocuments: true,
      canShareDocuments: true,
      canApproveDocuments: true,
    }
  },

  manager: {
    id: 'manager',
    name: 'Manager',
    description: 'Team and project management',
    level: 3,
    permissions: {
      ...defaultPermissions,
      // Team Management
      canViewTeam: true,
      canManageTeam: true,
      canCreateTeamMembers: true,
      canEditTeamMembers: true,
      canViewUsers: true,

      // Project Management
      canManageProjects: true,
      canCreateProjects: true,
      canEditProjects: true,
      canViewProjects: true,
      canAssignProjectMembers: true,
      canApproveProjectMilestones: true,

      // Objective Management
      canManageObjectives: true,
      canCreateObjectives: true,
      canEditObjectives: true,
      canViewObjectives: true,
      canAlignObjectives: true,
      canManageKeyResults: true,

      // KPI Management
      canManageKPIs: true,
      canEditKPIs: true,
      canViewKPIs: true,
      canSetKPITargets: true,

      // Reports & Analytics
      canViewReports: true,
      canCreateReports: true,
      canViewAnalytics: true,
      canViewDashboards: true,
      canShareReports: true,

      // Resource Management
      canViewResourceUtilization: true,
      canManageCapacityPlanning: true,
      canAllocateResources: true,

      // Communication & Collaboration
      canCreateAnnouncements: true,
      canManageComments: true,
      canInitiateDiscussions: true,

      // Document Management
      canUploadDocuments: true,
      canEditDocuments: true,
      canViewDocuments: true,
      canShareDocuments: true,

      // Training & Development
      canManageTraining: true,
      canAssignTraining: true,
      canViewTrainingMetrics: true,
    }
  },

  team_lead: {
    id: 'team_lead',
    name: 'Team Lead',
    description: 'Team coordination and project execution',
    level: 4,
    permissions: {
      ...defaultPermissions,
      // Team Management
      canViewTeam: true,
      canEditTeamMembers: true,
      canViewUsers: true,

      // Project Management
      canCreateProjects: true,
      canEditProjects: true,
      canViewProjects: true,
      canAssignProjectMembers: true,

      // Objective Management
      canCreateObjectives: true,
      canEditObjectives: true,
      canViewObjectives: true,
      canManageKeyResults: true,

      // KPI Management
      canEditKPIs: true,
      canViewKPIs: true,

      // Reports & Analytics
      canViewReports: true,
      canViewAnalytics: true,
      canViewDashboards: true,

      // Resource Management
      canViewResourceUtilization: true,
      canAllocateResources: true,

      // Communication & Collaboration
      canCreateAnnouncements: true,
      canManageComments: true,
      canInitiateDiscussions: true,

      // Document Management
      canUploadDocuments: true,
      canEditDocuments: true,
      canViewDocuments: true,
      canShareDocuments: true,

      // Training & Development
      canAssignTraining: true,
      canViewTrainingMetrics: true,
    }
  },

  senior_employee: {
    id: 'senior_employee',
    name: 'Senior Employee',
    description: 'Experienced team member with additional responsibilities',
    level: 5,
    permissions: {
      ...defaultPermissions,
      // Team & Project
      canViewTeam: true,
      canViewProjects: true,
      canEditProjects: true,

      // Objectives & KPIs
      canViewObjectives: true,
      canEditObjectives: true,
      canManageKeyResults: true,
      canViewKPIs: true,

      // Reports & Analytics
      canViewReports: true,
      canViewDashboards: true,

      // Communication & Collaboration
      canManageComments: true,
      canInitiateDiscussions: true,

      // Document Management
      canUploadDocuments: true,
      canEditDocuments: true,
      canViewDocuments: true,
      canShareDocuments: true,

      // Training
      canViewTrainingMetrics: true,
    }
  },

  employee: {
    id: 'employee',
    name: 'Employee',
    description: 'Regular team member',
    level: 6,
    permissions: {
      ...defaultPermissions,
      canViewTeam: true,
      canViewProjects: true,
      canViewObjectives: true,
      canViewKPIs: true,
      canViewDashboards: true,
      canViewDocuments: true,
      canUploadDocuments: true,
      canInitiateDiscussions: true,
      canManageComments: true,
    }
  },

  intern: {
    id: 'intern',
    name: 'Intern',
    description: 'Temporary team member in training',
    level: 7,
    permissions: {
      ...defaultPermissions,
      canViewTeam: true,
      canViewProjects: true,
      canViewObjectives: true,
      canViewDashboards: true,
      canViewDocuments: true,
      canManageComments: true,
    }
  },

  external: {
    id: 'external',
    name: 'External Collaborator',
    description: 'External partner with limited access',
    level: 8,
    permissions: {
      ...defaultPermissions,
      canViewProjects: true,
      canViewObjectives: true,
      canViewDashboards: true,
      canViewDocuments: true,
      canManageComments: true,
    }
  },
};

// Helper functions
export function getRoleByLevel(level: number): Role | undefined {
  return Object.values(ROLES).find(role => role.level === level);
}

export function getRoleById(id: UserRole): Role {
  return ROLES[id];
}

export function hasPermission(role: UserRole, permission: keyof RolePermissions): boolean {
  return ROLES[role].permissions[permission];
}

export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  // A user can only manage roles of lower level than their own
  return ROLES[managerRole].level < ROLES[targetRole].level;
}