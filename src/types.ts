// Add these types to your existing types.ts file

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  features: string[];
  adminOnly?: boolean;
}

export interface OnboardingProgress {
  userId: string;
  completedSteps: string[];
  lastStep?: string;
  startedAt: string;
  completedAt?: string;
  dismissed?: boolean;
}