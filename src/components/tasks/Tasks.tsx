import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../Sidebar';
import { taskService } from '../../services/taskService';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar as CalendarIcon,
  Users,
  Tag,
  LayoutGrid,
  List,
  Columns,
  Calendar,
  TrendingUp,
  Zap,
  Target,
  BarChart3,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Bell,
  Sparkles,
  Flame,
  Award,
  Activity,
  Eye,
  EyeOff,
  Command,
  X,
  ChevronDown,
  ChevronUp,
  User,
  RotateCcw as ResetIcon
} from 'lucide-react';
import type { Task, User as UserType, Project } from '../../types';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import TaskGrid from './components/TaskGrid';
import TaskKanban from './components/TaskKanban';
import TaskCalendar from './components/TaskCalendar';
import TaskAnalytics from './components/TaskAnalytics';
import FocusMode from './components/FocusMode';
import QuickActions from './components/QuickActions';
import BulkActionsBar from './components/BulkActionsBar';
import DepartmentTabs from './components/DepartmentTabs';
import { projectService } from '../../services/projectService';
import { countryService } from '../../services/countryService';
import { departmentService } from '../../services/departmentService';

type ViewType = 'list' | 'grid' | 'kanban' | 'calendar' | 'analytics';
type FilterPreset = 'all' | 'my-tasks' | 'urgent' | 'due-today' | 'overdue' | 'completed';

