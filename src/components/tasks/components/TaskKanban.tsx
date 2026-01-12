import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  Tag,
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

interface TaskKanbanProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, data: Partial<Task>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  users: { [key: string]: UserType };
  selectedTaskIds?: string[];
  onToggleTaskSelection?: (taskId: string) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
}

export default function TaskKanban({ 
  tasks, 
  onUpdateTask, 
  onDeleteTask, 
  users,
  selectedTaskIds = [],
  onToggleTaskSelection,
  onSelectAll,
  onDeselectAll
}: TaskKanbanProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const getUserName = (userId: string) => {
    return users[userId]?.displayName || userId;
  };
  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-500' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-yellow-500' },
    { id: 'review', title: 'Review', color: 'bg-orange-500' },
    { id: 'blocked', title: 'Blocked', color: 'bg-red-500' },
    { id: 'done', title: 'Done', color: 'bg-green-500' }
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const allSelected = tasks.length > 0 && tasks.every(t => selectedTaskIds.includes(t.id));
  const someSelected = selectedTaskIds.length > 0 && !allSelected;

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
    <div>
      {onToggleTaskSelection && tasks.length > 0 && (
        <div className="mb-4 px-4 py-3 bg-gray-50 rounded-lg flex items-center gap-3">
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
      <div className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto pb-4 sm:pb-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 w-full max-w-full">
        {columns.map(column => (
        <div
          key={column.id}
          className="flex-1 min-w-[240px] sm:min-w-[280px] md:min-w-[300px] max-w-[280px] sm:max-w-[320px] md:max-w-none bg-gray-50 rounded-lg p-2.5 sm:p-3 md:p-4 flex flex-col"
        >
          <div className="flex items-center mb-2 sm:mb-3 md:mb-4 flex-shrink-0">
            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${column.color} mr-1.5 sm:mr-2 flex-shrink-0`} />
            <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-900 truncate">
              {column.title}
            </h3>
            <span className="ml-1.5 sm:ml-2 text-[10px] sm:text-xs md:text-sm text-gray-500 flex-shrink-0">
              ({getTasksByStatus(column.id).length})
            </span>
          </div>

          <div 
            className={`space-y-2 sm:space-y-3 md:space-y-4 flex-1 overflow-y-auto min-h-0 transition-all ${
              dragOverColumn === column.id ? 'bg-primary-50 rounded-lg' : ''
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverColumn(column.id);
            }}
            onDragLeave={() => {
              setDragOverColumn(null);
            }}
            onDrop={async (e) => {
              e.preventDefault();
              const taskId = e.dataTransfer.getData('taskId');
              if (taskId && column.id) {
                await onUpdateTask(taskId, { status: column.id as Task['status'] });
              }
              setDragOverColumn(null);
              setDraggedTask(null);
            }}
          >
            {getTasksByStatus(column.id).map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => {
                  setDraggedTask(task.id);
                  e.dataTransfer.setData('taskId', task.id);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragEnd={() => {
                  setDraggedTask(null);
                  setDragOverColumn(null);
                }}
                className={`bg-white rounded-lg shadow-sm p-2.5 sm:p-3 md:p-4 hover:shadow-md transition-all duration-200 flex flex-col cursor-move ${
                  selectedTaskIds.includes(task.id) ? 'ring-2 ring-primary-500' : ''
                } ${
                  draggedTask === task.id ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 sm:mb-2 gap-1.5 sm:gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                    {onToggleTaskSelection && (
                      <button
                        onClick={() => onToggleTaskSelection(task.id)}
                        className={`flex-shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-2 flex items-center justify-center transition-all ${
                          selectedTaskIds.includes(task.id)
                            ? 'bg-primary-600 border-primary-600 text-white'
                            : 'border-gray-300 hover:border-primary-500'
                        }`}
                      >
                        {selectedTaskIds.includes(task.id) && <CheckSquare className="h-2 w-2 sm:h-2.5 sm:w-2.5" />}
                      </button>
                    )}
                    <span className={`inline-flex items-center px-1.5 sm:px-2 md:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium truncate ${getPriorityColor(task.priority)}`}>
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

                <h4 className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2 break-words mb-0.5 sm:mb-1">{task.title}</h4>
                {task.description && (
                  <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-2 break-words mb-2 sm:mb-3">
                    {renderTextWithLinks(task.description)}
                  </p>
                )}

                <div className="mt-auto space-y-2">
                  <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500 gap-1.5 sm:gap-2">
                    {task.assignee && (
                      <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 flex-1">
                        <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                        <span className="truncate max-w-[80px] sm:max-w-none" title={getUserName(task.assignee)}>
                          {getUserName(task.assignee)}
                        </span>
                      </div>
                    )}
                    {task.dueDate && (() => {
                      try {
                        const date = new Date(task.dueDate);
                        if (isNaN(date.getTime())) return null;
                        return (
                          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                            <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            <span className="whitespace-nowrap text-[9px] sm:text-[10px] md:text-xs">
                              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        );
                      } catch {
                        return null;
                      }
                    })()}
                  </div>

                  <div className="flex justify-end gap-1 sm:gap-2 pt-1.5 sm:pt-2">
                    <button
                      onClick={() => setViewingTask(task)}
                      className="p-1 sm:p-1.5 md:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110 active:scale-95"
                      title="View task"
                    >
                      <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                    </button>
                    <button
                      onClick={() => setEditingTask(task)}
                      className="p-1 sm:p-1.5 md:p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 transform hover:scale-110 active:scale-95"
                      title="Edit task"
                    >
                      <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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