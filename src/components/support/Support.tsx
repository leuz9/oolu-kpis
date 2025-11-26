import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import { supportService } from '../../services/supportService';
import { useAuth } from '../../contexts/AuthContext';
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
  Filter
} from 'lucide-react';
import type { SupportTicket, SupportArticle } from '../../types';
import TicketForm from './components/TicketForm';
import TicketList from './components/TicketList';
import ArticleView from './components/ArticleView';

export default function Support() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [view, setView] = useState<'articles' | 'tickets'>('tickets');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [articles, setArticles] = useState<SupportArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<SupportArticle | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fetchedTickets, fetchedArticles] = await Promise.all([
        supportService.getTicketsByUser(user!.id),
        supportService.getArticles()
      ]);
      setTickets(fetchedTickets);
      setArticles(fetchedArticles);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load support data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'userEmail'>) => {
    try {
      await supportService.createTicket(ticketData);
      setSuccess('Ticket created successfully');
      setShowTicketForm(false);
      fetchData(); // Refresh tickets list
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError('Failed to create ticket');
    }
  };

  const handleArticleRating = async (articleId: string, helpful: boolean) => {
    try {
      await supportService.updateArticleRating(articleId, helpful);
      setSuccess(helpful ? 'Thank you for your feedback!' : 'Thanks for letting us know!');
      fetchData(); // Refresh articles to update ratings
    } catch (err) {
      console.error('Error rating article:', err);
      setError('Failed to submit rating');
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || ticket.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredArticles = articles.filter(article => {
    const matchesSearch = 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || article.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex-1 w-full ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out p-3 sm:p-4 lg:p-6`}>
        <div className="w-full">
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
                  onClick={() => setShowTicketForm(true)}
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
                roland.faye@ignite.solar
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
                +221 (775) 83-0136
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
                Ask roland.faye@ignite.solar in Google Chat
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
                  <option value="technical">Technical Support</option>
                  <option value="account">Account Issues</option>
                  <option value="feature">Feature Requests</option>
                  <option value="billing">Billing</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : view === 'tickets' ? (
            <TicketList
              tickets={filteredTickets}
              onTicketClick={setSelectedTicket}
            />
          ) : selectedArticle ? (
            <ArticleView
              article={selectedArticle}
              onBack={() => setSelectedArticle(null)}
              onRate={(helpful) => handleArticleRating(selectedArticle.id, helpful)}
              userRating={selectedArticle.ratings[user!.id]}
            />
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredArticles.map((article) => (
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
                    <p className="mt-2 text-sm text-gray-500">{article.content.substring(0, 200)}...</p>
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
                      <button
                        onClick={() => setSelectedArticle(article)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Read More →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showTicketForm && (
        <TicketForm
          onSubmit={handleCreateTicket}
          onClose={() => setShowTicketForm(false)}
        />
      )}
    </div>
  );
}