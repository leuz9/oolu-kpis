// Add new type for event reports
export interface EventReport {
  id: string;
  eventId: string;
  title: string;
  content: string;
  attendees: string[];
  decisions: string[];
  actionItems: Array<{
    id: string;
    description: string;
    assignee?: string;
    dueDate?: string;
    status: 'pending' | 'completed';
  }>;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Update Event interface to include report
export interface Event {
  id: string;
  title: string;
  type: 'meeting' | 'deadline' | 'milestone' | 'review' | 'training';
  start: string;
  end: string;
  description: string;
  participants: string[];
  location?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  project?: string;
  resources?: string[];
  report?: EventReport;
}