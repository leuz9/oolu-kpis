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
  Building2,
  Search,
  ArrowRight,
  ExternalLink,
  Download,
  ThumbsUp,
  ThumbsDown
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
      subsections?: Array<{
        title: string;
        content: string;
      }>;
    }>;
    examples?: Array<{
      title: string;
      description: string;
      code?: string;
    }>;
    relatedTopics?: string[];
  };
}

const functionalDocs: DocSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: <Book className="h-6 w-6" />,
    content: {
      overview: 'Welcome to OKRFlow! This comprehensive guide will help you get started with managing your organization\'s objectives and key results effectively.',
      sections: [
        {
          title: 'Platform Overview',
          content: 'OKRFlow is a comprehensive platform for managing Objectives and Key Results (OKRs), team performance, and project tracking. The platform integrates OKR management, KPI tracking, team collaboration, and project management in one unified solution.',
          subsections: [
            {
              title: 'Key Features',
              content: '• Objective Hierarchy Management\n• KPI Tracking and Analytics\n• Team Collaboration Tools\n• Real-time Progress Updates\n• Performance Dashboards'
            },
            {
              title: 'Benefits',
              content: '• Improved Goal Alignment\n• Enhanced Transparency\n• Better Performance Tracking\n• Increased Accountability\n• Data-Driven Decision Making'
            }
          ]
        },
        {
          title: 'First Steps',
          content: 'After logging in, you\'ll be greeted with your personalized dashboard showing key metrics and recent activities. The sidebar contains all main features: Objectives, KPIs, Team, Projects, and Settings.',
          subsections: [
            {
              title: 'Quick Setup Guide',
              content: '1. Set up your profile\n2. Create your first objective\n3. Add key results\n4. Invite team members\n5. Start tracking progress'
            }
          ]
        }
      ],
      examples: [
        {
          title: 'Creating Your First Objective',
          description: 'Learn how to create and track your first objective',
          code: `1. Click "New Objective" button
2. Fill in objective details:
   - Title
   - Description
   - Timeline
   - Key Results
3. Assign team members
4. Set tracking metrics`
        }
      ],
      relatedTopics: ['objectives', 'kpis', 'team-management']
    }
  },
  {
    id: 'objectives',
    title: 'Objectives Management',
    icon: <Target className="h-6 w-6" />,
    content: {
      overview: 'Learn how to create, manage, and track objectives effectively across your organization.',
      sections: [
        {
          title: 'Objective Hierarchy',
          content: 'OKRFlow supports a three-level objective hierarchy: Company, Department, and Individual objectives. This structure ensures proper alignment and cascading of goals throughout the organization.',
          subsections: [
            {
              title: 'Company Objectives',
              content: 'Top-level strategic goals that define organizational direction'
            },
            {
              title: 'Department Objectives',
              content: 'Tactical objectives that support company goals'
            },
            {
              title: 'Individual Objectives',
              content: 'Personal objectives aligned with department and company goals'
            }
          ]
        },
        {
          title: 'Creating Objectives',
          content: 'Create objectives at any level with clear descriptions, timelines, and measurable key results. Link objectives to relevant KPIs and assign team members for better tracking and accountability.',
          subsections: [
            {
              title: 'Best Practices',
              content: '• Make objectives specific and measurable\n• Set realistic timelines\n• Align with higher-level objectives\n• Assign clear ownership\n• Link relevant KPIs'
            }
          ]
        },
        {
          title: 'Progress Tracking',
          content: 'Monitor objective progress through key results, linked KPIs, and regular check-ins. The system automatically calculates progress based on completion of key results and KPI achievements.',
          subsections: [
            {
              title: 'Progress Calculation',
              content: 'Progress is calculated using:\n• Key Result completion\n• KPI achievement\n• Manual updates\n• Child objective progress'
            }
          ]
        }
      ],
      examples: [
        {
          title: 'Example Company Objective',
          description: 'Increase Market Share',
          code: `Objective: Increase market share by 15%
Key Results:
1. Acquire 1000 new customers
2. Increase customer retention to 95%
3. Launch in 2 new markets
KPIs:
- Customer Acquisition Rate
- Customer Retention Rate
- Market Penetration Rate`
        }
      ],
      relatedTopics: ['kpis', 'team-management', 'progress-tracking']
    }
  },
  {
    id: 'kpis',
    title: 'KPI Dashboard',
    icon: <PieChart className="h-6 w-6" />,
    content: {
      overview: 'Monitor and manage Key Performance Indicators across your organization with real-time tracking and analytics.',
      sections: [
        {
          title: 'KPI Management',
          content: 'Create, track, and analyze KPIs with specific targets, measurement frequencies, and ownership assignments.',
          subsections: [
            {
              title: 'KPI Types',
              content: '• Financial KPIs\n• Customer KPIs\n• Process KPIs\n• People KPIs'
            },
            {
              title: 'Measurement Frequencies',
              content: '• Daily\n• Weekly\n• Monthly\n• Quarterly'
            }
          ]
        },
        {
          title: 'Performance Tracking',
          content: 'Track KPI performance over time with historical data, trends, and automated alerts for deviations from targets.',
          subsections: [
            {
              title: 'Tracking Features',
              content: '• Real-time updates\n• Trend analysis\n• Performance alerts\n• Historical comparisons'
            }
          ]
        }
      ],
      examples: [
        {
          title: 'Setting Up a KPI',
          description: 'Example of creating a customer satisfaction KPI',
          code: `KPI: Customer Satisfaction Score
Target: 90%
Frequency: Monthly
Measurement: Survey Results
Alert Threshold: <80%`
        }
      ],
      relatedTopics: ['objectives', 'analytics', 'reporting']
    }
  }
];

