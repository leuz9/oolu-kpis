export interface User {
  id: string;
  email: string;
  displayName?: string;
  department?: string;
  role?: string;
  photoURL?: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  managerId: string;
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  progress: number;
  keyResults: KeyResult[];
  owner: string;
  dueDate: string;
  status: 'on-track' | 'at-risk' | 'behind';
  level: 'company' | 'department' | 'individual';
  parentId?: string; // Reference to parent objective (company -> department -> individual)
  departmentId?: string;
  assigneeId?: string;
  quarter: string; // e.g., "2024-Q1"
  year: number;
  weight: number; // Importance weight (0-1)
  contributors: string[]; // List of user IDs contributing to this objective
  alignedTo?: string[]; // List of objective IDs this objective aligns with
}

export interface KeyResult {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  progress: number;
  startValue?: number; // Initial value for better progress tracking
  dueDate: string;
  checkIns: KeyResultCheckIn[];
}

export interface KeyResultCheckIn {
  id: string;
  date: string;
  value: number;
  note?: string;
  userId: string;
}

export interface KPI {
  id: string;
  name: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  category: string;
  lastUpdated: string;
  departmentId?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  history: KPIHistory[];
}

export interface KPIHistory {
  date: string;
  value: number;
}