// User and Authentication Types
export type UserRole = 'admin' | 'director' | 'manager' | 'team_lead' | 'senior_employee' | 'employee' | 'intern' | 'external';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  department: string;
  managerId?: string;
  photoURL?: string | null;
  isAdmin: boolean;
  createdAt: string;
  lastLogin: string;
  lastSeen?: string;
  permissions: RolePermissions;
  customClaims: {
    role: UserRole;
    permissions: RolePermissions;
    isAdmin: boolean;
  };
}

// Objective and KPI Types
export interface Objective {
  id: string;
  title: string;
  description: string;
  level: 'company' | 'department' | 'individual';
  status: 'on-track' | 'at-risk' | 'behind' | 'archived';
  progress: number;
  dueDate: string;
  quarter: string;
  year: number;
  parentId?: string;
  department?: string;
  departmentId?: string;
  contributors: string[];
  kpiIds?: string[];
  keyResults?: KeyResult[];
  progressHistory?: Array<{
    progress: number;
    comment: string;
    updatedAt: string;
    updatedBy?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface KeyResult {
  id: string;
  name: string;
  description: string;
  value: number;
  target: number;
  unit: string;
  progress: number;
  trend: 'up' | 'down' | 'stable';
  status: 'on-track' | 'at-risk' | 'behind';
  category: string;
  startDate: string;
  dueDate: string;
  lastUpdated: string;
  history: Array<{
    value: number;
    date: string;
    comment?: string;
  }>;
  objectiveIds: string[];
}

export interface KPI {
  id: string;
  name: string;
  description: string;
  value: number;
  target: number;
  unit: string;
  progress: number;
  trend: 'up' | 'down' | 'stable';
  status: 'on-track' | 'at-risk' | 'behind';
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  dueDate: string;
  lastUpdated: string;
  history: Array<{
    value: number;
    date: string;
    comment?: string;
  }>;
  objectiveIds: string[];
  contributors: string[];
  createdAt: string;
  updatedAt: string;
}

// Project and Task Types
export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled';
  progress: number;
  startDate: string;
  dueDate: string;
  budget?: number;
  department: string;
  teamMembers: string[];
  objectives: string[];
  tasks: Task[];
  risks: Array<{
    id: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    probability: 'low' | 'medium' | 'high';
    mitigation: string;
    status: 'open' | 'mitigated' | 'closed';
  }>;
  documents: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    uploadedBy: string;
    uploadedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  projectId?: string;
  objectiveId?: string;
  dueDate: string;
  subtasks: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Team and Department Types
export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'on-leave';
  utilization: number;
  skills: string[];
  manager?: string;
  reports?: string[];
  createdAt: string;
  updatedAt: string;
}

// Role and Permission Types
export interface RolePermissions {
  // User Management
  canManageUsers: boolean;
  canCreateUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canViewUsers: boolean;
  canManageRoles: boolean;
  canAssignRoles: boolean;

  // Team Management
  canManageTeam: boolean;
  canCreateTeamMembers: boolean;
  canEditTeamMembers: boolean;
  canDeleteTeamMembers: boolean;
  canViewTeam: boolean;
  canManageDepartments: boolean;

  // Project Management
  canManageProjects: boolean;
  canCreateProjects: boolean;
  canEditProjects: boolean;
  canDeleteProjects: boolean;
  canViewProjects: boolean;
  canAssignProjectMembers: boolean;
  canManageProjectBudget: boolean;
  canApproveProjectMilestones: boolean;

  // Objective Management
  canManageObjectives: boolean;
  canCreateObjectives: boolean;
  canEditObjectives: boolean;
  canDeleteObjectives: boolean;
  canViewObjectives: boolean;
  canAlignObjectives: boolean;
  canApproveObjectives: boolean;
  canManageKeyResults: boolean;

  // KPI Management
  canManageKPIs: boolean;
  canCreateKPIs: boolean;
  canEditKPIs: boolean;
  canDeleteKPIs: boolean;
  canViewKPIs: boolean;
  canSetKPITargets: boolean;
  canApproveKPIChanges: boolean;

  // Report & Analytics
  canViewReports: boolean;
  canCreateReports: boolean;
  canExportReports: boolean;
  canViewAnalytics: boolean;
  canViewDashboards: boolean;
  canCustomizeDashboards: boolean;
  canShareReports: boolean;
  canScheduleReports: boolean;

  // Document Management
  canManageDocuments: boolean;
  canUploadDocuments: boolean;
  canEditDocuments: boolean;
  canDeleteDocuments: boolean;
  canViewDocuments: boolean;
  canShareDocuments: boolean;
  canApproveDocuments: boolean;

  // Communication & Collaboration
  canManageAnnouncements: boolean;
  canCreateAnnouncements: boolean;
  canManageComments: boolean;
  canManageFeedback: boolean;
  canInitiateDiscussions: boolean;
  canModerateDiscussions: boolean;

  // System Administration
  canAccessAdmin: boolean;
  canManageSettings: boolean;
  canConfigureSystem: boolean;
  canViewAuditLogs: boolean;
  canManageIntegrations: boolean;
  canManageAPIKeys: boolean;
  canManageWebhooks: boolean;

  // Security & Compliance
  canManageSecurity: boolean;
  canViewSecurityLogs: boolean;
  canManageCompliance: boolean;
  canExportData: boolean;
  canImportData: boolean;
  canManageBackups: boolean;
  canManageEncryption: boolean;

  // Workflow & Automation
  canManageWorkflows: boolean;
  canCreateWorkflows: boolean;
  canEditWorkflows: boolean;
  canDeleteWorkflows: boolean;
  canActivateWorkflows: boolean;
  canManageAutomations: boolean;

