import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import { projectService } from '../../services/projectService';
import { Plus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { Project } from '../../types';
import ProjectForm from './components/ProjectForm';
import ProjectList from './components/ProjectList';
import ProjectFilters from './components/ProjectFilters';
import ProjectStats from './components/ProjectStats';
import DeleteConfirmModal from './components/DeleteConfirmModal';

export default function Projects() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterProgress, setFilterProgress] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [filterHasTasks, setFilterHasTasks] = useState('all');
  const [showActions, setShowActions] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const fetchedProjects = await projectService.getProjects();
      console.log('Fetched projects:', fetchedProjects);
      setProjects(fetchedProjects);
    } catch (err) {
      setError('Failed to load projects. Please try again later.');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('Adding project with data:', projectData);
      await projectService.addProject(projectData);
      setSuccess('Project created successfully');
      setShowForm(false);
      fetchProjects(); // Refresh projects list
    } catch (err) {
      setError('Failed to create project. Please try again.');
      console.error('Error adding project:', err);
    }
  };

  const handleEditProject = async (projectData: Project) => {
    try {
      console.log('Editing project with data:', projectData);
      
      // Only send the fields that should be updated
      const updateData = {
        name: projectData.name,
        description: projectData.description,
        status: projectData.status,
        startDate: projectData.startDate,
        dueDate: projectData.dueDate,
        progress: projectData.progress,
        managerId: projectData.managerId,
        department: projectData.department,
        countryIds: projectData.countryIds || [], // Ensure countryIds array exists
        documents: projectData.documents || [], // Ensure documents array exists
        teamMembers: projectData.teamMembers || [] // Ensure teamMembers array exists
      };

      console.log('Update data being sent:', updateData);
      await projectService.updateProject(projectData.id, updateData);
      setSuccess('Project updated successfully');
      setEditingProject(null);
      fetchProjects(); // Refresh projects list
    } catch (err) {
      setError('Failed to update project. Please try again.');
      console.error('Error updating project:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    try {
      console.log('Deleting project:', projectToDelete);
      await projectService.deleteProject(projectToDelete);
      setSuccess('Project deleted successfully');
      setProjectToDelete(null);
      fetchProjects(); // Refresh projects list
    } catch (err) {
      setError('Failed to delete project. Please try again.');
      console.error('Error deleting project:', err);
    }
  };

  const filteredProjects = projects.filter(project => {
    // Search filter
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    
    // Country filter
    const matchesCountry = filterCountry === 'all' || 
      (project.countryIds && project.countryIds.includes(filterCountry));
    
    // Department filter
    const matchesDepartment = filterDepartment === 'all' || 
      project.department === filterDepartment;
    
    // Progress filter
    let matchesProgress = true;
    if (filterProgress !== 'all') {
      const progress = project.progress || 0;
      switch (filterProgress) {
        case '0-25':
          matchesProgress = progress >= 0 && progress <= 25;
          break;
        case '25-50':
          matchesProgress = progress > 25 && progress <= 50;
          break;
        case '50-75':
          matchesProgress = progress > 50 && progress <= 75;
          break;
        case '75-100':
          matchesProgress = progress > 75 && progress < 100;
          break;
        case '100':
          matchesProgress = progress >= 100;
          break;
      }
    }
    
    // Date filter
    let matchesDate = true;
    if (filterDate !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(project.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (filterDate) {
        case 'overdue':
          matchesDate = dueDate < today && project.status !== 'completed';
          break;
        case 'due-today':
          matchesDate = daysDiff === 0;
          break;
        case 'due-week':
          matchesDate = daysDiff >= 0 && daysDiff <= 7;
          break;
        case 'due-month':
          matchesDate = daysDiff >= 0 && daysDiff <= 30;
          break;
        case 'upcoming':
          matchesDate = daysDiff > 30;
          break;
      }
    }
    
    // Has tasks filter
    let matchesHasTasks = true;
    if (filterHasTasks !== 'all') {
      const hasTasks = (project.tasks && project.tasks.length > 0);
      matchesHasTasks = filterHasTasks === 'with-tasks' ? hasTasks : !hasTasks;
    }
    
    return matchesSearch && matchesStatus && matchesCountry && matchesDepartment && 
           matchesProgress && matchesDate && matchesHasTasks;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex-1 w-full ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out p-3 sm:p-4 lg:p-6`}>
        <div className="w-full">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage and track your organization's projects
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Project
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4 rounded">
              <div className="flex">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          <ProjectStats projects={projects} />

          <ProjectFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterStatus={filterStatus}
            onStatusChange={setFilterStatus}
            filterCountry={filterCountry}
            onCountryChange={setFilterCountry}
            filterDepartment={filterDepartment}
            onDepartmentChange={setFilterDepartment}
            filterProgress={filterProgress}
            onProgressChange={setFilterProgress}
            filterDate={filterDate}
            onDateChange={setFilterDate}
            filterHasTasks={filterHasTasks}
            onHasTasksChange={setFilterHasTasks}
          />

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <ProjectList
              projects={filteredProjects}
              onEdit={setEditingProject}
              onDelete={setProjectToDelete}
              showActions={showActions}
              onShowActions={setShowActions}
            />
          )}
        </div>
      </div>

      {(showForm || editingProject) && (
        <ProjectForm
          onClose={() => {
            setShowForm(false);
            setEditingProject(null);
          }}
          onSubmit={editingProject ? handleEditProject : handleAddProject}
          initialData={editingProject}
        />
      )}

      {projectToDelete && (
        <DeleteConfirmModal
          onConfirm={handleDeleteConfirm}
          onCancel={() => setProjectToDelete(null)}
        />
      )}
    </div>
  );
}