import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../Sidebar';
import { taskService } from '../../services/taskService';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { Sparkles } from 'lucide-react';
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
import TaskHeader from './components/TaskHeader';
import TaskStats from './components/TaskStats';
import TaskAlerts from './components/TaskAlerts';
import TaskEmptyState from './components/TaskEmptyState';
import TaskFilters, { type ViewType, type FilterPreset } from './components/TaskFilters';
import FloatingActionButton from './components/FloatingActionButton';
import { projectService } from '../../services/projectService';
import { countryService } from '../../services/countryService';
import { departmentService } from '../../services/departmentService';

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
      if (filterDepartment === 'no-department') {
        // Filter for tasks without department (no assignee or assignee without department)
        if (!task.assignee) {
          matchesDepartment = true;
        } else {
          const assigneeUser = users[task.assignee];
          matchesDepartment = !assigneeUser || !assigneeUser.department;
        }
      } else {
        // Filter for specific department
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
          {/* Header */}
          <TaskHeader
            stats={stats}
            refreshing={refreshing}
            loading={loading}
            onRefresh={handleRefresh}
            onFocusMode={() => setShowFocusMode(true)}
            onCreateTask={() => setShowTaskForm(true)}
          />

          {/* Alerts */}
          <TaskAlerts
            error={error}
            success={success}
            onDismissError={() => setError(null)}
            onDismissSuccess={() => setSuccess(null)}
          />

          {/* Enhanced Stats Cards */}
          <TaskStats stats={stats} />

          {/* Department Tabs */}
          <DepartmentTabs
            tasks={tasks}
            selectedDepartment={filterDepartment}
            onDepartmentChange={setFilterDepartment}
            users={users}
            departments={departments}
          />

          {/* View Selector and Filters */}
          <TaskFilters
            view={view}
            onViewChange={setView}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterMe={filterMe}
            onFilterMeToggle={() => setFilterMe(!filterMe)}
            filterOverdue={filterOverdue}
            onFilterOverdueToggle={() => setFilterOverdue(!filterOverdue)}
            onResetFilters={() => {
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
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            filterPreset={filterPreset}
            onFilterPresetChange={applyFilterPreset}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
            filterPriority={filterPriority}
            onFilterPriorityChange={setFilterPriority}
            filterProject={filterProject}
            onFilterProjectChange={setFilterProject}
            filterCountry={filterCountry}
            onFilterCountryChange={setFilterCountry}
            filterAssignee={filterAssignee}
            onFilterAssigneeChange={setFilterAssignee}
            projects={projects}
            countries={countries}
            tasks={tasks}
            getUserName={getUserName}
          />

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
            <TaskEmptyState onCreateTask={() => setShowTaskForm(true)} />
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

      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => setShowTaskForm(true)} />
    </div>
  );
}
