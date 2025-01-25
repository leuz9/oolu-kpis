import { DocSection } from '../types';
import { Layers } from 'lucide-react';

export const technicalDocs: DocSection[] = [
  {
    id: 'architecture',
    title: 'System Architecture',
    icon: Layers,
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