export default function Tasks() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<{ [key: string]: UserType }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [view, setView] = useState<ViewType>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Task['status']>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | Task['priority']>('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterPreset, setFilterPreset] = useState<FilterPreset>('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterMe, setFilterMe] = useState(false);
  const [filterOverdue, setFilterOverdue] = useState(false);
  const [projectsByDepartment, setProjectsByDepartment] = useState<{ [key: string]: string[] }>({});
  const [taskProjectMap, setTaskProjectMap] = useState<{ [key: string]: string }>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  
  // Reset selection when view or filters change
  useEffect(() => {
    setSelectedTaskIds([]);
  }, [view, filterStatus, filterPriority, filterAssignee, filterPreset, searchTerm, filterDepartment, filterProject, filterCountry, filterMe, filterOverdue]);
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTasks();
    loadUsers();
    loadProjects();
    loadCountries();
    loadDepartments();
    
    // Keyboard shortcuts
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowQuickActions(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setShowTaskForm(true);
      }
      if (e.key === 'Escape') {
        setShowQuickActions(false);
        setShowFocusMode(false);
        setShowTaskForm(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const loadUsers = async () => {
    try {
      const allTasks = await taskService.getTasks();
      const userIds = new Set<string>();
      allTasks.forEach(task => {
        if (task.assignee) userIds.add(task.assignee);
        if (task.createdBy) userIds.add(task.createdBy);
        // Load users from comments
        if (task.comments && Array.isArray(task.comments)) {
          task.comments.forEach((comment: any) => {
            if (comment.userId) userIds.add(comment.userId);
          });
        }
      });

      const usersMap: { [key: string]: UserType } = {};
      await Promise.all(
        Array.from(userIds).map(async (userId) => {
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
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const loadProjects = async () => {
    try {
      const allProjects = await projectService.getProjects();
      const projectsMap: { [key: string]: string[] } = {};
      const taskMap: { [key: string]: string } = {};
      
      allProjects.forEach(project => {
        if (project.department) {
          if (!projectsMap[project.department]) {
            projectsMap[project.department] = [];
          }
          projectsMap[project.department].push(project.id);
        }
      });
      
      // Map tasks to projects
      const allTasks = await taskService.getTasks();
      allTasks.forEach(task => {
        if (task.projectId) {
          taskMap[task.id] = task.projectId;
        }
      });
      
      setProjects(allProjects);
      setProjectsByDepartment(projectsMap);
      setTaskProjectMap(taskMap);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadCountries = async () => {
    try {
      const allCountries = await countryService.getActiveCountries();
      setCountries(allCountries);
    } catch (error) {
      console.error('Error loading countries:', error);
    }
  };

  const loadDepartments = async () => {
    try {
      const allDepartments = await departmentService.getDepartments();
      setDepartments(allDepartments);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const fetchedTasks = await taskService.getTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([fetchTasks(), loadUsers()]);
      setSuccess('Tasks refreshed successfully');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      console.error('Error refreshing tasks:', err);
      setError('Failed to refresh tasks');
      setTimeout(() => setError(null), 3000);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    try {
      await taskService.addTask(taskData);
      setSuccess('Task created successfully! 🎉');
      setShowTaskForm(false);
      setTimeout(() => setSuccess(null), 3000);
      fetchTasks();
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleUpdateTask = async (taskId: string, data: Partial<Task>) => {
    try {
      await taskService.updateTask(taskId, data);
      setSuccess('Task updated successfully! ✨');
      setTimeout(() => setSuccess(null), 3000);
      fetchTasks();
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId);
      setSuccess('Task deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
      fetchTasks();
      setSelectedTaskIds(prev => prev.filter(id => id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleBulkUpdateTasks = async (taskIds: string[], updates: Partial<Task>) => {
    try {
      await Promise.all(taskIds.map(taskId => taskService.updateTask(taskId, updates)));
      setSuccess(`${taskIds.length} task${taskIds.length !== 1 ? 's' : ''} updated successfully`);
      setTimeout(() => setSuccess(null), 3000);
      fetchTasks();
      setSelectedTaskIds([]);
    } catch (err) {
      console.error('Error updating tasks:', err);
      setError('Failed to update tasks');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleBulkDeleteTasks = async (taskIds: string[]) => {
    try {
      await Promise.all(taskIds.map(taskId => taskService.deleteTask(taskId)));
      setSuccess(`${taskIds.length} task${taskIds.length !== 1 ? 's' : ''} deleted successfully`);
      setTimeout(() => setSuccess(null), 3000);
      fetchTasks();
      setSelectedTaskIds([]);
    } catch (err) {
      console.error('Error deleting tasks:', err);
      setError('Failed to delete tasks');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Apply filter presets
  const applyFilterPreset = useCallback((preset: FilterPreset) => {
    setFilterPreset(preset);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (preset) {
      case 'my-tasks':
        setFilterAssignee(user?.id || 'all');
        setFilterStatus('all');
        setFilterPriority('all');
        break;
      case 'urgent':
        setFilterPriority('urgent');
        setFilterStatus('all');
        setFilterAssignee('all');
        break;
      case 'due-today':
        setFilterStatus('all');
        setFilterPriority('all');
        setFilterAssignee('all');
        break;
      case 'overdue':
        setFilterStatus('all');
        setFilterPriority('all');
        setFilterAssignee('all');
        break;
      case 'completed':
        setFilterStatus('done');
        setFilterPriority('all');
        setFilterAssignee('all');
        break;
      default:
        setFilterStatus('all');
        setFilterPriority('all');
        setFilterAssignee('all');
    }
  }, [user?.id]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesAssignee = filterAssignee === 'all' || task.assignee === filterAssignee;
    
    // Me filter - show only tasks assigned to current user
    const matchesMe = !filterMe || task.assignee === user?.id;
    
    // Overdue filter - show only overdue tasks
    let matchesOverdue = true;
    if (filterOverdue) {
      if (!task.dueDate) {
        matchesOverdue = false;
      } else {
        try {
          const dueDate = new Date(task.dueDate);
          if (isNaN(dueDate.getTime())) {
            matchesOverdue = false;
          } else {
            dueDate.setHours(0, 0, 0, 0);
            matchesOverdue = dueDate.getTime() < today.getTime() && task.status !== 'done';
          }
        } catch {
          matchesOverdue = false;
        }
      }
    }
    
    // Project filter
    let matchesProject = true;
    if (filterProject === 'no-project') {
      matchesProject = !task.projectId;
    } else if (filterProject !== 'all') {
      matchesProject = task.projectId === filterProject;
    }
    
    // Country filter
    let matchesCountry = true;
    if (filterCountry !== 'all') {
      const taskProjectId = taskProjectMap[task.id];
      if (taskProjectId) {
        const project = projects.find(p => p.id === taskProjectId);
        if (project && project.countryIds) {
          matchesCountry = project.countryIds.includes(filterCountry);
        } else {
          matchesCountry = false;
        }
      } else {
        // If task has no project, exclude it when filtering by country
        matchesCountry = false;
      }
    }
    
    // Department filter - based on assignee's department
    let matchesDepartment = true;
    if (filterDepartment !== 'all') {
      if (!task.assignee) {
        // If task has no assignee, exclude it when filtering by department
        matchesDepartment = false;
      } else {
        const assigneeUser = users[task.assignee];
        if (!assigneeUser || !assigneeUser.department) {
          // If assignee doesn't exist or has no department, exclude it
          matchesDepartment = false;
        } else {
          // Find the department by ID to get its name
          const selectedDept = departments.find(d => d.id === filterDepartment);
          if (selectedDept) {
            // Compare the assignee's department name with the selected department name
            matchesDepartment = assigneeUser.department === selectedDept.name;
          } else {
            matchesDepartment = false;
          }
        }
      }
    }
    
    // Apply preset filters
    let matchesPreset = true;
    if (filterPreset === 'due-today') {
      if (!task.dueDate) {
        matchesPreset = false;
      } else {
        try {
          const dueDate = new Date(task.dueDate);
          if (isNaN(dueDate.getTime())) {
            matchesPreset = false;
          } else {
            dueDate.setHours(0, 0, 0, 0);
            matchesPreset = dueDate.getTime() === today.getTime();
          }
        } catch {
          matchesPreset = false;
        }
      }
    } else if (filterPreset === 'overdue') {
      if (!task.dueDate) {
        matchesPreset = false;
      } else {
        try {
          const dueDate = new Date(task.dueDate);
          if (isNaN(dueDate.getTime())) {
            matchesPreset = false;
          } else {
            dueDate.setHours(0, 0, 0, 0);
            matchesPreset = dueDate.getTime() < today.getTime() && task.status !== 'done';
          }
        } catch {
          matchesPreset = false;
        }
      }
    }
    
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && matchesMe && matchesOverdue && matchesProject && matchesCountry && matchesDepartment && matchesPreset;
  });

  // Calculate stats based on filtered tasks
  const stats = {
    total: filteredTasks.length,
    completed: filteredTasks.filter(t => t.status === 'done').length,
    inProgress: filteredTasks.filter(t => t.status === 'in-progress').length,
    dueToday: filteredTasks.filter(t => {
      if (!t.dueDate) return false;
      try {
        const dueDate = new Date(t.dueDate);
        if (isNaN(dueDate.getTime())) return false;
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === today.getTime() && t.status !== 'done';
      } catch {
        return false;
      }
    }).length,
    overdue: filteredTasks.filter(t => {
      if (!t.dueDate) return false;
      try {
        const dueDate = new Date(t.dueDate);
        if (isNaN(dueDate.getTime())) return false;
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() < today.getTime() && t.status !== 'done';
      } catch {
        return false;
      }
    }).length,
    urgent: filteredTasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length,
    completionRate: filteredTasks.length > 0 ? (filteredTasks.filter(t => t.status === 'done').length / filteredTasks.length) * 100 : 0
  };

  const getUserName = (userId: string) => {
    return users[userId]?.displayName || userId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex overflow-x-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex-1 w-full min-w-0 ${sidebarOpen ? 'ml-0 md:ml-64' : 'ml-0 md:ml-20'} transition-all duration-300 ease-in-out p-2 sm:p-3 md:p-4 lg:p-6`}>
        <div className="w-full max-w-full space-y-3 sm:space-y-4">
          {/* Header with animated gradient */}
          <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 rounded-xl shadow-lg p-4 sm:p-5 text-white">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl font-bold mb-1 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse flex-shrink-0" />
                    <span className="truncate">Task Management</span>
                  </h1>
                  <p className="text-primary-100 text-xs sm:text-sm">
                    Stay organized, stay productive
              </p>
            </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                <button
                    onClick={handleRefresh}
                    disabled={refreshing || loading}
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all duration-200 border border-white/30 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Refresh tasks"
                  >
                    <RotateCcw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                </button>
                <button
                    onClick={() => setShowFocusMode(true)}
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all duration-200 border border-white/30 text-xs sm:text-sm"
                  >
                    <Timer className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Focus</span>
                </button>
                <button
                    onClick={() => setShowTaskForm(true)}
                    className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-white text-primary-600 rounded-lg hover:bg-primary-50 font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-xs sm:text-sm"
                  >
                    <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">New Task</span>
                    <span className="sm:hidden">New</span>
                </button>
                </div>
              </div>
              
              {/* Quick Stats in Header */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2 mt-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1.5 sm:p-2 border border-white/20">
                  <div className="text-base sm:text-lg md:text-xl font-bold">{stats.total}</div>
                  <div className="text-[9px] sm:text-[10px] md:text-xs text-primary-100">Total</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1.5 sm:p-2 border border-white/20">
                  <div className="text-base sm:text-lg md:text-xl font-bold text-green-300">{stats.completed}</div>
                  <div className="text-[9px] sm:text-[10px] md:text-xs text-primary-100">Done</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1.5 sm:p-2 border border-white/20">
                  <div className="text-base sm:text-lg md:text-xl font-bold text-yellow-300">{stats.inProgress}</div>
                  <div className="text-[9px] sm:text-[10px] md:text-xs text-primary-100">Active</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1.5 sm:p-2 border border-white/20 hidden sm:block">
                  <div className="text-base sm:text-lg md:text-xl font-bold text-orange-300">{stats.dueToday}</div>
                  <div className="text-[9px] sm:text-[10px] md:text-xs text-primary-100">Today</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1.5 sm:p-2 border border-white/20 hidden sm:block">
                  <div className="text-base sm:text-lg md:text-xl font-bold text-red-300">{stats.overdue}</div>
                  <div className="text-[9px] sm:text-[10px] md:text-xs text-primary-100">Overdue</div>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="animate-slide-down bg-red-50 border-l-4 border-red-400 p-2.5 sm:p-3 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-red-400 mr-2" />
                  <p className="text-xs sm:text-sm text-red-700">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {success && (
            <div className="animate-slide-down bg-green-50 border-l-4 border-green-400 p-2.5 sm:p-3 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-green-400 mr-2" />
                  <p className="text-xs sm:text-sm text-green-700">{success}</p>
                </div>
                <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <div className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-3 border-l-4 border-primary-500">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs font-medium text-gray-600 mb-0.5">Completion</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.completionRate.toFixed(0)}%</p>
                  </div>
                <div className="p-1.5 bg-primary-100 rounded-full group-hover:bg-primary-200 transition-colors flex-shrink-0 ml-2">
                  <Target className="h-4 w-4 text-primary-600" />
                </div>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-primary-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${stats.completionRate}%` }}
                ></div>
              </div>
            </div>

            <div className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-3 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs font-medium text-gray-600 mb-0.5">In Progress</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                  </div>
                <div className="p-1.5 bg-yellow-100 rounded-full group-hover:bg-yellow-200 transition-colors flex-shrink-0 ml-2">
                  <Activity className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-3 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs font-medium text-gray-600 mb-0.5">Urgent</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.urgent}</p>
                  </div>
                <div className="p-1.5 bg-red-100 rounded-full group-hover:bg-red-200 transition-colors flex-shrink-0 ml-2">
                  <Flame className="h-4 w-4 text-red-600" />
                </div>
              </div>
            </div>

            <div className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-3 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs font-medium text-gray-600 mb-0.5">Completed</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.completed}</p>
                  </div>
                <div className="p-1.5 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors flex-shrink-0 ml-2">
                  <Award className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Department Tabs */}
          <DepartmentTabs
            tasks={tasks}
            selectedDepartment={filterDepartment}
            onDepartmentChange={setFilterDepartment}
          />

          {/* View Selector and Filters */}
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 overflow-x-hidden">
            <div className="flex flex-col gap-2 sm:gap-3">
              {/* View Toggle and Search Row */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0">
                {/* View Toggle */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {[
                      { id: 'list', icon: List, label: 'List' },
                      { id: 'grid', icon: LayoutGrid, label: 'Grid' },
                      { id: 'kanban', icon: Columns, label: 'Kanban' },
                      { id: 'calendar', icon: CalendarIcon, label: 'Calendar' },
                      { id: 'analytics', icon: BarChart3, label: 'Analytics' }
                    ].map(({ id, icon: Icon, label }) => (
                      <button
                        key={id}
                        onClick={() => setView(id as ViewType)}
                        className={`flex items-center justify-center gap-1 px-1.5 sm:px-2 md:px-3 py-1.5 text-xs sm:text-sm transition-all duration-200 ${
                          view === id
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        } ${id === 'list' ? 'rounded-l-lg' : ''} ${id === 'analytics' ? 'rounded-r-lg' : ''}`}
                        title={label}
                      >
                        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="hidden xl:inline text-xs">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search and Quick Filters */}
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 overflow-x-auto">
                  <div className="relative flex-1 min-w-0 max-w-full">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                  <input
                    type="text"
                      placeholder="Search tasks... (⌘K)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full max-w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  
                  <button
                    onClick={() => setFilterMe(!filterMe)}
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 border rounded-lg transition-colors flex-shrink-0 text-sm ${
                      filterMe
                        ? 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                    title="Show only my tasks"
                  >
                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Me</span>
                  </button>
                  
                  <button
                    onClick={() => setFilterOverdue(!filterOverdue)}
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 border rounded-lg transition-colors flex-shrink-0 text-sm ${
                      filterOverdue
                        ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                    title="Show only overdue tasks"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Overdue</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                      setFilterPriority('all');
                      setFilterAssignee('all');
                      setFilterPreset('all');
                      setFilterDepartment('all');
                      setFilterProject('all');
                      setFilterCountry('all');
                      setFilterMe(false);
                      setFilterOverdue(false);
                    }}
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0 text-sm"
                    title="Reset all filters"
                  >
                    <ResetIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                  
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0 text-sm"
                  >
                    <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Filters</span>
                    {showFilters ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200 animate-slide-down">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-3">
                  {/* Filter Presets */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Quick Filters</label>
                    <select
                      value={filterPreset}
                      onChange={(e) => applyFilterPreset(e.target.value as FilterPreset)}
                      className="w-full text-sm py-1.5 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      <option value="all">All Tasks</option>
                      <option value="my-tasks">My Tasks</option>
                      <option value="urgent">Urgent</option>
                      <option value="due-today">Due Today</option>
                      <option value="overdue">Overdue</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                      className="w-full text-sm py-1.5 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="blocked">Blocked</option>
                <option value="done">Done</option>
              </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as typeof filterPriority)}
                      className="w-full text-sm py-1.5 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Project</label>
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                      className="w-full text-sm py-1.5 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="all">All Projects</option>
                <option value="no-project">No Project</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                ))}
              </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Country</label>
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                      className="w-full text-sm py-1.5 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="all">All Countries</option>
                      {countries.map(country => (
                        <option key={country.id} value={country.id}>
                          {country.flag} {country.name}
                        </option>
                ))}
              </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Assignee</label>
              <select
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                      className="w-full text-sm py-1.5 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="all">All Assignees</option>
                      {Array.from(new Set(tasks.map(t => t.assignee).filter(Boolean))).map(assignee => (
                        <option key={assignee} value={assignee}>
                          {getUserName(assignee)}
                        </option>
                ))}
              </select>
            </div>
                </div>
              </div>
            )}
            </div>
          </div>

          {/* Tasks View */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600"></div>
                <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary-600 animate-pulse" />
              </div>
            </div>
          ) : view === 'list' ? (
            <TaskList
              tasks={filteredTasks}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              users={users}
              selectedTaskIds={selectedTaskIds}
              onToggleTaskSelection={(taskId) => {
                setSelectedTaskIds(prev => 
                  prev.includes(taskId) 
                    ? prev.filter(id => id !== taskId)
                    : [...prev, taskId]
                );
              }}
              onSelectAll={() => {
                setSelectedTaskIds(filteredTasks.map(t => t.id));
              }}
              onDeselectAll={() => {
                setSelectedTaskIds([]);
              }}
            />
          ) : view === 'grid' ? (
            <TaskGrid
              tasks={filteredTasks}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              users={users}
              selectedTaskIds={selectedTaskIds}
              onToggleTaskSelection={(taskId) => {
                setSelectedTaskIds(prev => 
                  prev.includes(taskId) 
                    ? prev.filter(id => id !== taskId)
                    : [...prev, taskId]
                );
              }}
              onSelectAll={() => {
                setSelectedTaskIds(filteredTasks.map(t => t.id));
              }}
              onDeselectAll={() => {
                setSelectedTaskIds([]);
              }}
            />
          ) : view === 'kanban' ? (
            <TaskKanban
              tasks={filteredTasks}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              users={users}
              selectedTaskIds={selectedTaskIds}
              onToggleTaskSelection={(taskId) => {
                setSelectedTaskIds(prev => 
                  prev.includes(taskId) 
                    ? prev.filter(id => id !== taskId)
                    : [...prev, taskId]
                );
              }}
              onSelectAll={() => {
                setSelectedTaskIds(filteredTasks.map(t => t.id));
              }}
              onDeselectAll={() => {
                setSelectedTaskIds([]);
              }}
            />
          ) : view === 'calendar' ? (
            <TaskCalendar
              tasks={filteredTasks}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              users={users}
            />
          ) : (
            <TaskAnalytics
              tasks={tasks}
              filteredTasks={filteredTasks}
              stats={stats}
            />
          )}

          {filteredTasks.length === 0 && !loading && (
            <div className="text-center py-16 bg-white rounded-xl shadow-md">
              <div className="max-w-md mx-auto">
                <div className="p-4 bg-primary-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <CheckSquare className="h-10 w-10 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or create a new task</p>
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  <Plus className="h-5 w-5" />
                  Create New Task
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showTaskForm && (
        <TaskForm
          onSubmit={handleCreateTask}
          onClose={() => {
            setShowTaskForm(false);
            setSelectedTask(null);
          }}
          initialData={selectedTask || undefined}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}

      {showFocusMode && (
        <FocusMode
          tasks={filteredTasks.filter(t => t.status !== 'done')}
          onClose={() => setShowFocusMode(false)}
          onUpdateTask={handleUpdateTask}
        />
      )}

      {showQuickActions && (
        <QuickActions
          onClose={() => setShowQuickActions(false)}
          onCreateTask={() => {
            setShowQuickActions(false);
            setShowTaskForm(true);
          }}
          onFocusMode={() => {
            setShowQuickActions(false);
            setShowFocusMode(true);
          }}
        />
      )}

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedTasks={selectedTaskIds}
        tasks={tasks}
        onUpdateTasks={handleBulkUpdateTasks}
        onDeleteTasks={handleBulkDeleteTasks}
        onClearSelection={() => setSelectedTaskIds([])}
        users={users}
      />
    </div>
  );
}
