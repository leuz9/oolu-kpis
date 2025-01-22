export interface Objective {
  id: string;
  title: string;
  description: string;
  progress: number;
  keyResults: KeyResult[];
  owner: string;
  dueDate: string;
  status: 'on-track' | 'at-risk' | 'behind';
}

export interface KeyResult {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  progress: number;
}

export interface KPI {
  id: string;
  name: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  category: string;
  lastUpdated: string;
}