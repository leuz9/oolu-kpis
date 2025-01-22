import React, { useState } from 'react';
import Sidebar from '../Sidebar';
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
  Target
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  type: 'meeting' | 'deadline' | 'milestone' | 'review' | 'training';
  start: string;
  end: string;
  description: string;
  participants: string[];
  location?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  project?: string;
  objective?: string;
  resources?: string[];
}

interface Resource {
  id: string;
  name: string;
  type: 'employee' | 'equipment' | 'room';
  availability: {
    start: string;
    end: string;
  }[];
  capacity: number;
  assigned: number;
  status: 'available' | 'partially-booked' | 'fully-booked' | 'maintenance';
}

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

export default function Planning() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [view, setView] = useState<'calendar' | 'resources'>('calendar');
  const [events, setEvents] = useState(sampleEvents);
  const [resources, setResources] = useState(sampleResources);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterType, setFilterType] = useState<'all' | Event['type']>('all');
  const [searchTerm, setSearchTerm] = useState('');

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
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
    }
  };

  const EventForm = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            {selectedEvent ? 'Edit Event' : 'Add Event'}
          </h3>
          <button
            onClick={() => {
              setShowEventForm(false);
              setSelectedEvent(null);
            }}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Event title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date & Time</label>
              <input
                type="datetime-local"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date & Time</label>
              <input
                type="datetime-local"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Event description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                <option value="meeting">Meeting</option>
                <option value="deadline">Deadline</option>
                <option value="milestone">Milestone</option>
                <option value="review">Review</option>
                <option value="training">Training</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Event location"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setShowEventForm(false);
                setSelectedEvent(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
            >
              {selectedEvent ? 'Save Changes' : 'Add Event'}
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
              <h1 className="text-2xl font-bold text-gray-900">Planning</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage schedules, events, and resource allocation
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setView('calendar')}
                  className={`px-4 py-2 text-sm font-medium ${
                    view === 'calendar'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } border border-gray-300 rounded-l-md`}
                >
                  <Calendar className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setView('resources')}
                  className={`px-4 py-2 text-sm font-medium ${
                    view === 'resources'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } border border-l-0 border-gray-300 rounded-r-md`}
                >
                  <Users className="h-5 w-5" />
                </button>
              </div>
              <button
                onClick={() => {
                  setSelectedEvent(null);
                  setShowEventForm(true);
                }}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Event
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
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

          {view === 'calendar' ? (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <div className="grid gap-6">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        {getEventTypeIcon(event.type)}
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{event.title}</h3>
                          <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
                            <CalendarIcon className="h-4 w-4" />
                            <span>
                              {new Date(event.start).toLocaleString()} - {new Date(event.end).toLocaleTimeString()}
                            </span>
                          </div>
                          {event.location && (
                            <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
                              <Users className="h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(event.priority)}`}>
                          {event.priority}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                        <button className="p-1 text-gray-400 hover:text-gray-500">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <div className="grid gap-6">
                  {resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        {resource.type === 'room' && <Building2 className="h-5 w-5 text-blue-500" />}
                        {resource.type === 'employee' && <Users className="h-5 w-5 text-green-500" />}
                        {resource.type === 'equipment' && <Tool className="h-5 w-5 text-purple-500" />}
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{resource.name}</h3>
                          <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
                            <Users className="h-4 w-4" />
                            <span>
                              {resource.assigned} / {resource.capacity} allocated
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(resource.status)}`}>
                          {resource.status}
                        </span>
                        <button className="p-1 text-gray-400 hover:text-gray-500">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showEventForm && <EventForm />}
    </div>
  );
}