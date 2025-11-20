import React, { useState, useEffect } from 'react';
import { X, Eye, MessageSquare, Send, User, Clock, CheckCircle2, AlertCircle, Calendar, Users, Flame, Target, CheckSquare } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { taskService } from '../../../services/taskService';
import { userService } from '../../../services/userService';
import type { Task, User as UserType } from '../../../types';
import { renderTextWithLinks } from '../../../utils/textUtils';

interface TaskViewModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (taskId: string, data: Partial<Task>) => Promise<void>;
  users: { [key: string]: UserType };
}

interface Comment {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
}

export default function TaskViewModal({ task, onClose, onUpdate, users: initialUsers }: TaskViewModalProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [taskData, setTaskData] = useState<Task>(task);
  const [users, setUsers] = useState<{ [key: string]: UserType }>(initialUsers);

  useEffect(() => {
    loadTaskData();
  }, [task.id]);

  useEffect(() => {
    loadMissingUsers();
  }, [comments]);

  const loadTaskData = async () => {
    try {
      setLoading(true);
      // Reload task to get latest comments
      const allTasks = await taskService.getTasks();
      const updatedTask = allTasks.find(t => t.id === task.id);
      if (updatedTask) {
        setTaskData(updatedTask);
        // Load comments if they exist
        const taskComments = updatedTask.comments || [];
        setComments(taskComments);
      }
    } catch (error) {
      console.error('Error loading task data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMissingUsers = async () => {
    try {
      const missingUserIds = comments
        .map(comment => comment.userId)
        .filter(userId => userId && !users[userId]);

      if (missingUserIds.length === 0) return;

      const usersMap = { ...users };
      await Promise.all(
        missingUserIds.map(async (userId) => {
          try {
            const userData = await userService.getUser(userId);
            if (userData) usersMap[userId] = userData;
          } catch (err: any) {
            // Silently ignore users that don't exist (they may have been deleted)
            // Only log if it's not a "User not found" error
            if (err?.message !== 'User not found') {
              console.warn(`Error loading user ${userId}:`, err);
            }
          }
        })
      );
      setUsers(usersMap);
    } catch (error) {
      // Silently ignore errors when loading missing users
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      setSubmittingComment(true);
      await taskService.addComment(task.id, newComment.trim());
      setNewComment('');
      await loadTaskData(); // Reload to get the new comment
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const getUserName = (userId: string) => {
    if (!userId) return 'Unknown User';
    const userData = users[userId];
    if (userData?.displayName) return userData.displayName;
    if (userData?.email) return userData.email;
    return userId;
  };

  const getUserAvatar = (userId: string) => {
    if (!userId) return null;
    const userData = users[userId];
    if (userData?.photoURL) return userData.photoURL;
    return null;
  };

  const getUserInitials = (userId: string) => {
    if (!userId) return 'U';
    const userData = users[userId];
    if (userData?.displayName) {
      const parts = userData.displayName.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return userData.displayName.substring(0, 2).toUpperCase();
    }
    if (userData?.email) {
      return userData.email.substring(0, 2).toUpperCase();
    }
    return userId.substring(0, 2).toUpperCase();
  };

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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    const subtask = taskData.subtasks?.find(st => st.id === subtaskId);
    if (!subtask) return;

    try {
      const updatedSubtasks = taskData.subtasks.map(st =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      );
      
      await onUpdate(taskData.id, { subtasks: updatedSubtasks });
      
      // Update local state immediately for better UX
      setTaskData(prev => ({
        ...prev,
        subtasks: updatedSubtasks
      }));
    } catch (error) {
      console.error('Error updating subtask:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-4 sm:p-6 text-white flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold break-words">{taskData.title}</h2>
              <div className="flex items-center gap-3 mt-2 text-sm text-primary-100">
                {getStatusIcon(taskData.status)}
                <span className="capitalize">{taskData.status.replace('-', ' ')}</span>
                <span>•</span>
                {getPriorityIcon(taskData.priority)}
                <span className="capitalize">{taskData.priority}</span>
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Task Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {taskData.description && (
              <div className="sm:col-span-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Description
                </h3>
                <div className="text-gray-900 bg-gray-50 rounded-lg p-3 break-words whitespace-pre-wrap">
                  {renderTextWithLinks(taskData.description)}
                </div>
              </div>
            )}

            {taskData.assignee && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Assignee
                </h3>
                <p className="text-gray-900 bg-gray-50 rounded-lg p-3 break-words">
                  {getUserName(taskData.assignee)}
                </p>
              </div>
            )}

            {taskData.dueDate && (() => {
              try {
                const date = new Date(taskData.dueDate);
                if (isNaN(date.getTime())) return null;
                return (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Due Date
                    </h3>
                    <p className="text-gray-900 bg-gray-50 rounded-lg p-3">
                      {date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                );
              } catch {
                return null;
              }
            })()}

            {taskData.subtasks && taskData.subtasks.length > 0 && (
              <div className="sm:col-span-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  Checklist
                  <span className="text-xs font-normal text-gray-500 ml-auto">
                    {taskData.subtasks.filter(st => st.completed).length} / {taskData.subtasks.length} completed
                  </span>
                </h3>
                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        taskData.subtasks.filter(st => st.completed).length === taskData.subtasks.length
                          ? 'bg-green-500'
                          : taskData.subtasks.filter(st => st.completed).length > 0
                          ? 'bg-primary-500'
                          : 'bg-gray-300'
                      }`}
                      style={{
                        width: `${(taskData.subtasks.filter(st => st.completed).length / taskData.subtasks.length) * 100}%`
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {taskData.subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                        subtask.completed
                          ? 'bg-green-50 border border-green-200 hover:bg-green-100'
                          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => handleToggleSubtask(subtask.id)}
                    >
                      <button
                        type="button"
                        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          subtask.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-primary-500'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSubtask(subtask.id);
                        }}
                      >
                        {subtask.completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </button>
                      <span
                        className={`flex-1 select-none ${
                          subtask.completed
                            ? 'line-through text-gray-500'
                            : 'text-gray-900'
                        }`}
                      >
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary-600" />
              Updates & Comments
            </h3>

            {/* Comments List */}
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {getUserAvatar(comment.userId) ? (
                          <img 
                            src={getUserAvatar(comment.userId)!} 
                            alt={getUserName(comment.userId)}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
                            {getUserInitials(comment.userId)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 text-sm">
                            {getUserName(comment.userId)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <div className="text-gray-700 text-sm break-words whitespace-pre-wrap">
                          {renderTextWithLinks(comment.content)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No comments yet. Be the first to add an update!</p>
                </div>
              )}
            </div>

            {/* Add Comment Form */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <User className="h-4 w-4 text-primary-600" />
                  )}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleAddComment();
                      }
                    }}
                    placeholder="Add an update or comment... (⌘+Enter to send)"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all resize-none"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500">
                      Press ⌘+Enter to send
                    </p>
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || submittingComment}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingComment ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Post Update
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

