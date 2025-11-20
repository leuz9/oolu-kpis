import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  Tag,
  Users,
  Pencil,
  Trash2,
  Zap,
  Eye,
  Sparkles,
  CheckSquare
} from 'lucide-react';
import type { Task, User as UserType } from '../../../types';
import TaskActionsMenu from './TaskActionsMenu';
import TaskForm from './TaskForm';
import TaskViewModal from './TaskViewModal';
import { renderTextWithLinks } from '../../../utils/textUtils';

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, data: Partial<Task>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  users: { [key: string]: UserType };
  selectedTaskIds?: string[];
  onToggleTaskSelection?: (taskId: string) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
}

export default function TaskList({ 
  tasks, 
  onUpdateTask, 
  onDeleteTask, 
  users,
  selectedTaskIds = [],
  onToggleTaskSelection,
  onSelectAll,
  onDeselectAll
}: TaskListProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);

  const getUserName = (userId: string) => {
    return users[userId]?.displayName || userId;
  };
  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'review':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
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
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="min-w-full divide-y divide-gray-200">
        {tasks.map((task) => (
          <div key={task.id} className={`p-4 sm:p-6 transition-colors ${
            selectedTaskIds.includes(task.id) ? 'bg-primary-50 hover:bg-primary-100' : 'hover:bg-gray-50'
          }`}>
            {/* Header - Mobile: Stacked, Desktop: Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex items-start sm:items-center flex-1 min-w-0 gap-3">
                {onToggleTaskSelection && (
                  <button
                    onClick={() => onToggleTaskSelection(task.id)}
                    className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all mt-1 sm:mt-0 ${
                      selectedTaskIds.includes(task.id)
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'border-gray-300 hover:border-primary-500'
                    }`}
                  >
                    {selectedTaskIds.includes(task.id) && <CheckSquare className="h-3.5 w-3.5" />}
                  </button>
                )}
                <div className="flex-shrink-0 mt-1 sm:mt-0">
                  {getStatusIcon(task.status)}
                </div>
                <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 break-words">{task.title}</h3>
                  {task.description && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2 break-words">
                      {renderTextWithLinks(task.description)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 flex-shrink-0">
                <span className={`inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)} transition-all hover:scale-105`}>
                  <span className="hidden sm:inline">{task.priority}</span>
                  <span className="sm:hidden capitalize">{task.priority.charAt(0)}</span>
                </span>
                <TaskActionsMenu
                  task={task}
                  onEdit={() => setEditingTask(task)}
                  onDelete={() => onDeleteTask(task.id)}
                  onUpdate={(data) => onUpdateTask(task.id, data)}
                />
              </div>
            </div>
            
            {/* Footer - Mobile: Stacked, Desktop: Row */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                {task.assignee && (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate max-w-[150px] sm:max-w-none" title={getUserName(task.assignee)}>
                      {getUserName(task.assignee)}
                    </span>
                  </div>
                )}
                {task.dueDate && (() => {
                  try {
                    const date = new Date(task.dueDate);
                    if (isNaN(date.getTime())) return null;
                    return (
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="whitespace-nowrap">
                          <span className="hidden sm:inline">Due: </span>
                          {date.toLocaleDateString()}
                        </span>
                      </div>
                    );
                  } catch {
                    return null;
                  }
                })()}
              </div>
              <div className="flex items-center justify-end gap-2 sm:gap-2 flex-shrink-0">
                <button
                  onClick={() => onUpdateTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' })}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    task.status === 'done'
                      ? 'text-green-600 bg-green-50 hover:bg-green-100'
                      : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                  } transform hover:scale-110 active:scale-95`}
                  title={task.status === 'done' ? 'Mark as To Do' : 'Mark as Done'}
                >
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  onClick={() => setEditingTask(task)}
                  className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 transform hover:scale-110 active:scale-95"
                  title="Edit task"
                >
                  <Pencil className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  onClick={() => setViewingTask(task)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110 active:scale-95"
                  title="View details"
                >
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingTask && (
        <TaskForm
          onSubmit={async () => {}}
          onClose={() => setEditingTask(null)}
          initialData={editingTask}
          onUpdate={onUpdateTask}
          onDelete={onDeleteTask}
        />
      )}

      {/* View Modal */}
      {viewingTask && (
        <TaskViewModal
          task={viewingTask}
          onClose={() => setViewingTask(null)}
          onUpdate={onUpdateTask}
          users={users}
        />
      )}
    </div>
  );
}