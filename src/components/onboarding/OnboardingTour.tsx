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
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Step {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  features: string[];
}

const ONBOARDING_STEPS: Step[] = [
  {
    id: 'objectives',
    title: 'Objectives & Key Results',
    description: 'Learn how to set and track your objectives using OKRs',
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
  const [showTour, setShowTour] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Load completed steps from localStorage
    const savedSteps = localStorage.getItem(`onboarding-${user?.id}`);
    if (savedSteps) {
      setCompletedSteps(JSON.parse(savedSteps));
    }
  }, [user]);

  const handleStepComplete = (stepId: string) => {
    const newCompletedSteps = [...completedSteps, stepId];
    setCompletedSteps(newCompletedSteps);
    localStorage.setItem(`onboarding-${user?.id}`, JSON.stringify(newCompletedSteps));
  };

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      navigate(ONBOARDING_STEPS[currentStep + 1].path);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      navigate(ONBOARDING_STEPS[currentStep - 1].path);
    }
  };

  const handleSkip = () => {
    setShowTour(false);
    localStorage.setItem(`onboarding-skipped-${user?.id}`, 'true');
  };

  if (!showTour) return null;

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Help Button */}
      <button
        onClick={() => setShowTour(true)}
        className="absolute -top-16 right-0 p-2 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors"
      >
        <HelpCircle className="h-6 w-6" />
      </button>

      {/* Tour Card */}
      <div className="bg-white rounded-lg shadow-xl w-96 overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-4 text-white">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Platform Tour</h3>
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
            Step {currentStep + 1} of {ONBOARDING_STEPS.length}
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
              disabled={currentStep === ONBOARDING_STEPS.length - 1}
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