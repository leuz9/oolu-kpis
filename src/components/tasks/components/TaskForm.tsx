import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Sparkles, Zap, Target, AlertCircle, CheckCircle2, Clock, Flame, Save, Plus, Trash2, Pencil, CheckSquare } from 'lucide-react';
import { projectService } from '../../../services/projectService';
import { userService } from '../../../services/userService';
import { useAuth } from '../../../contexts/AuthContext';
import type { Task, Project, User as UserType } from '../../../types';
import ConfirmationModal from './ConfirmationModal';
import UserSelect from './UserSelect';

interface TaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<void>;
  onClose: () => void;
  initialData?: Partial<Task>;
  onUpdate?: (taskId: string, data: Partial<Task>) => Promise<void>;
  onDelete?: (taskId: string) => Promise<void>;
}

export default function TaskForm({ onSubmit, onClose, initialData, onUpdate, onDelete }: TaskFormProps) {
  const { user } = useAuth();
  const isEditMode = !!initialData?.id;
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    status: initialData?.status || 'todo',
    priority: initialData?.priority || 'medium',
    assignee: initialData?.assignee || '',
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
    projectId: initialData?.projectId || '',
    objectiveId: initialData?.objectiveId || '',
    subtasks: initialData?.subtasks || []
  });

  const [newSubtask, setNewSubtask] = useState('');
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsData, usersData] = await Promise.all([
        projectService.getProjects(),
        userService.getAllUsers()
      ]);
      setProjects(projectsData.filter(p => p.status !== 'completed'));
      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (isEditMode && initialData?.id && onUpdate) {
        await onUpdate(initialData.id, formData);
      } else {
        await onSubmit({
          ...formData,
          assignee: formData.assignee || user?.id || '',
          dueDate: formData.dueDate || new Date().toISOString()
        });
      }
      onClose();
    } catch (err) {
      console.error('Error saving task:', err);
      setError('Failed to save task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditMode || !initialData?.id || !onDelete) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!isEditMode || !initialData?.id || !onDelete) return;
    
    try {
      setDeleting(true);
      await onDelete(initialData.id);
      onClose();
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task.');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };


  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setFormData(prev => ({
        ...prev,
        subtasks: [...prev.subtasks, {
          id: `subtask-${Date.now()}`,
          title: newSubtask.trim(),
          completed: false
        }]
      }));
      setNewSubtask('');
    }
  };

  const handleToggleSubtask = (subtaskId: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(st => 
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      )
    }));
  };

  const handleRemoveSubtask = (subtaskId: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(st => st.id !== subtaskId)
    }));
  };

  const handleStartEditSubtask = (subtaskId: string, currentTitle: string) => {
    setEditingSubtaskId(subtaskId);
    setEditingSubtaskTitle(currentTitle);
  };

  const handleSaveEditSubtask = (subtaskId: string) => {
    if (editingSubtaskTitle.trim()) {
      setFormData(prev => ({
        ...prev,
        subtasks: prev.subtasks.map(st =>
          st.id === subtaskId ? { ...st, title: editingSubtaskTitle.trim() } : st
        )
      }));
    }
    setEditingSubtaskId(null);
    setEditingSubtaskTitle('');
  };

  const handleCancelEditSubtask = () => {
    setEditingSubtaskId(null);
    setEditingSubtaskTitle('');
  };

  const completedSubtasksCount = formData.subtasks.filter(st => st.completed).length;
  const totalSubtasksCount = formData.subtasks.length;

  const getPriorityIcon = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return <Flame className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'done': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'review': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default: return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-down">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm flex-shrink-0">
                {isEditMode ? <Zap className="h-5 w-5 sm:h-6 sm:w-6" /> : <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl font-bold truncate">
                  {isEditMode ? 'Edit Task' : 'Create New Task'}
                </h2>
                <p className="text-primary-100 text-xs sm:text-sm mt-1 hidden sm:block">
                  {isEditMode ? 'Update task details' : 'Add a new task to your list'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg animate-slide-down">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all text-lg font-medium"
                placeholder="Enter task title..."
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all resize-none"
                placeholder="Add a detailed description..."
              />
            </div>

            {/* Status and Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  {getStatusIcon(formData.status)}
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all cursor-pointer"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  {getPriorityIcon(formData.priority)}
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all cursor-pointer"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Assignee and Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {loading ? (
                <div>
                  <div className="block text-sm font-semibold text-gray-700 mb-2">Assignee</div>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg animate-pulse">Loading users...</div>
                </div>
              ) : (
                <UserSelect
                  users={users}
                  value={formData.assignee}
                  onChange={(userId) => setFormData({ ...formData, assignee: userId })}
                  label="Assignee"
                  placeholder="Select or search for a user..."
                />
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                />
              </div>
            </div>

            {/* Project */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Project
              </label>
              {loading ? (
                <div className="px-4 py-3 bg-gray-50 rounded-lg animate-pulse">Loading projects...</div>
              ) : (
                <select
                  value={formData.projectId}
                  onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all cursor-pointer"
                >
                  <option value="">No Project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name} ({project.status})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Checklist / Subtasks */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                Checklist
                {totalSubtasksCount > 0 && (
                  <span className="text-xs font-normal text-gray-500 ml-auto">
                    {completedSubtasksCount} / {totalSubtasksCount} completed
                  </span>
                )}
              </label>
              
              {totalSubtasksCount > 0 && (
                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        completedSubtasksCount === totalSubtasksCount
                          ? 'bg-green-500'
                          : completedSubtasksCount > 0
                          ? 'bg-primary-500'
                          : 'bg-gray-300'
                      }`}
                      style={{ width: `${(completedSubtasksCount / totalSubtasksCount) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              
              {formData.subtasks.length > 0 && (
                <div className="space-y-2 mb-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {formData.subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                        subtask.completed
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleSubtask(subtask.id)}
                        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          subtask.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-primary-500'
                        }`}
                      >
                        {subtask.completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </button>
                      
                      {editingSubtaskId === subtask.id ? (
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={editingSubtaskTitle}
                            onChange={e => setEditingSubtaskTitle(e.target.value)}
                            onKeyPress={e => {
                              if (e.key === 'Enter') {
                                handleSaveEditSubtask(subtask.id);
                              } else if (e.key === 'Escape') {
                                handleCancelEditSubtask();
                              }
                            }}
                            onBlur={() => handleSaveEditSubtask(subtask.id)}
                            className="flex-1 px-3 py-1.5 text-sm rounded-lg border-2 border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <span
                          className={`flex-1 cursor-pointer ${
                            subtask.completed
                              ? 'line-through text-gray-500'
                              : 'text-gray-900'
                          }`}
                          onDoubleClick={() => handleStartEditSubtask(subtask.id, subtask.title)}
                        >
                          {subtask.title}
                        </span>
                      )}
                      
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {editingSubtaskId !== subtask.id && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStartEditSubtask(subtask.id, subtask.title)}
                              className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                              title="Edit subtask"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveSubtask(subtask.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete subtask"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={e => setNewSubtask(e.target.value)}
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  className="flex-1 px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all text-sm"
                  placeholder="Add a checklist item... (Press Enter)"
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  disabled={!newSubtask.trim()}
                  className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add</span>
                </button>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            {isEditMode && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="w-full sm:w-auto px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Trash2 className="h-4 w-4" />
                Delete Task
              </button>
            )}
          </div>
          
          {/* Delete Confirmation Modal */}
          <ConfirmationModal
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={confirmDelete}
            title="Delete Task"
            message={`Are you sure you want to delete "${formData.title}"?`}
            confirmText="Delete Task"
            cancelText="Cancel"
            type="danger"
            loading={deleting}
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={saving || !formData.title.trim()}
              className="flex-1 sm:flex-none px-6 py-2.5 text-white bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg hover:from-primary-700 hover:to-purple-700 transition-all font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEditMode ? 'Save Changes' : 'Create Task'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
