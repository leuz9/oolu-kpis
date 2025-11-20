import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Tag, Users } from 'lucide-react';
import type { Task, User as UserType } from '../../../types';
import { renderTextWithLinks } from '../../../utils/textUtils';

interface TaskCalendarProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, data: Partial<Task>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  users: { [key: string]: UserType };
}

export default function TaskCalendar({ tasks, onUpdateTask, onDeleteTask, users }: TaskCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getTasksForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      try {
        const taskDateObj = new Date(task.dueDate);
        // Check if date is valid
        if (isNaN(taskDateObj.getTime())) return false;
        const taskDate = taskDateObj.toISOString().split('T')[0];
        return taskDate === dateStr;
      } catch (error) {
        console.error('Invalid date for task:', task.id, task.dueDate, error);
        return false;
      }
    });
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'done': return 'bg-green-100 border-green-300';
      case 'in-progress': return 'bg-blue-100 border-blue-300';
      case 'review': return 'bg-yellow-100 border-yellow-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const today = new Date();
  const days = getDaysInMonth(currentDate);
  const selectedTasks = getTasksForDate(selectedDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{monthName}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Today
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs sm:text-sm font-semibold text-gray-600 py-2">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.charAt(0)}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {days.map((date, index) => {
              const isToday = date && 
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();
              
              const isSelected = selectedDate && date &&
                date.getDate() === selectedDate.getDate() &&
                date.getMonth() === selectedDate.getMonth() &&
                date.getFullYear() === selectedDate.getFullYear();

              const dayTasks = date ? getTasksForDate(date) : [];
              const hasTasks = dayTasks.length > 0;

              if (!date) {
                return <div key={index} className="aspect-square" />;
              }

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`aspect-square p-2 rounded-lg border-2 transition-all hover:shadow-md ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : isToday
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                    {date.getDate()}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {dayTasks.slice(0, 3).map(task => (
                      <div
                        key={task.id}
                        className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}
                        title={task.title}
                      />
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-gray-500">+{dayTasks.length - 3}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Task List for Selected Date */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 sm:top-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 flex-shrink-0" />
              <span className="break-words">
                {selectedDate
                  ? selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  : 'Select a date'}
              </span>
            </h3>

            <div className="space-y-3 max-h-[400px] sm:max-h-[600px] overflow-y-auto">
              {selectedDate ? (
                selectedTasks.length > 0 ? (
                  selectedTasks.map(task => (
                    <div
                      key={task.id}
                      className={`p-3 sm:p-4 rounded-lg border-2 ${getStatusColor(task.status)} hover:shadow-md transition-all cursor-pointer`}
                      onClick={() => {
                        // Toggle task completion
                        if (task.status !== 'done') {
                          onUpdateTask(task.id, { status: 'done' });
                        } else {
                          onUpdateTask(task.id, { status: 'todo' });
                        }
                      }}
                    >
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <h4 className="font-semibold text-gray-900 text-xs sm:text-sm break-words flex-1">{task.title}</h4>
                        <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${getPriorityColor(task.priority)}`} />
                      </div>
                      
                      {task.description && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2 break-words">
                          {renderTextWithLinks(task.description)}
                        </p>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          {(() => {
                            try {
                              if (!task.dueDate) return 'No date';
                              const date = new Date(task.dueDate);
                              if (isNaN(date.getTime())) return 'Invalid date';
                              return date.toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              });
                            } catch {
                              return 'Invalid date';
                            }
                          })()}
                        </div>
                        {task.assignee && users[task.assignee] && (
                          <div className="flex items-center gap-1 min-w-0">
                            <Users className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate max-w-[120px] sm:max-w-none" title={users[task.assignee].displayName}>
                              {users[task.assignee].displayName}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          task.status === 'done' 
                            ? 'bg-green-200 text-green-800' 
                            : task.status === 'in-progress'
                            ? 'bg-blue-200 text-blue-800'
                            : 'bg-gray-200 text-gray-800'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No tasks for this date</p>
                  </div>
                )
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Click on a date to view tasks</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

