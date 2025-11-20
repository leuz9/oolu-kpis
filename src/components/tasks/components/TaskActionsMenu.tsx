import React, { useState, useRef, useEffect } from 'react';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Copy, 
  Archive, 
  Share2, 
  Clock, 
  Flag,
  CheckCircle2,
  ArrowRight,
  Star,
  Eye,
  Zap
} from 'lucide-react';
import type { Task } from '../../../types';
import ConfirmationModal from './ConfirmationModal';

interface TaskActionsMenuProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (data: Partial<Task>) => Promise<void>;
  onDuplicate?: () => void;
}

export default function TaskActionsMenu({ task, onEdit, onDelete, onUpdate, onDuplicate }: TaskActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const quickActions = [
    {
      label: task.status === 'done' ? 'Mark as To Do' : 'Mark as Done',
      icon: CheckCircle2,
      action: () => onUpdate({ status: task.status === 'done' ? 'todo' : 'done' }),
      color: task.status === 'done' ? 'text-gray-600' : 'text-green-600',
      bgColor: task.status === 'done' ? 'hover:bg-gray-50' : 'hover:bg-green-50'
    },
    {
      label: 'Start Working',
      icon: Zap,
      action: () => onUpdate({ status: 'in-progress' }),
      color: 'text-blue-600',
      bgColor: 'hover:bg-blue-50',
      show: task.status !== 'in-progress'
    },
    {
      label: 'Move to Review',
      icon: ArrowRight,
      action: () => onUpdate({ status: 'review' }),
      color: 'text-orange-600',
      bgColor: 'hover:bg-orange-50',
      show: task.status !== 'review' && task.status !== 'done'
    },
    {
      label: task.priority === 'urgent' ? 'Remove Urgent' : 'Mark as Urgent',
      icon: Flag,
      action: () => onUpdate({ priority: task.priority === 'urgent' ? 'medium' : 'urgent' }),
      color: task.priority === 'urgent' ? 'text-gray-600' : 'text-red-600',
      bgColor: task.priority === 'urgent' ? 'hover:bg-gray-50' : 'hover:bg-red-50'
    }
  ].filter(action => action.show !== false);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
      >
        <MoreVertical className="h-5 w-5 group-hover:scale-110 transition-transform" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-slide-down overflow-hidden">
          {/* Quick Actions */}
          <div className="px-2 pb-2 border-b border-gray-100">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Quick Actions
            </div>
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => {
                    action.action();
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${action.bgColor} ${action.color} group`}
                >
                  <Icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main Actions */}
          <div className="px-2 pt-2">
            <button
              onClick={() => {
                onEdit();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 group"
            >
              <Edit className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Edit Task</span>
            </button>

            {onDuplicate && (
              <button
                onClick={() => {
                  onDuplicate();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group"
              >
                <Copy className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Duplicate</span>
              </button>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                setShowDeleteConfirm(true);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 group"
            >
              <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Delete Task</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleting(false);
        }}
        onConfirm={async () => {
          try {
            setDeleting(true);
            const result = onDelete();
            if (result instanceof Promise) {
              await result;
            }
            setShowDeleteConfirm(false);
          } catch (error) {
            console.error('Error deleting task:', error);
            setDeleting(false);
          }
        }}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"?`}
        confirmText="Delete Task"
        cancelText="Cancel"
        type="danger"
        loading={deleting}
      />
    </div>
  );
}

