import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import { planningService } from '../../services/planningService';
import { 
  Calendar,
  Clock,
  Users,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  AlertTriangle,
  CheckCircle2,
  X,
  Filter,
  Search,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Users as UsersIcon,
  Briefcase,
  Target,
  Trash2,
  List,
  LayoutGrid
} from 'lucide-react';
import type { Event, Resource } from '../../types';
import CalendarView from './components/CalendarView';

const sampleEvents: Event[] = [
  {
    id: '1',
    title: 'Project Kickoff Meeting',
    type: 'meeting',
    start: '2024-03-20T10:00:00',
    end: '2024-03-20T11:30:00',
    description: 'Initial meeting to discuss project objectives and timeline',
    participants: ['John Doe', 'Sarah Smith', 'Mike Johnson'],
    location: 'Conference Room A',
    status: 'scheduled',
    priority: 'high',
    project: 'Mobile App Development'
  },
  {
    id: '2',
    title: 'Sprint Review',
    type: 'review',
    start: '2024-03-21T14:00:00',
    end: '2024-03-21T15:00:00',
    description: 'Review sprint deliverables and plan next sprint',
    participants: ['Development Team', 'Product Owner'],
    status: 'scheduled',
    priority: 'medium',
    project: 'Mobile App Development'
  },
  {
    id: '3',
    title: 'Security Training',
    type: 'training',
    start: '2024-03-22T09:00:00',
    end: '2024-03-22T12:00:00',
    description: 'Mandatory security awareness training',
    participants: ['All Staff'],
    location: 'Training Room',
    status: 'scheduled',
    priority: 'medium'
  }
];

const sampleResources: Resource[] = [
  {
    id: '1',
    name: 'Conference Room A',
    type: 'room',
    availability: [
      { start: '2024-03-20T09:00:00', end: '2024-03-20T17:00:00' }
    ],
    capacity: 20,
    assigned: 8,
    status: 'partially-booked'
  },
  {
    id: '2',
    name: 'Development Team',
    type: 'employee',
    availability: [
      { start: '2024-03-20T09:00:00', end: '2024-03-20T17:00:00' }
    ],
    capacity: 10,
    assigned: 7,
    status: 'partially-booked'
  },
  {
    id: '3',
    name: 'Projector Equipment',
    type: 'equipment',
    availability: [
      { start: '2024-03-20T09:00:00', end: '2024-03-20T17:00:00' }
    ],
    capacity: 1,
    assigned: 0,
    status: 'available'
  }
];

const NewEventForm = ({ onClose, onSuccess, onError }: { 
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}) => {
  const [formData, setFormData] = useState<Omit<Event, 'id'>>({
    title: '',
    type: 'meeting',
    start: '',
    end: '',
    description: '',
    participants: [],
    status: 'scheduled',
    priority: 'medium',
    location: '',
    resources: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await planningService.addEvent(formData);
      onSuccess('Event created successfully');
      onClose();
    } catch (err) {
      onError('Failed to create event. Please try again.');
      console.error('Error creating event:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Create Event</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Event title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Event description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date & Time</label>
              <input
                type="datetime-local"
                required
                value={formData.start}
                onChange={e => setFormData({ ...formData, start: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date & Time</label>
              <input
                type="datetime-local"
                required
                value={formData.end}
                onChange={e => setFormData({ ...formData, end: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as Event['type'] })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="meeting">Meeting</option>
                <option value="deadline">Deadline</option>
                <option value="milestone">Milestone</option>
                <option value="review">Review</option>
                <option value="training">Training</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as Event['priority'] })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Event location"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Planning() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [events, setEvents] = useState<Event[]>(sampleEvents);
  const [resources, setResources] = useState<Resource[]>(sampleResources);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterType, setFilterType] = useState<'all' | Event['type']>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [fetchedEvents, fetchedResources] = await Promise.all([
        planningService.getEvents(),
        planningService.getResources()
      ]);
      setEvents(fetchedEvents);
      setResources(fetchedResources);
    } catch (err) {
      setError('Failed to load data. Please try again later.');
      console.error('Error fetching data:', err);
    }
  };

  const getEventTypeIcon = (type: Event['type']) => {
    switch (type) {
      case 'meeting':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'deadline':
        return <Clock className="h-5 w-5 text-red-500" />;
      case 'milestone':
        return <Target className="h-5 w-5 text-green-500" />;
      case 'review':
        return <CheckCircle2 className="h-5 w-5 text-purple-500" />;
      case 'training':
        return <Briefcase className="h-5 w-5 text-orange-500" />;
    }
  };

  const getStatusColor = (status: Event['status'] | Resource['status']) => {
    switch (status) {
      case 'scheduled':
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
      case 'partially-booked':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
      case 'fully-booked':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
      case 'maintenance':
        return 'bg-red-100 text-red-800';
    }
  };

  const getPriorityColor = (priority: Event['priority']) => {
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

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await planningService.deleteEvent(eventId);
      setSuccess('Event deleted successfully');
      fetchData(); // Refresh events list
    } catch (err) {
      setError('Failed to delete event. Please try again.');
      console.error('Error deleting event:', err);
    }
  };

  const handleUpdateEventStatus = async (eventId: string, status: Event['status']) => {
    try {
      await planningService.updateEvent(eventId, { status });
      setSuccess('Event status updated successfully');
      fetchData(); // Refresh events list
    } catch (err) {
      setError('Failed to update event status. Please try again.');
      console.error('Error updating event status:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out p-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Planning</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage schedules, events, and resource allocation
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setView('list')}
                  className={`p-2 ${
                    view === 'list'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } border border-gray-300 rounded-l-md`}
                >
                  <List className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setView('calendar')}
                  className={`p-2 ${
                    view === 'calendar'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } border border-l-0 border-gray-300 rounded-r-md`}
                >
                  <LayoutGrid className="h-5 w-5" />
                </button>
              </div>
              <button
                onClick={() => setShowEventForm(true)}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Event
              </button>
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

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                  className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="all">All Types</option>
                  <option value="meeting">Meetings</option>
                  <option value="deadline">Deadlines</option>
                  <option value="milestone">Milestones</option>
                  <option value="review">Reviews</option>
                  <option value="training">Training</option>
                </select>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Today
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const newDate = new Date(currentDate);
                      newDate.setDate(newDate.getDate() - 1);
                      setCurrentDate(newDate);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-500"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="text-sm font-medium text-gray-900">
                    {currentDate.toLocaleDateString('en-US', { 
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <button
                    onClick={() => {
                      const newDate = new Date(currentDate);
                      newDate.setDate(newDate.getDate() + 1);
                      setCurrentDate(newDate);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-500"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* View Content */}
          {view === 'calendar' ? (
            <CalendarView
              events={events}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onEventClick={setSelectedEvent}
            />
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                          <span className="ml-2 text-sm text-gray-500">#{event.id}</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{event.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <select
                          value={event.status}
                          onChange={(e) => handleUpdateEventStatus(event.id, e.target.value as Event['status'])}
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(event.priority)}`}>
                          {event.priority}
                        </span>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>Type: {event.type}</span>
                        {event.location && <span>Location: {event.location}</span>}
                      </div>
                      <div className="flex items-center space-x-4">
                        <span>Start: {new Date(event.start).toLocaleString()}</span>
                        <span>End: {new Date(event.end).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showEventForm && (
        <NewEventForm 
          onClose={() => setShowEventForm(false)}
          onSuccess={(message) => {
            setSuccess(message);
            fetchData(); // Refresh events list
          }}
          onError={(message) => setError(message)}
        />
      )}
    </div>
  );
}