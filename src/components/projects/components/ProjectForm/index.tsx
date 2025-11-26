import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Project } from '../../../../types';
import BasicInformation from './BasicInformation';
import DocumentList from './DocumentList';

interface ProjectFormProps {
  onSubmit: (project: Project | Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onClose: () => void;
  initialData?: Project | null;
}

export default function ProjectForm({ onSubmit, onClose, initialData }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    ...(initialData || {
      name: '',
      description: '',
      status: 'planning' as const,
      startDate: '',
      dueDate: '',
      managerId: '',
      department: '',
      progress: 0,
      teamMembers: [],
      objectives: [],
      tasks: [],
      documents: [],
      updates: []
    }),
    // Ensure arrays are initialized even if not present in initialData
    documents: initialData?.documents || [],
    teamMembers: initialData?.teamMembers || [],
    objectives: initialData?.objectives || [],
    tasks: initialData?.tasks || [],
    updates: initialData?.updates || [],
    countryIds: initialData?.countryIds || []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If we're editing, include the ID
    const submitData = initialData ? {
      ...formData,
      id: initialData.id
    } : formData;

    await onSubmit(submitData);
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDepartmentChange = (departmentId: string) => {
    setFormData(prev => ({
      ...prev,
      department: departmentId,
      // Reset team members when department changes
      teamMembers: []
    }));
  };

  const handleAddDocument = (document: { name: string; url: string; }) => {
    const newDocument = {
      id: Date.now().toString(),
      name: document.name,
      url: document.url,
      type: document.url.split('.').pop() || 'link',
      uploadedBy: 'current-user', // This would come from auth context in a real app
      uploadedAt: new Date().toISOString()
    };

    setFormData(prev => ({
      ...prev,
      documents: [...(prev.documents || []), newDocument]
    }));
  };

  const handleRemoveDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90vw] max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            {initialData ? 'Edit Project' : 'Create New Project'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <BasicInformation
            name={formData.name}
            description={formData.description}
            status={formData.status}
            managerId={formData.managerId}
            startDate={formData.startDate}
            dueDate={formData.dueDate}
            department={formData.department}
            countryIds={formData.countryIds}
            onChange={handleFieldChange}
            onDepartmentChange={handleDepartmentChange}
          />

          <DocumentList
            documents={formData.documents}
            onAdd={handleAddDocument}
            onRemove={handleRemoveDocument}
          />

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
            >
              {initialData ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}