const technicalDocs: DocSection[] = [
  {
    id: 'architecture',
    title: 'System Architecture',
    icon: <Layers className="h-6 w-6" />,
    content: {
      overview: 'Technical overview of the OKRFlow platform architecture and components.',
      sections: [
        {
          title: 'Frontend Architecture',
          content: 'Built with React and TypeScript, using Vite as the build tool. The UI is styled with Tailwind CSS and follows a component-based architecture with proper state management.',
          subsections: [
            {
              title: 'Key Technologies',
              content: '• React 18\n• TypeScript\n• Vite\n• Tailwind CSS\n• Lucide Icons'
            },
            {
              title: 'State Management',
              content: '• React Context for global state\n• Local state with hooks\n• Real-time updates'
            }
          ]
        },
        {
          title: 'Backend Services',
          content: 'Firebase provides the backend infrastructure, including authentication, real-time database, and cloud functions for business logic.',
          subsections: [
            {
              title: 'Firebase Services',
              content: '• Authentication\n• Firestore Database\n• Cloud Functions\n• Storage\n• Analytics'
            }
          ]
        }
      ],
      examples: [
        {
          title: 'Data Flow Example',
          description: 'How data flows through the system',
          code: `User Action → React Component
→ Service Layer
→ Firebase SDK
→ Cloud Functions
→ Firestore
→ Real-time Updates`
        }
      ],
      relatedTopics: ['security', 'api', 'performance']
    }
  }
];

export default function Documentation() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'functional' | 'technical'>('functional');
  const [selectedDoc, setSelectedDoc] = useState<DocSection>(functionalDocs[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [helpfulDocs, setHelpfulDocs] = useState<Set<string>>(new Set());
  const [unhelpfulDocs, setUnhelpfulDocs] = useState<Set<string>>(new Set());

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term) {
      setSelectedDoc(activeTab === 'functional' ? functionalDocs[0] : technicalDocs[0]);
      return;
    }

    const docs = activeTab === 'functional' ? functionalDocs : technicalDocs;
    const matchingDoc = docs.find(doc => 
      doc.title.toLowerCase().includes(term.toLowerCase()) ||
      doc.content.overview.toLowerCase().includes(term.toLowerCase()) ||
      doc.content.sections.some(section => 
        section.title.toLowerCase().includes(term.toLowerCase()) ||
        section.content.toLowerCase().includes(term.toLowerCase())
      )
    );

    if (matchingDoc) {
      setSelectedDoc(matchingDoc);
    }
  };

  const handleFeedback = (docId: string, helpful: boolean) => {
    if (helpful) {
      setHelpfulDocs(prev => new Set(prev).add(docId));
      setUnhelpfulDocs(prev => {
        const newSet = new Set(prev);
        newSet.delete(docId);
        return newSet;
      });
    } else {
      setUnhelpfulDocs(prev => new Set(prev).add(docId));
      setHelpfulDocs(prev => {
        const newSet = new Set(prev);
        newSet.delete(docId);
        return newSet;
      });
    }
  };

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
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search documentation..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <a
                href="#"
                className="flex items-center text-primary-600 hover:text-primary-700"
              >
                <Download className="h-5 w-5 mr-2" />
                Download PDF
              </a>
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
                User Guide
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
                Technical Guide
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
                  <div className="bg-gray-50 border-l-4 border-primary-500 p-4 rounded mb-8">
                    <p className="text-gray-600">
                      {selectedDoc.content.overview}
                    </p>
                  </div>

                  <div className="space-y-8">
                    {selectedDoc.content.sections.map((section, index) => (
                      <div key={index}>
                        <h3 className="text-xl font-medium text-gray-900 mb-4">
                          {section.title}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {section.content}
                        </p>
                        {section.subsections && (
                          <div className="ml-6 space-y-4 mt-4">
                            {section.subsections.map((subsection, subIndex) => (
                              <div key={subIndex}>
                                <h4 className="text-lg font-medium text-gray-900 mb-2">
                                  {subsection.title}
                                </h4>
                                <p className="text-gray-600 whitespace-pre-line">
                                  {subsection.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {selectedDoc.content.examples && (
                      <div className="mt-8">
                        <h3 className="text-xl font-medium text-gray-900 mb-4">
                          Examples
                        </h3>
                        <div className="space-y-6">
                          {selectedDoc.content.examples.map((example, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="text-lg font-medium text-gray-900 mb-2">
                                {example.title}
                              </h4>
                              <p className="text-gray-600 mb-4">{example.description}</p>
                              {example.code && (
                                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                                  <code>{example.code}</code>
                                </pre>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedDoc.content.relatedTopics && (
                      <div className="mt-8 pt-8 border-t border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Related Topics
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedDoc.content.relatedTopics.map((topic, index) => (
                            <a
                              key={index}
                              href={`#${topic}`}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 hover:bg-gray-200"
                            >
                              {topic}
                              <ArrowRight className="h-4 w-4 ml-1" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Feedback Section */}
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Was this documentation helpful?</h4>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleFeedback(selectedDoc.id, true)}
                        className={`flex items-center px-4 py-2 rounded-md text-sm ${
                          helpfulDocs.has(selectedDoc.id)
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Yes
                      </button>
                      <button
                        onClick={() => handleFeedback(selectedDoc.id, false)}
                        className={`flex items-center px-4 py-2 rounded-md text-sm ${
                          unhelpfulDocs.has(selectedDoc.id)
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        No
                      </button>
                    </div>
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