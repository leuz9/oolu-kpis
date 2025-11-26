import { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  Users,
  Pencil,
  Eye,
  CheckSquare
} from 'lucide-react';
import type { Task, User as UserType } from '../../../types';
import TaskActionsMenu from './TaskActionsMenu';
import TaskForm from './TaskForm';
import TaskViewModal from './TaskViewModal';
import { renderTextWithLinks } from '../../../utils/textUtils';

interface TaskGridProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, data: Partial<Task>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  users: { [key: string]: UserType };
  selectedTaskIds?: string[];
  onToggleTaskSelection?: (taskId: string) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
}

export default function TaskGrid({ 
  tasks, 
  onUpdateTask, 
  onDeleteTask, 
  users,
  selectedTaskIds = [],
  onToggleTaskSelection,
  onSelectAll,
  onDeselectAll
}: TaskGridProps) {
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
      case 'blocked':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
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

  const allSelected = tasks.length > 0 && tasks.every(t => selectedTaskIds.includes(t.id));
  const someSelected = selectedTaskIds.length > 0 && !allSelected;

  return (
    <div>
      {onToggleTaskSelection && tasks.length > 0 && (
        <div className="mb-4 px-2 py-3 bg-gray-50 rounded-lg flex items-center gap-3">
          <button
            onClick={() => allSelected ? onDeselectAll?.() : onSelectAll?.()}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
              allSelected
                ? 'bg-primary-600 border-primary-600 text-white'
                : someSelected
                ? 'bg-primary-100 border-primary-600 text-primary-600'
                : 'border-gray-300 hover:border-primary-500'
            }`}
          >
            {allSelected && <CheckSquare className="h-3.5 w-3.5" />}
            {someSelected && <div className="w-2 h-2 bg-primary-600 rounded" />}
          </button>
          <span className="text-sm font-medium text-gray-700">
            {allSelected ? 'Deselect All' : 'Select All'}
          </span>
          {selectedTaskIds.length > 0 && (
            <span className="text-xs text-gray-500 ml-auto">
              {selectedTaskIds.length} selected
            </span>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex flex-col ${
              selectedTaskIds.includes(task.id) ? 'ring-2 ring-primary-500' : ''
            }`}
          >
            <div className="p-4 sm:p-6 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {onToggleTaskSelection && (
                    <button
                      onClick={() => onToggleTaskSelection(task.id)}
                      className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        selectedTaskIds.includes(task.id)
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : 'border-gray-300 hover:border-primary-500'
                      }`}
                    >
                      {selectedTaskIds.includes(task.id) && <CheckSquare className="h-3.5 w-3.5" />}
                    </button>
                  )}
                  <div className="flex-shrink-0">
                    {getStatusIcon(task.status)}
                  </div>
                <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium truncate ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
              <div className="flex-shrink-0">
                <TaskActionsMenu
                  task={task}
                  onEdit={() => setEditingTask(task)}
                  onDelete={() => onDeleteTask(task.id)}
                  onUpdate={(data) => onUpdateTask(task.id, data)}
                />
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 line-clamp-2 break-words">{task.title}</h3>
            {task.description && (
              <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 line-clamp-3 break-words flex-1">
                {renderTextWithLinks(task.description)}
              </p>
            )}

            <div className="space-y-2 sm:space-y-3 mt-auto">
              {task.subtasks && task.subtasks.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <CheckSquare className="h-3.5 w-3.5" />
                      <span>
                        {task.subtasks.filter(st => st.completed).length} / {task.subtasks.length}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        task.subtasks.filter(st => st.completed).length === task.subtasks.length
                          ? 'bg-green-500'
                          : 'bg-primary-500'
                      }`}
                      style={{
                        width: `${(task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100}%`
                      }}
                    />
                  </div>
                </div>
              )}
              {task.assignee && (
                <div className="flex items-center text-xs sm:text-sm text-gray-500 gap-2">
                  <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate" title={getUserName(task.assignee)}>
                    {getUserName(task.assignee)}
                  </span>
                </div>
              )}
              {task.dueDate && (() => {
                try {
                  const date = new Date(task.dueDate);
                  if (isNaN(date.getTime())) return null;
                  return (
                    <div className="flex items-center text-xs sm:text-sm text-gray-500 gap-2">
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

            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setViewingTask(task)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110 active:scale-95"
                title="View task"
              >
                <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
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