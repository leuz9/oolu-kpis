import { DivideIcon as LucideIcon } from 'lucide-react';

export interface DocSection {
  id: string;
  title: string;
  icon: LucideIcon;
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

export type DocTab = 'functional' | 'technical';