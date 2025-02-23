import React from 'react';
import { Clock, AlertTriangle, CheckCircle2, MessageSquare } from 'lucide-react';
import type { SupportTicket } from '../../../types';

interface TicketListProps {
  tickets: SupportTicket[];
  onTicketClick: (ticket: SupportTicket) => void;
}

export default function TicketList({ tickets, onTicketClick }: TicketListProps) {
  const getStatusColor = (status: SupportTicket['status']) => {
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

  const getPriorityColor = (priority: SupportTicket['priority']) => {
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

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          onClick={() => onTicketClick(ticket)}
          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
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
                  {ticket.status.replace('-', ' ')}
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
                {ticket.comments && (
                  <span className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {ticket.comments.length} comments
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Created: {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Updated: {new Date(ticket.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}