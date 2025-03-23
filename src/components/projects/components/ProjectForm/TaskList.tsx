import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { Task } from '../../../../types';

interface TaskListProps {
  tasks: Task[];
  onAdd: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void;
  onRemove: (index: number) => void;
}

export default function TaskList({ tasks, onAdd, onRemove }: TaskListProps) {
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'todo' as const,
    priority: 'medium' as const,
    dueDate: ''
  });

  const handleAdd = () => {
    if (newTask.title.trim()) {
      onAdd(newTask);
      setNewTask({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: ''
      });
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">Tasks</h4>
        <span className="text-sm text-gray-500">{tasks.length} tasks</span>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            value={newTask.title}
            onChange={e => setNewTask({ ...newTask, title: e.target.value })}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="Task title"
          />
          <input
            type="text"
            value={newTask.description}
            onChange={e => setNewTask({ ...newTask, description: e.target.value })}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="Task description"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <select
            value={newTask.priority}
            onChange={e => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
            <option value="urgent">Urgent</option>
          </select>
          <input
            type="date"
            value={newTask.dueDate}
            onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Add Task
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className="flex items-center justify-between p-2 bg-white rounded-md"
          >
            <div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900">{task.title}</span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                  task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                  task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.priority}
                </span>
              </div>
              <p className="text-sm text-gray-500">{task.description}</p>
              <div className="text-xs text-gray-400">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="text-gray-400 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}