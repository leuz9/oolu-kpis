import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Target, 
  PieChart, 
  Users, 
  Briefcase, 
  Settings,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  HelpCircle,
  Book,
  MessageSquare,
  Calendar,
  Building2,
  Link2,
  Database,
  FileCode,
  Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Step {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  features: string[];
  adminOnly?: boolean;
}

const ONBOARDING_STEPS: Step[] = [
  {
    id: 'getting-started',
    title: 'Welcome to OKRFlow',
    description: 'Your complete platform for OKR management and team collaboration',
    path: '/',
    icon: <Book className="h-8 w-8 text-primary-600" />,
    features: [
      'Comprehensive dashboard overview',
      'Quick access to key metrics',
      'Real-time updates and notifications',
      'Personalized workspace'
    ]
  },
  {
    id: 'objectives',
    title: 'Objectives & Key Results',
    description: 'Set and track organizational goals effectively',
    path: '/objectives',
    icon: <Target className="h-8 w-8 text-primary-600" />,
    features: [
      'Create company, department, and individual objectives',
      'Track progress with key results',
      'Align objectives across the organization',
      'Monitor status and completion'
    ]
  },
  {
    id: 'kpis',
    title: 'Key Performance Indicators',
    description: 'Monitor and analyze your KPIs',
    path: '/kpis',
    icon: <PieChart className="h-8 w-8 text-primary-600" />,
    features: [
      'Set up custom KPIs',
      'Track performance metrics',
      'View historical data',
      'Generate KPI reports'
    ]
  },
  {
    id: 'team',
    title: 'Team Management',
    description: 'Manage your team members and roles',
    path: '/team',
    icon: <Users className="h-8 w-8 text-primary-600" />,
    features: [
      'View team structure',
      'Manage roles and permissions',
      'Track member contributions',
      'Handle team assignments'
    ]
  },
  {
    id: 'projects',
    title: 'Project Management',
    description: 'Create and manage your projects',
    path: '/projects',
    icon: <Briefcase className="h-8 w-8 text-primary-600" />,
    features: [
      'Create new projects',
      'Assign team members',
      'Track project progress',
      'Manage project tasks and milestones'
    ]
  },
  {
    id: 'departments',
    title: 'Department Management',
    description: 'Organize and manage departments',
    path: '/departments',
    icon: <Building2 className="h-8 w-8 text-primary-600" />,
    features: [
      'Create and manage departments',
      'Assign department leaders',
      'Track department KPIs',
      'Manage department resources'
    ],
    adminOnly: true
  },
  {
    id: 'planning',
    title: 'Planning & Scheduling',
    description: 'Plan and schedule activities',
    path: '/planning',
    icon: <Calendar className="h-8 w-8 text-primary-600" />,
    features: [
      'Schedule meetings and events',
      'Resource planning',
      'Timeline management',
      'Capacity planning'
    ]
  },
  {
    id: 'messaging',
    title: 'Team Communication',
    description: 'Collaborate with your team',
    path: '/messages',
    icon: <MessageSquare className="h-8 w-8 text-primary-600" />,
    features: [
      'Real-time messaging',
      'Create channels and groups',
      'Share files and resources',
      'Direct messaging'
    ]
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Connect with external services',
    path: '/integrations',
    icon: <Link2 className="h-8 w-8 text-primary-600" />,
    features: [
      'Connect third-party services',
      'API integrations',
      'Data synchronization',
      'Custom webhooks'
    ],
    adminOnly: true
  },
  {
    id: 'api',
    title: 'API Management',
    description: 'Manage API access and keys',
    path: '/api',
    icon: <Database className="h-8 w-8 text-primary-600" />,
    features: [
      'Generate API keys',
      'Monitor API usage',
      'Set rate limits',
      'API documentation'
    ],
    adminOnly: true
  },
  {
    id: 'security',
    title: 'Security Settings',
    description: 'Manage security and access',
    path: '/security',
    icon: <Shield className="h-8 w-8 text-primary-600" />,
    features: [
      'Access control',
      'Security monitoring',
      'Audit logs',
      'Security settings'
    ],
    adminOnly: true
  },
  {
    id: 'support',
    title: 'Support & Help',
    description: 'Get help and support',
    path: '/support',
    icon: <HelpCircle className="h-8 w-8 text-primary-600" />,
    features: [
      'Documentation and guides',
      'Support tickets',
      'Live chat support',
      'Video tutorials'
    ]
  },
  {
    id: 'settings',
    title: 'Settings & Preferences',
    description: 'Configure your account and preferences',
    path: '/settings',
    icon: <Settings className="h-8 w-8 text-primary-600" />,
    features: [
      'Update profile information',
      'Configure notifications',
      'Manage security settings',
      'Customize your experience'
    ]
  }
];

