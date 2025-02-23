export interface Filters {
  search: string;
  level: 'all' | 'company' | 'department' | 'individual';
  status: 'all' | 'on-track' | 'at-risk' | 'behind';
  progress: 'all' | '0-25' | '26-50' | '51-75' | '76-100';
  dueDate: 'all' | 'overdue' | 'this-week' | 'this-month' | 'next-month';
  department: string;
  contributor: string;
  hasKpis: 'all' | 'yes' | 'no';
}

export interface SortConfig {
  field: 'title' | 'progress' | 'dueDate' | 'status' | 'level';
  order: 'asc' | 'desc';
}