import React, { useState } from 'react';
import Sidebar from '../Sidebar';
import { 
  HelpCircle,
  Book,
  MessageSquare,
  FileText,
  ExternalLink,
  Search,
  ThumbsUp,
  ThumbsDown,
  Mail,
  Phone,
  Video,
  AlertTriangle,
  CheckCircle2,
  X,
  Plus,
  Filter,
  Clock,
  Plus as PlusIcon,
  Filter as FilterIcon
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  helpful: number;
  notHelpful: number;
  lastUpdated: string;
  tags: string[];
}

interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: string;
  updatedAt: string;
  assignee?: string;
  description: string;
}

const sampleArticles: Article[] = [
  {
    id: '1',
    title: 'Getting Started with OKRFlow',
    category: 'Getting Started',
    content: 'Learn how to set up and start using OKRFlow effectively...',
    helpful: 145,
    notHelpful: 12,
    lastUpdated: '2024-03-15T10:30:00Z',
    tags: ['setup', 'basics', 'introduction']
  },
  {
    id: '2',
    title: 'Managing Teams and Permissions',
    category: 'Administration',
    content: 'Comprehensive guide to team management and permission settings...',
    helpful: 89,
    notHelpful: 5,
    lastUpdated: '2024-03-14T15:45:00Z',
    tags: ['teams', 'permissions', 'admin']
  },
  {
    id: '3',
    title: 'Creating and Tracking OKRs',
    category: 'Features',
    content: 'Step-by-step guide to creating and monitoring OKRs...',
    helpful: 234,
    notHelpful: 18,
    lastUpdated: '2024-03-13T09:20:00Z',
    tags: ['okrs', 'objectives', 'tracking']
  }
];

const sampleTickets: Ticket[] = [
  {
    id: 'TICKET-001',
    subject: 'Cannot access dashboard',
    status: 'open',
    priority: 'high',
    category: 'Access Issues',
    createdAt: '2024-03-15T10:30:00Z',
    updatedAt: '2024-03-15T10:30:00Z',
    description: 'Getting error 403 when trying to access the dashboard...'
  },
  {
    id: 'TICKET-002',
    subject: 'Need help with OKR setup',
    status: 'in-progress',
    priority: 'medium',
    category: 'General Support',
    createdAt: '2024-03-14T15:45:00Z',
    updatedAt: '2024-03-15T09:15:00Z',
    assignee: 'John Smith',
    description: 'Need assistance with setting up department OKRs...'
  },
  {
    id: 'TICKET-003',
    subject: 'Feature request: Export to PDF',
    status: 'resolved',
    priority: 'low',
    category: 'Feature Request',
    createdAt: '2024-03-13T09:20:00Z',
    updatedAt: '2024-03-14T14:30:00Z',
    assignee: 'Sarah Johnson',
    description: 'Would like to request PDF export functionality...'
  }
];

export default function Support() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [view, setView] = useState<'articles' | 'tickets'>('articles');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const getStatusColor = (status: Ticket['status']) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
    }
  };

  const handleArticleRating = (articleId: string, helpful: boolean) => {
    // In a real app, this would make an API call
    setArticles(prev => prev.map(article => {
      if (article.id === articleId) {
        return {
          ...article,
          helpful: helpful ? article.helpful + 1 : article.helpful,
          notHelpful: !helpful ? article.notHelpful + 1 : article.notHelpful
        };
      }
      return article;
    }));
    setSuccess(helpful ? 'Thank you for your feedback!' : 'Thanks for letting us know!');
    setTimeout(() => setSuccess(null), 3000);
  };

  const NewTicketForm = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Create Support Ticket</h3>
          <button
            onClick={() => setShowNewTicketForm(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Brief description of the issue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
              <option value="access">Access Issues</option>
              <option value="technical">Technical Support</option>
              <option value="feature">Feature Request</option>
              <option value="billing">Billing</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Detailed description of your issue..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Attachments</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                  >
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowNewTicketForm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
            >
              Create Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out p-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Support Center</h1>
              <p className="mt-1 text-sm text-gray-500">
                Get help and support for OKRFlow
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setView('articles')}
                  className={`px-4 py-2 text-sm font-medium ${
                    view === 'articles'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } border border-gray-300 rounded-l-md`}
                >
                  <Book className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setView('tickets')}
                  className={`px-4 py-2 text-sm font-medium ${
                    view === 'tickets'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } border border-l-0 border-gray-300 rounded-r-md`}
                >
                  <MessageSquare className="h-5 w-5" />
                </button>
              </div>
              {view === 'tickets' && (
                <button
                  onClick={() => setShowNewTicketForm(true)}
                  className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  New Ticket
                </button>
              )}
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4 rounded">
              <div className="flex">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Contact */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <Mail className="h-6 w-6 text-primary-600" />
                <h3 className="ml-3 text-lg font-medium text-gray-900">Email Support</h3>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Get help via email within 24 hours
              </p>
              <a
                href="mailto:support@okrflow.com"
                className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700"
              >
                support@okrflow.com
                <ExternalLink className="h-4 w-4 ml-1" />
              </a>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <Phone className="h-6 w-6 text-primary-600" />
                <h3 className="ml-3 text-lg font-medium text-gray-900">Phone Support</h3>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Available Monday to Friday, 9am-5pm
              </p>
              <a
                href="tel:+1234567890"
                className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700"
              >
                +1 (234) 567-890
                <ExternalLink className="h-4 w-4 ml-1" />
              </a>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <Video className="h-6 w-6 text-primary-600" />
                <h3 className="ml-3 text-lg font-medium text-gray-900">Video Chat</h3>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Schedule a video call with our team
              </p>
              <button className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700">
                Schedule Now
                <ExternalLink className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={view === 'articles' ? "Search articles..." : "Search tickets..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="all">All Categories</option>
                  <option value="getting-started">Getting Started</option>
                  <option value="features">Features</option>
                  <option value="administration">Administration</option>
                  <option value="troubleshooting">Troubleshooting</option>
                </select>
              </div>
            </div>
          </div>

          {view === 'articles' ? (
            <div className="grid grid-cols-1 gap-6">
              {sampleArticles.map((article) => (
                <div
                  key={article.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">{article.title}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {article.category}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">{article.content}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleArticleRating(article.id, true)}
                          className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {article.helpful}
                        </button>
                        <button
                          onClick={() => handleArticleRating(article.id, false)}
                          className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                        >
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          {article.notHelpful}
                        </button>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        Updated {new Date(article.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {sampleTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">{ticket.subject}</h3>
                          <span className="ml-2 text-sm text-gray-500">#{ticket.id}</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{ticket.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>Category: {ticket.category}</span>
                        {ticket.assignee && <span>Assignee: {ticket.assignee}</span>}
                      </div>
                      <div className="flex items-center space-x-4">
                        <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                        <span>Updated: {new Date(ticket.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showNewTicketForm && <NewTicketForm />}
    </div>
  );
}