// Add these interfaces to your existing types.ts file

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
  timeFormat: '12h' | '24h';
}