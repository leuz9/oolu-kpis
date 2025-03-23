import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  Tag,
  Users,
  MoreVertical,
  Pencil,
  Trash2
} from 'lucide-react';
import type { Task } from '../../../types';

interface TaskKanbanProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, data: Partial<Task>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
}

export default function TaskKanban({ tasks, onUpdateTask, onDeleteTask }: TaskKanbanProps) {
  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-500' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-yellow-500' },
    { id: 'review', title: 'Review', color: 'bg-orange-500' },
    { id: 'done', title: 'Done', color: 'bg-green-500' }
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
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
    <div className="flex space-x-6 overflow-x-auto pb-6">
      {columns.map(column => (
        <div
          key={column.id}
          className="flex-1 min-w-[300px] bg-gray-50 rounded-lg p-4"
        >
          <div className="flex items-center mb-4">
            <div className={`w-3 h-3 rounded-full ${column.color} mr-2`} />
            <h3 className="text-lg font-medium text-gray-900">
              {column.title}
            </h3>
            <span className="ml-2 text-sm text-gray-500">
              ({getTasksByStatus(column.id).length})
            </span>
          </div>

          <div className="space-y-4">
            {getTasksByStatus(column.id).map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <div className="relative">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {/* Add dropdown menu for actions */}
                  </div>
                </div>

                <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                <p className="mt-1 text-xs text-gray-500 line-clamp-2">{task.description}</p>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  {task.assignee && (
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {task.assignee}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                </div>

                {task.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex justify-end space-x-2">
                  <button
                    onClick={() => onUpdateTask(task.id, {})} // Open edit modal
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}