export default function OnboardingTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem(`onboarding-completed-${user.id}`);
    // Check if this is user's first login
    const isFirstLogin = !localStorage.getItem(`has-logged-in-${user.id}`);

    if (isFirstLogin) {
      // Mark that user has logged in
      localStorage.setItem(`has-logged-in-${user.id}`, 'true');
      setShowTour(true);
    } else {
      setShowTour(false);
    }

    // Load completed steps if any
    const savedSteps = localStorage.getItem(`onboarding-steps-${user.id}`);
    if (savedSteps) {
      setCompletedSteps(JSON.parse(savedSteps));
    }
  }, [user]);

  // Filter steps based on user role
  const filteredSteps = ONBOARDING_STEPS.filter(step => 
    !step.adminOnly || user?.isAdmin
  );

  const handleStepComplete = (stepId: string) => {
    if (!user) return;

    const newCompletedSteps = [...completedSteps, stepId];
    setCompletedSteps(newCompletedSteps);
    localStorage.setItem(`onboarding-steps-${user.id}`, JSON.stringify(newCompletedSteps));

    // If all steps are completed, mark onboarding as complete
    if (newCompletedSteps.length === filteredSteps.length) {
      localStorage.setItem(`onboarding-completed-${user.id}`, 'true');
    }
  };

  const handleNext = () => {
    if (currentStep < filteredSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      navigate(filteredSteps[currentStep + 1].path);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      navigate(filteredSteps[currentStep - 1].path);
    }
  };

  const handleSkip = () => {
    if (!user) return;
    
    setShowTour(false);
    // Mark onboarding as completed when skipped
    localStorage.setItem(`onboarding-completed-${user.id}`, 'true');
  };

  const handleShowTour = () => {
    if (!user) return;
    
    setShowTour(true);
    // Remove completed status to allow tour to be shown again
    localStorage.removeItem(`onboarding-completed-${user.id}`);
  };

  if (!showTour) {
    // Only show help button if user has completed onboarding
    const hasCompletedOnboarding = user && localStorage.getItem(`onboarding-completed-${user.id}`);
    
    if (hasCompletedOnboarding) {
      return (
        <button
          onClick={handleShowTour}
          className="fixed bottom-8 right-8 p-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors z-50"
          title="Show Tour Guide"
        >
          <HelpCircle className="h-6 w-6" />
        </button>
      );
    }
    
    return null;
  }

  const currentStepData = filteredSteps[currentStep];
  const progress = ((currentStep + 1) / filteredSteps.length) * 100;

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-4 text-white">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Welcome to OKRFlow!</h3>
            <button onClick={handleSkip} className="text-white/80 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="w-full h-2 bg-white/20 rounded-full">
            <div
              className="h-2 bg-white rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm mt-2 text-white/80">
            Step {currentStep + 1} of {filteredSteps.length}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            {currentStepData.icon}
            <div>
              <h4 className="text-lg font-medium text-gray-900">{currentStepData.title}</h4>
              <p className="text-sm text-gray-500">{currentStepData.description}</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {currentStepData.features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <span className="text-sm text-gray-600">{feature}</span>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            <button
              onClick={() => handleStepComplete(currentStepData.id)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
            >
              {completedSteps.includes(currentStepData.id) ? 'Completed' : 'Mark as Complete'}
            </button>
            <button
              onClick={handleNext}
              disabled={currentStep === filteredSteps.length - 1}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}