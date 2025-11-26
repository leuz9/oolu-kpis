import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Trash2, 
  Users, 
  Flag, 
  X,
  Archive,
  Copy,
  Tag
} from 'lucide-react';
import type { Task } from '../../../types';

interface BulkActionsBarProps {
  selectedTasks: string[];
  tasks: Task[];
  onUpdateTasks: (taskIds: string[], updates: Partial<Task>) => Promise<void>;
  onDeleteTasks: (taskIds: string[]) => Promise<void>;
  onClearSelection: () => void;
  users: { [key: string]: any };
}

export default function BulkActionsBar({
  selectedTasks,
  tasks,
  onUpdateTasks,
  onDeleteTasks,
  onClearSelection,
  users
}: BulkActionsBarProps) {
  const selectedTasksData = tasks.filter(t => selectedTasks.includes(t.id));
  const [showStatusMenu, setShowStatusMenu] = React.useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = React.useState(false);
  const [showAssigneeMenu, setShowAssigneeMenu] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);

  const handleBulkUpdate = async (updates: Partial<Task>) => {
    try {
      setProcessing(true);
      await onUpdateTasks(selectedTasks, updates);
      setShowStatusMenu(false);
      setShowPriorityMenu(false);
      setShowAssigneeMenu(false);
    } catch (error) {
      console.error('Error updating tasks:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      setProcessing(true);
      await onDeleteTasks(selectedTasks);
      setShowDeleteConfirm(false);
      onClearSelection();
    } catch (error) {
      console.error('Error deleting tasks:', error);
    } finally {
      setProcessing(false);
    }
  };

  const statusOptions: Array<{ value: Task['status']; label: string; icon: any; color: string }> = [
    { value: 'todo', label: 'To Do', icon: Clock, color: 'text-gray-600' },
    { value: 'in-progress', label: 'In Progress', icon: Clock, color: 'text-blue-600' },
    { value: 'review', label: 'Review', icon: AlertTriangle, color: 'text-orange-600' },
    { value: 'blocked', label: 'Blocked', icon: AlertTriangle, color: 'text-red-600' },
    { value: 'done', label: 'Done', icon: CheckCircle2, color: 'text-green-600' }
  ];

  const priorityOptions: Array<{ value: Task['priority']; label: string; color: string }> = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600' }
  ];

  if (selectedTasks.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
        <div className="bg-white rounded-xl shadow-2xl border-2 border-primary-200 px-4 py-3 flex items-center gap-3 min-w-[600px] max-w-[90vw]">
          <div className="flex items-center gap-3 flex-1">
            <div className="px-3 py-1.5 bg-primary-100 rounded-lg">
              <span className="font-semibold text-primary-700">{selectedTasks.length}</span>
              <span className="text-primary-600 ml-1">
                {selectedTasks.length === 1 ? 'task' : 'tasks'} selected
              </span>
            </div>

            {/* Status Actions */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowStatusMenu(!showStatusMenu);
                  setShowPriorityMenu(false);
                  setShowAssigneeMenu(false);
                }}
                disabled={processing}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <Tag className="h-4 w-4" />
                <span className="text-sm font-medium">Status</span>
              </button>
              {showStatusMenu && (
                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[180px] z-50">
                  {statusOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleBulkUpdate({ status: option.value })}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                      >
                        <Icon className={`h-4 w-4 ${option.color}`} />
                        <span className="text-sm">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Priority Actions */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowPriorityMenu(!showPriorityMenu);
                  setShowStatusMenu(false);
                  setShowAssigneeMenu(false);
                }}
                disabled={processing}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <Flag className="h-4 w-4" />
                <span className="text-sm font-medium">Priority</span>
              </button>
              {showPriorityMenu && (
                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[180px] z-50">
                  {priorityOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleBulkUpdate({ priority: option.value })}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                    >
                      <span className={`text-sm font-medium ${option.color}`}>{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Assignee Actions */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowAssigneeMenu(!showAssigneeMenu);
                  setShowStatusMenu(false);
                  setShowPriorityMenu(false);
                }}
                disabled={processing}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Assign</span>
              </button>
              {showAssigneeMenu && (
                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 max-h-64 overflow-y-auto min-w-[200px] z-50">
                  <button
                    onClick={() => handleBulkUpdate({ assignee: '' })}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                  >
                    <span className="text-sm">Unassign All</span>
                  </button>
                  <div className="border-t border-gray-200 my-1" />
                  {Object.values(users).map((user: any) => (
                    <button
                      key={user.id}
                      onClick={() => handleBulkUpdate({ assignee: user.id })}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                    >
                      <span className="text-sm">{user.displayName || user.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Delete Action */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={processing}
              className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              <span className="text-sm font-medium">Delete</span>
            </button>
          </div>

          <button
            onClick={onClearSelection}
            disabled={processing}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Delete Tasks</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Are you sure you want to delete {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''}?
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                This action cannot be undone. All selected tasks will be permanently deleted.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={processing}
                  className="px-6 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={processing}
                  className="px-6 py-2.5 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete {selectedTasks.length} Task{selectedTasks.length !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop to close menus */}
      {(showStatusMenu || showPriorityMenu || showAssigneeMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowStatusMenu(false);
            setShowPriorityMenu(false);
            setShowAssigneeMenu(false);
          }}
        />
      )}
    </>
  );
}

