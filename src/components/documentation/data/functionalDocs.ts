import { DocSection } from '../types';
import { Book, Target, PieChart } from 'lucide-react';

export const functionalDocs: DocSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Book,
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
    icon: Target,
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
    icon: PieChart,
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