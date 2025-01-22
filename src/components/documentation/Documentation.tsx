import React, { useState } from 'react';
import Sidebar from '../Sidebar';
import { 
  Book, 
  Code, 
  Users, 
  Target, 
  PieChart, 
  Briefcase, 
  Settings, 
  FileText, 
  Server, 
  Database, 
  Shield, 
  Workflow, 
  GitBranch, 
  Layers,
  MessageSquare,
  Link2,
  HelpCircle,
  Calendar,
  Building2
} from 'lucide-react';

interface DocSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: {
    overview: string;
    sections: Array<{
      title: string;
      content: string;
    }>;
  };
}

const functionalDocs: DocSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: <Book className="h-6 w-6" />,
    content: {
      overview: 'Welcome to OKRFlow! This guide will help you get started with the platform.',
      sections: [
        {
          title: 'Platform Overview',
          content: 'OKRFlow is a comprehensive platform for managing Objectives and Key Results (OKRs), team performance, and project tracking. The platform integrates OKR management, KPI tracking, team collaboration, and project management in one unified solution.'
        },
        {
          title: 'First Steps',
          content: 'After logging in, you\'ll be greeted with the dashboard showing key metrics and recent activities. The sidebar contains all main features: Objectives, KPIs, Team, Projects, and Settings.'
        }
      ]
    }
  },
  {
    id: 'objectives',
    title: 'Objectives Management',
    icon: <Target className="h-6 w-6" />,
    content: {
      overview: 'Learn how to create and manage objectives and key results.',
      sections: [
        {
          title: 'Creating Objectives',
          content: 'Objectives can be created at company, department, or individual levels. Each objective should be specific, measurable, and time-bound. You can add multiple key results to track progress.'
        },
        {
          title: 'Tracking Progress',
          content: 'Progress is automatically calculated based on key results achievement. Regular check-ins help keep objectives on track and visible to all stakeholders.'
        }
      ]
    }
  },
  {
    id: 'kpis',
    title: 'KPI Dashboard',
    icon: <PieChart className="h-6 w-6" />,
    content: {
      overview: 'Monitor and manage Key Performance Indicators across your organization.',
      sections: [
        {
          title: 'KPI Creation',
          content: 'Create KPIs with specific targets, measurement frequencies, and ownership. KPIs can be linked to objectives and departments.'
        },
        {
          title: 'Performance Tracking',
          content: 'Track KPI performance over time with historical data, trends, and automated alerts for deviations from targets.'
        }
      ]
    }
  },
  {
    id: 'team',
    title: 'Team Management',
    icon: <Users className="h-6 w-6" />,
    content: {
      overview: 'Manage team members, roles, and responsibilities.',
      sections: [
        {
          title: 'Team Structure',
          content: 'Organize team members by departments, assign roles and responsibilities, and manage reporting relationships.'
        },
        {
          title: 'Performance Management',
          content: 'Track individual and team performance, conduct reviews, and align personal objectives with company goals.'
        }
      ]
    }
  },
  {
    id: 'projects',
    title: 'Project Management',
    icon: <Briefcase className="h-6 w-6" />,
    content: {
      overview: 'Create and manage projects aligned with objectives.',
      sections: [
        {
          title: 'Project Creation',
          content: 'Set up projects with clear goals, timelines, and resource allocation. Link projects to strategic objectives and assign team members.'
        },
        {
          title: 'Progress Tracking',
          content: 'Monitor project progress, manage tasks, and track milestones. Generate reports and identify potential risks early.'
        }
      ]
    }
  },
  {
    id: 'departments',
    title: 'Department Management',
    icon: <Building2 className="h-6 w-6" />,
    content: {
      overview: 'Manage organizational departments and their operations.',
      sections: [
        {
          title: 'Department Structure',
          content: 'Create and manage departments, assign managers, and define team structures. Track department-specific KPIs and objectives.'
        },
        {
          title: 'Resource Management',
          content: 'Manage department budgets, headcount, and resource allocation. Monitor department performance and efficiency metrics.'
        }
      ]
    }
  },
  {
    id: 'planning',
    title: 'Planning & Scheduling',
    icon: <Calendar className="h-6 w-6" />,
    content: {
      overview: 'Plan and schedule organizational activities and resources.',
      sections: [
        {
          title: 'Event Management',
          content: 'Schedule meetings, deadlines, and milestones. Manage team calendars and resource availability.'
        },
        {
          title: 'Resource Planning',
          content: 'Allocate resources efficiently, manage room bookings, and track equipment usage.'
        }
      ]
    }
  },
  {
    id: 'messaging',
    title: 'Team Communication',
    icon: <MessageSquare className="h-6 w-6" />,
    content: {
      overview: 'Internal communication and collaboration tools.',
      sections: [
        {
          title: 'Channels & Direct Messages',
          content: 'Create topic-based channels or direct message conversations. Share files and collaborate in real-time.'
        },
        {
          title: 'Notifications',
          content: 'Configure message notifications and stay updated on important conversations and mentions.'
        }
      ]
    }
  },
  {
    id: 'support',
    title: 'Support System',
    icon: <HelpCircle className="h-6 w-6" />,
    content: {
      overview: 'Access help and support resources.',
      sections: [
        {
          title: 'Knowledge Base',
          content: 'Browse through documentation, guides, and FAQs. Rate articles and provide feedback.'
        },
        {
          title: 'Support Tickets',
          content: 'Create and track support tickets. Get assistance from our support team through various channels.'
        }
      ]
    }
  }
];

