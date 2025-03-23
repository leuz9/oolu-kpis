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
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out p-8`}>
        <div className="max-w-7xl mx-auto">
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