  // Resource Management
  canManageResources: boolean;
  canAllocateResources: boolean;
  canViewResourceUtilization: boolean;
  canManageCapacityPlanning: boolean;
  canApproveResourceRequests: boolean;

  // Financial Management
  canManageBudgets: boolean;
  canViewFinancials: boolean;
  canApproveBudgets: boolean;
  canManageExpenses: boolean;
  canViewCostReports: boolean;
  canManageInvoicing: boolean;

  // Training & Development
  canManageTraining: boolean;
  canAssignTraining: boolean;
  canCreateTrainingContent: boolean;
  canViewTrainingMetrics: boolean;
  canManageCertifications: boolean;
  canIssueCertificates: boolean;

  // Quality Management
  canManageQuality: boolean;
  canCreateQualityMetrics: boolean;
  canPerformQualityChecks: boolean;
  canApproveQualityStandards: boolean;
  canViewQualityReports: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  level: number;
  permissions: RolePermissions;
}

// Settings and Configuration Types
export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
    objectives: boolean;
    kpis: boolean;
    projects: boolean;
    team: boolean;
  };
  theme: {
    mode: 'light' | 'dark';
    primaryColor: string;
    sidebarCollapsed: boolean;
  };
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
}

// Message and Communication Types
export interface Message {
  id: string;
  channelId: string;
  content: string;
  authorId: string;
  authorName: string;
  timestamp: string;
  edited?: boolean;
  editedAt?: string;
  reactions: Array<{
    emoji: string;
    users: string[];
  }>;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private' | 'direct';
  members: string[];
  createdBy: string;
  createdAt: string;
  lastMessage?: Message;
  unreadCount?: number;
}

// Report Types
export interface Report {
  id: string;
  name: string;
  description: string;
  type: 'objective' | 'kpi' | 'project' | 'team' | 'custom';
  filters: Record<string, any>;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
  };
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
  status: 'active' | 'paused' | 'draft';
  lastGenerated?: string;
  createdAt: string;
  createdBy: string;
}

// Support Types
export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'feature' | 'bug' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  userId: string;
  userEmail: string;
  assignedTo?: string;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
  comments: Array<{
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface SupportArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  helpful: number;
  notHelpful: number;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

// Annual Appraisals System Types
export interface AppraisalCycle {
  id: string;
  name: string;
  year: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppraisalTemplate {
  id: string;
  name: string;
  description: string;
  sections: AppraisalSection[];
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppraisalSection {
  id: string;
  title: string;
  description?: string;
  weight: number; // Percentage weight of this section
  questions: AppraisalQuestion[];
  order: number;
}

export interface AppraisalQuestion {
  id: string;
  text: string;
  type: 'rating' | 'text' | 'multiple-choice' | 'yes-no' | 'scale';
  required: boolean;
  // Which review types this question applies to; defaults to all if omitted
  appliesTo?: Array<'self' | 'manager' | 'hr'>;
  options?: string[]; // For multiple-choice questions
  scale?: {
    min: number;
    max: number;
    labels: string[];
  };
  order: number;
}

export interface Appraisal {
  id: string;
  cycleId: string;
  employeeId: string;
  managerId: string;
  templateId: string;
  status: 'draft' | 'self-review' | 'manager-review' | 'hr-review' | 'completed' | 'cancelled';
  selfReview?: AppraisalResponse;
  managerReview?: AppraisalResponse;
  hrReview?: AppraisalResponse;
  goals: AppraisalGoal[];
  competencies: AppraisalCompetency[];
  overallRating?: number;
  comments?: string;
  nextSteps?: string;
  developmentPlan?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  completedAt?: string;
}

export interface AppraisalResponse {
  id: string;
  responses: QuestionResponse[];
  overallComments?: string;
  submittedAt: string;
  submittedBy: string;
}

export interface QuestionResponse {
  questionId: string;
  answer: string | number | string[];
  comments?: string;
}

export interface AppraisalGoal {
  id: string;
  title: string;
  description: string;
  target: string;
  actual: string;
  rating: number; // 1-5 scale
  comments?: string;
  status: 'achieved' | 'partially-achieved' | 'not-achieved';
}

export interface AppraisalCompetency {
  id: string;
  name: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  rating: number; // 1-5 scale
  evidence?: string;
  developmentNeeds?: string;
}

export interface Feedback360 {
  id: string;
  appraisalId: string;
  revieweeId: string;
  reviewerId: string;
  relationship: 'peer' | 'subordinate' | 'customer' | 'other';
  responses: QuestionResponse[];
  status: 'pending' | 'completed';
  submittedAt?: string;
  createdAt: string;
}

export interface AppraisalAnalytics {
  cycleId: string;
  totalAppraisals: number;
  completedAppraisals: number;
  averageRating: number;
  ratingDistribution: {
    [key: string]: number;
  };
  departmentBreakdown: {
    [department: string]: {
      count: number;
      averageRating: number;
    };
  };
  competencyGaps: {
    competency: string;
    averageRating: number;
    improvementNeeded: boolean;
  }[];
}

// Event Types
export interface EventReport {
  id: string;
  eventId: string;
  title: string;
  content: string;
  attendees: string[];
  decisions: string[];
  actionItems: Array<{
    id: string;
    description: string;
    assignee?: string;
    dueDate?: string;
    status: 'pending' | 'completed';
  }>;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  type: 'meeting' | 'deadline' | 'milestone' | 'review' | 'training';
  start: string;
  end: string;
  description: string;
  participants: string[];
  location?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  project?: string;
  resources?: string[];
  report?: EventReport;
}