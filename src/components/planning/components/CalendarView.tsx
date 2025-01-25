import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Event } from '../../../types';

interface CalendarViewProps {
  events: Event[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onEventClick: (event: Event) => void;
}

export default function CalendarView({ events, currentDate, onDateChange, onEventClick }: CalendarViewProps) {
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const weeks = Math.ceil((daysInMonth + firstDayOfMonth) / 7);
  const days = Array.from({ length: weeks * 7 }, (_, i) => {
    const dayNumber = i - firstDayOfMonth + 1;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
    return {
      date,
      isCurrentMonth: dayNumber > 0 && dayNumber <= daysInMonth,
      events: events.filter(event => {
        const eventDate = new Date(event.start);
        return (
          eventDate.getDate() === dayNumber &&
          eventDate.getMonth() === currentDate.getMonth() &&
          eventDate.getFullYear() === currentDate.getFullYear()
        );
      })
    };
  });

  const getEventColor = (type: Event['type']) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'deadline':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'milestone':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'review':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'training':
        return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Calendar Header */}
      <div className="p-4 flex items-center justify-between border-b">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onDateChange(new Date())}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Today
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setMonth(newDate.getMonth() - 1);
                onDateChange(newDate);
              }}
              className="p-1.5 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setMonth(newDate.getMonth() + 1);
                onDateChange(newDate);
              }}
              className="p-1.5 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {/* Week day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="bg-gray-50 py-2 text-center">
            <span className="text-sm font-medium text-gray-500">{day}</span>
          </div>
        ))}

        {/* Calendar days */}
        {days.map(({ date, isCurrentMonth, events }, index) => (
          <div
            key={index}
            className={`min-h-[120px] bg-white p-2 ${
              isCurrentMonth ? '' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className={`text-sm ${
                  isCurrentMonth
                    ? date.toDateString() === new Date().toDateString()
                      ? 'bg-primary-600 text-white h-6 w-6 rounded-full flex items-center justify-center'
                      : 'text-gray-900'
                    : 'text-gray-400'
                }`}
              >
                {date.getDate()}
              </span>
            </div>
            <div className="space-y-1">
              {events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className={`w-full text-left px-2 py-1 rounded text-xs font-medium border ${getEventColor(
                    event.type
                  )}`}
                >
                  <div className="truncate">{event.title}</div>
                  <div className="text-xs opacity-75">
                    {new Date(event.start).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}