const technicalDocs: DocSection[] = [
  {
    id: 'architecture',
    title: 'System Architecture',
    icon: <Layers className="h-6 w-6" />,
    content: {
      overview: 'Technical overview of the platform architecture.',
      sections: [
        {
          title: 'Frontend Architecture',
          content: 'Built with React and TypeScript, using Vite as the build tool. The UI is styled with Tailwind CSS and follows a component-based architecture with proper state management.'
        },
        {
          title: 'Backend Services',
          content: 'Firebase provides the backend infrastructure, including authentication, real-time database, and cloud functions for business logic.'
        }
      ]
    }
  },
  {
    id: 'authentication',
    title: 'Authentication & Security',
    icon: <Shield className="h-6 w-6" />,
    content: {
      overview: 'Security implementation details and authentication flow.',
      sections: [
        {
          title: 'Authentication Flow',
          content: 'Firebase Authentication handles user authentication with email/password and role-based access control (RBAC).'
        },
        {
          title: 'Security Rules',
          content: 'Firestore security rules enforce data access control and validation at the database level.'
        }
      ]
    }
  },
  {
    id: 'database',
    title: 'Database Structure',
    icon: <Database className="h-6 w-6" />,
    content: {
      overview: 'Database schema and data relationships.',
      sections: [
        {
          title: 'Collections',
          content: 'Main collections include users, objectives, kpis, projects, team_members, messages, and departments. Each collection follows a specific schema with proper indexing.'
        },
        {
          title: 'Data Relationships',
          content: 'Documents are linked using references, maintaining data integrity and enabling efficient queries.'
        }
      ]
    }
  },
  {
    id: 'api',
    title: 'API Documentation',
    icon: <Code className="h-6 w-6" />,
    content: {
      overview: 'API endpoints and integration details.',
      sections: [
        {
          title: 'API Management',
          content: 'Comprehensive API key management system with environment-specific keys, usage tracking, and access control.'
        },
        {
          title: 'Endpoints',
          content: 'RESTful API endpoints for all major functionalities including objectives, KPIs, team management, and messaging.'
        }
      ]
    }
  },
  {
    id: 'integrations',
    title: 'External Integrations',
    icon: <Link2 className="h-6 w-6" />,
    content: {
      overview: 'Integration capabilities and third-party services.',
      sections: [
        {
          title: 'Available Integrations',
          content: 'Support for various external services including databases, authentication providers, analytics tools, and storage solutions.'
        },
        {
          title: 'Integration Management',
          content: 'Tools for managing integration configurations, monitoring performance, and troubleshooting connection issues.'
        }
      ]
    }
  },
  {
    id: 'deployment',
    title: 'Deployment',
    icon: <Server className="h-6 w-6" />,
    content: {
      overview: 'Deployment process and environment configuration.',
      sections: [
        {
          title: 'Build Process',
          content: 'Vite handles the build process, optimizing assets and generating production-ready code.'
        },
        {
          title: 'Environment Setup',
          content: 'Environment variables control configuration for different deployment environments (development, staging, production).'
        }
      ]
    }
  },
  {
    id: 'version-control',
    title: 'Version Control',
    icon: <GitBranch className="h-6 w-6" />,
    content: {
      overview: 'Version control and release management.',
      sections: [
        {
          title: 'Branching Strategy',
          content: 'The project follows a Git Flow branching strategy with feature branches, development, and main branches.'
        },
        {
          title: 'Release Process',
          content: 'Releases are tagged and documented with changelogs, following semantic versioning.'
        }
      ]
    }
  }
];

export default function Documentation() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'functional' | 'technical'>('functional');
  const [selectedDoc, setSelectedDoc] = useState<DocSection>(functionalDocs[0]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out p-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Documentation</h1>
              <p className="mt-1 text-sm text-gray-500">
                Platform documentation and technical guides
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => setActiveTab('functional')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'functional'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Functional Documentation
              </div>
            </button>
            <button
              onClick={() => setActiveTab('technical')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'technical'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <Code className="h-5 w-5 mr-2" />
                Technical Documentation
              </div>
            </button>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Documentation Navigation */}
            <div className="col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {activeTab === 'functional' ? 'User Guide' : 'Technical Guide'}
                </h3>
                <nav className="space-y-2">
                  {(activeTab === 'functional' ? functionalDocs : technicalDocs).map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={`w-full flex items-center px-3 py-2 text-sm rounded-lg ${
                        selectedDoc.id === doc.id
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {doc.icon}
                      <span className="ml-3">{doc.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Documentation Content */}
            <div className="col-span-9">
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="flex items-center mb-6">
                  {selectedDoc.icon}
                  <h2 className="text-2xl font-bold text-gray-900 ml-3">
                    {selectedDoc.title}
                  </h2>
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-600 mb-8">
                    {selectedDoc.content.overview}
                  </p>

                  <div className="space-y-8">
                    {selectedDoc.content.sections.map((section, index) => (
                      <div key={index}>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">
                          {section.title}
                        </h3>
                        <p className="text-gray-600">
                          {section.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}