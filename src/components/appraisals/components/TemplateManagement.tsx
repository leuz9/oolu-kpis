import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2,
  Eye, 
  FileText,
  Star,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { AppraisalService } from '../../../services/appraisalService';
import { SuccessModal } from './SuccessModal';
import type { AppraisalTemplate, AppraisalSection, AppraisalQuestion } from '../../../types';

export function TemplateManagement() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<AppraisalTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AppraisalTemplate | null>(null);
  const [showPreBuiltModal, setShowPreBuiltModal] = useState(false);
  const [viewingTemplate, setViewingTemplate] = useState<AppraisalTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<AppraisalTemplate | null>(null);
  const [successMessage, setSuccessMessage] = useState<{ title: string; message: string; details?: any[] } | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const templatesData = await AppraisalService.getTemplates();
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (templateData: Omit<AppraisalTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      await AppraisalService.createTemplate(templateData);
      setShowCreateModal(false);
      const questionCount = templateData.sections.reduce((total, s) => total + s.questions.length, 0);
      setSuccessMessage({
        title: 'Template Created!',
        message: `${templateData.name} has been successfully created.`,
        details: [
          { label: 'Sections', value: templateData.sections.length },
          { label: 'Questions', value: questionCount }
        ]
      });
      loadTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!deletingTemplate) return;
    
    try {
      setLoading(true);
      await AppraisalService.deleteTemplate(deletingTemplate.id);
      setDeletingTemplate(null);
      setSuccessMessage({
        title: 'Template Deleted!',
        message: `${deletingTemplate.name} has been successfully deleted.`,
        details: []
      });
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Appraisal Templates</h2>
          <p className="text-gray-600 mt-1">Create and manage appraisal templates for different roles and departments</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreBuiltModal(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Sparkles className="h-5 w-5" />
            Pre-Built Templates
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create Template
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FileText className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                  {template.isDefault && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Star className="h-3 w-3" />
                      Default
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{template.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Sections</span>
                <span className="font-medium text-gray-900">{template.sections.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Questions</span>
                <span className="font-medium text-gray-900">
                  {template.sections.reduce((total, section) => total + section.questions.length, 0)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setViewingTemplate(template)}
                className="flex items-center gap-1 px-3 py-1 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
              >
                <Eye className="h-4 w-4" />
                View
              </button>
              <button 
                onClick={() => setEditingTemplate(template)}
                className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
              <button 
                onClick={() => setDeletingTemplate(template)}
                className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-4">Create your first appraisal template to get started.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors mx-auto"
          >
            <Plus className="h-5 w-5" />
            Create Template
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingTemplate) && (
        <TemplateForm
          template={editingTemplate}
          onSubmit={editingTemplate ? 
            (data) => {/* Handle update */} : 
            handleCreateTemplate
          }
          onClose={() => {
            setShowCreateModal(false);
            setEditingTemplate(null);
          }}
          loading={loading}
        />
      )}

      {/* Pre-Built Templates Modal */}
      {showPreBuiltModal && (
        <PreBuiltTemplatesModal
          onClose={() => setShowPreBuiltModal(false)}
          onSelect={async (template) => {
            try {
              setLoading(true);
              await handleCreateTemplate(template);
              setShowPreBuiltModal(false);
            } catch (error) {
              console.error('Error creating template:', error);
            } finally {
              setLoading(false);
            }
          }}
        />
      )}

      {/* View Template Modal */}
      {viewingTemplate && (
        <ViewTemplateModal
          template={viewingTemplate}
          onClose={() => setViewingTemplate(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingTemplate && (
        <DeleteConfirmationModal
          template={deletingTemplate}
          onConfirm={handleDeleteTemplate}
          onCancel={() => setDeletingTemplate(null)}
          loading={loading}
        />
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={!!successMessage}
        title={successMessage?.title || ''}
        message={successMessage?.message || ''}
        details={successMessage?.details}
        icon={successMessage?.title.includes('Created') ? 'sparkles' : 'check'}
        onClose={() => setSuccessMessage(null)}
      />
    </div>
  );
}

// Template Form Component
interface TemplateFormProps {
  template?: AppraisalTemplate | null;
  onSubmit: (data: Omit<AppraisalTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
  loading: boolean;
}

function TemplateForm({ template, onSubmit, onClose, loading }: TemplateFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    isDefault: boolean;
    sections: AppraisalSection[];
  }>({
    name: template?.name || '',
    description: template?.description || '',
    isDefault: template?.isDefault || false,
    sections: template?.sections || []
  });

  const addSection = () => {
    const newSection: AppraisalSection = {
      id: `section-${Date.now()}`,
      title: '',
      description: '',
      weight: 0,
      questions: [],
      order: formData.sections.length
    };
    setFormData({ ...formData, sections: [...formData.sections, newSection] });
  };

  const removeSection = (index: number) => {
    const updatedSections = formData.sections.filter((_, i) => i !== index);
    setFormData({ ...formData, sections: updatedSections });
  };

  const updateSection = (index: number, field: keyof AppraisalSection, value: any) => {
    const updatedSections = [...formData.sections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setFormData({ ...formData, sections: updatedSections });
  };

  const addQuestion = (sectionIndex: number) => {
    const newQuestion: AppraisalQuestion = {
      id: `question-${Date.now()}`,
      text: '',
      type: 'rating',
      required: true,
      order: formData.sections[sectionIndex].questions.length
    };
    const updatedSections = [...formData.sections];
    updatedSections[sectionIndex].questions.push(newQuestion);
    setFormData({ ...formData, sections: updatedSections });
  };

  const removeQuestion = (sectionIndex: number, questionIndex: number) => {
    const updatedSections = [...formData.sections];
    updatedSections[sectionIndex].questions = updatedSections[sectionIndex].questions.filter((_, i) => i !== questionIndex);
    setFormData({ ...formData, sections: updatedSections });
  };

  const updateQuestion = (sectionIndex: number, questionIndex: number, field: keyof AppraisalQuestion, value: any) => {
    const updatedSections = [...formData.sections];
    updatedSections[sectionIndex].questions[questionIndex] = { 
      ...updatedSections[sectionIndex].questions[questionIndex], 
      [field]: value 
    };
    setFormData({ ...formData, sections: updatedSections });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Validate that total weight adds up to 100
    const totalWeight = formData.sections.reduce((sum, section) => sum + section.weight, 0);
    if (totalWeight !== 100) {
      alert('Section weights must add up to 100%');
      return;
    }
    
    onSubmit({
      ...formData,
      createdBy: user.id
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {template ? 'Edit Template' : 'Create New Template'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
              Set as default template
            </label>
          </div>

          {/* Sections */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Sections (Total Weight: {formData.sections.reduce((sum, s) => sum + s.weight, 0)}%)
              </label>
              <button
                type="button"
                onClick={addSection}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                + Add Section
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.sections.map((section, sectionIndex) => (
                <div key={section.id} className="border border-gray-300 rounded-md p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900">Section {sectionIndex + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeSection(sectionIndex)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Section Title"
                      value={section.title}
                      onChange={(e) => updateSection(sectionIndex, 'title', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                    
                    <textarea
                      placeholder="Section Description (optional)"
                      value={section.description || ''}
                      onChange={(e) => updateSection(sectionIndex, 'description', e.target.value)}
                      rows={2}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-700">Weight:</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={section.weight}
                        onChange={(e) => updateSection(sectionIndex, 'weight', parseInt(e.target.value) || 0)}
                        className="w-20 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>

                    {/* Questions */}
                    <div className="pl-4 border-l-2 border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium text-gray-600">Questions</label>
                        <button
                          type="button"
                          onClick={() => addQuestion(sectionIndex)}
                          className="text-xs text-primary-600 hover:text-primary-700"
                        >
                          + Add Question
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        {section.questions.map((question, questionIndex) => (
                          <div key={question.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                            <div className="flex-1 space-y-2">
                              <input
                                type="text"
                                placeholder="Question text"
                                value={question.text}
                                onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'text', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                                required
                              />
                              <div className="flex items-center gap-2">
                                <select
                                  value={question.type}
                                  onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'type', e.target.value)}
                                  className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                                >
                                  <option value="rating">Rating</option>
                                  <option value="text">Text</option>
                                  <option value="multiple-choice">Multiple Choice</option>
                                  <option value="yes-no">Yes/No</option>
                                  <option value="scale">Scale</option>
                                </select>
                                <label className="flex items-center gap-1 text-xs">
                                  <input
                                    type="checkbox"
                                    checked={question.required}
                                    onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'required', e.target.checked)}
                                    className="h-3 w-3"
                                  />
                                  Required
                                </label>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeQuestion(sectionIndex, questionIndex)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : (template ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Pre-Built Templates Modal
interface PreBuiltTemplatesModalProps {
  onClose: () => void;
  onSelect: (template: Omit<AppraisalTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

function PreBuiltTemplatesModal({ onClose, onSelect }: PreBuiltTemplatesModalProps) {
  const { user } = useAuth();

  const preBuiltTemplates: Array<Omit<AppraisalTemplate, 'id' | 'createdAt' | 'updatedAt'>> = [
    {
      name: 'General Employee Performance Review',
      description: 'Comprehensive performance evaluation for general employees covering job responsibilities, competencies, and development',
      isDefault: false,
      createdBy: user?.id || '',
      sections: [
        {
          id: 'section-1',
          title: 'Job Performance',
          description: 'Evaluation of job-specific responsibilities and outcomes',
          weight: 40,
          order: 0,
          questions: [
            {
              id: 'q1',
              text: 'How effectively does the employee meet job responsibilities and deliverables?',
              type: 'rating',
              required: true,
              order: 0
            },
            {
              id: 'q2',
              text: 'Quality of work produced',
              type: 'rating',
              required: true,
              order: 1
            },
            {
              id: 'q3',
              text: 'Ability to meet deadlines',
              type: 'rating',
              required: true,
              order: 2
            },
            {
              id: 'q4',
              text: 'Describe key achievements during this period',
              type: 'text',
              required: true,
              order: 3
            }
          ]
        },
        {
          id: 'section-2',
          title: 'Core Competencies',
          description: 'Assessment of essential workplace competencies',
          weight: 30,
          order: 1,
          questions: [
            {
              id: 'q5',
              text: 'Communication skills',
              type: 'rating',
              required: true,
              order: 0
            },
            {
              id: 'q6',
              text: 'Teamwork and collaboration',
              type: 'rating',
              required: true,
              order: 1
            },
            {
              id: 'q7',
              text: 'Problem-solving ability',
              type: 'rating',
              required: true,
              order: 2
            },
            {
              id: 'q8',
              text: 'Initiative and proactiveness',
              type: 'rating',
              required: true,
              order: 3
            }
          ]
        },
        {
          id: 'section-3',
          title: 'Professional Development',
          description: 'Growth and learning opportunities',
          weight: 20,
          order: 2,
          questions: [
            {
              id: 'q9',
              text: 'Commitment to continuous learning',
              type: 'rating',
              required: true,
              order: 0
            },
            {
              id: 'q10',
              text: 'What skills would you like to develop further?',
              type: 'text',
              required: false,
              order: 1
            }
          ]
        },
        {
          id: 'section-4',
          title: 'Goals for Next Period',
          description: 'Objectives and targets for the upcoming period',
          weight: 10,
          order: 3,
          questions: [
            {
              id: 'q11',
              text: 'List 3-5 key goals for the next review period',
              type: 'text',
              required: true,
              order: 0
            }
          ]
        }
      ]
    },
    {
      name: 'Manager Performance Review',
      description: 'Specialized evaluation for managers focusing on leadership, team management, and strategic thinking',
      isDefault: false,
      createdBy: user?.id || '',
      sections: [
        {
          id: 'section-1',
          title: 'Leadership & People Management',
          description: 'Effectiveness in leading and developing team members',
          weight: 35,
          order: 0,
          questions: [
            {
              id: 'q1',
              text: 'Ability to motivate and inspire team members',
              type: 'rating',
              required: true,
              order: 0
            },
            {
              id: 'q2',
              text: 'Effectiveness in coaching and developing direct reports',
              type: 'rating',
              required: true,
              order: 1
            },
            {
              id: 'q3',
              text: 'Team performance and productivity',
              type: 'rating',
              required: true,
              order: 2
            },
            {
              id: 'q4',
              text: 'Conflict resolution and problem-solving',
              type: 'rating',
              required: true,
              order: 3
            }
          ]
        },
        {
          id: 'section-2',
          title: 'Strategic Planning & Execution',
          description: 'Strategic thinking and execution capabilities',
          weight: 30,
          order: 1,
          questions: [
            {
              id: 'q5',
              text: 'Strategic planning and vision setting',
              type: 'rating',
              required: true,
              order: 0
            },
            {
              id: 'q6',
              text: 'Ability to execute on strategic initiatives',
              type: 'rating',
              required: true,
              order: 1
            },
            {
              id: 'q7',
              text: 'Resource allocation and optimization',
              type: 'rating',
              required: true,
              order: 2
            }
          ]
        },
        {
          id: 'section-3',
          title: 'Communication & Stakeholder Management',
          description: 'Communication effectiveness across all levels',
          weight: 20,
          order: 2,
          questions: [
            {
              id: 'q8',
              text: 'Communication with senior leadership',
              type: 'rating',
              required: true,
              order: 0
            },
            {
              id: 'q9',
              text: 'Cross-functional collaboration',
              type: 'rating',
              required: true,
              order: 1
            },
            {
              id: 'q10',
              text: 'Transparency and information sharing',
              type: 'rating',
              required: true,
              order: 2
            }
          ]
        },
        {
          id: 'section-4',
          title: 'Results & Impact',
          description: 'Business outcomes and organizational impact',
          weight: 15,
          order: 3,
          questions: [
            {
              id: 'q11',
              text: 'Achievement of departmental goals',
              type: 'rating',
              required: true,
              order: 0
            },
            {
              id: 'q12',
              text: 'Key accomplishments and measurable impact',
              type: 'text',
              required: true,
              order: 1
            }
          ]
        }
      ]
    },
    {
      name: 'Technical Skills Assessment',
      description: 'Focused evaluation for technical roles including software development, engineering, and IT',
      isDefault: false,
      createdBy: user?.id || '',
      sections: [
        {
          id: 'section-1',
          title: 'Technical Expertise',
          description: 'Core technical skills and knowledge',
          weight: 40,
          order: 0,
          questions: [
            {
              id: 'q1',
              text: 'Technical proficiency in primary technologies/tools',
              type: 'rating',
              required: true,
              order: 0
            },
            {
              id: 'q2',
              text: 'Code quality and best practices adherence',
              type: 'rating',
              required: true,
              order: 1
            },
            {
              id: 'q3',
              text: 'Problem-solving and debugging skills',
              type: 'rating',
              required: true,
              order: 2
            },
            {
              id: 'q4',
              text: 'System design and architecture understanding',
              type: 'rating',
              required: true,
              order: 3
            }
          ]
        },
        {
          id: 'section-2',
          title: 'Innovation & Learning',
          description: 'Continuous improvement and technical growth',
          weight: 25,
          order: 1,
          questions: [
            {
              id: 'q5',
              text: 'Adoption of new technologies and methodologies',
              type: 'rating',
              required: true,
              order: 0
            },
            {
              id: 'q6',
              text: 'Contribution to technical innovation',
              type: 'rating',
              required: true,
              order: 1
            },
            {
              id: 'q7',
              text: 'What new technologies or skills did you learn?',
              type: 'text',
              required: false,
              order: 2
            }
          ]
        },
        {
          id: 'section-3',
          title: 'Collaboration & Documentation',
          description: 'Teamwork and knowledge sharing',
          weight: 20,
          order: 2,
          questions: [
            {
              id: 'q8',
              text: 'Code reviews and peer collaboration',
              type: 'rating',
              required: true,
              order: 0
            },
            {
              id: 'q9',
              text: 'Technical documentation quality',
              type: 'rating',
              required: true,
              order: 1
            },
            {
              id: 'q10',
              text: 'Knowledge sharing and mentoring',
              type: 'rating',
              required: true,
              order: 2
            }
          ]
        },
        {
          id: 'section-4',
          title: 'Delivery & Impact',
          description: 'Project delivery and business value',
          weight: 15,
          order: 3,
          questions: [
            {
              id: 'q11',
              text: 'On-time delivery of technical projects',
              type: 'rating',
              required: true,
              order: 0
            },
            {
              id: 'q12',
              text: 'Technical decisions impact on business outcomes',
              type: 'rating',
              required: true,
              order: 1
            }
          ]
        }
      ]
    },
    {
      name: 'Sales Performance Review',
      description: 'Comprehensive evaluation for sales professionals focused on targets, customer relationships, and sales skills',
      isDefault: false,
      createdBy: user?.id || '',
      sections: [
        {
          id: 'section-1',
          title: 'Sales Performance',
          description: 'Achievement against sales targets and metrics',
          weight: 45,
          order: 0,
          questions: [
            {
              id: 'q1',
              text: 'Achievement of sales quota/targets',
              type: 'rating',
              required: true,
              order: 0
            },
            {
              id: 'q2',
              text: 'Revenue generation and growth',
              type: 'rating',
              required: true,
              order: 1
            },
            {
              id: 'q3',
              text: 'New customer acquisition',
              type: 'rating',
              required: true,
              order: 2
            },
            {
              id: 'q4',
              text: 'List key deals closed and their impact',
              type: 'text',
              required: true,
              order: 3
            }
          ]
        },
        {
          id: 'section-2',
          title: 'Customer Relationships',
          description: 'Client satisfaction and relationship management',
          weight: 25,
          order: 1,
          questions: [
            {
              id: 'q5',
              text: 'Customer satisfaction and retention',
              type: 'rating',
              required: true,
              order: 0
            },
            {
              id: 'q6',
              text: 'Account management and upselling',
              type: 'rating',
              required: true,
              order: 1
            },
            {
              id: 'q7',
              text: 'Customer advocacy and referrals',
              type: 'rating',
              required: true,
              order: 2
            }
          ]
        },
        {
          id: 'section-3',
          title: 'Sales Skills & Process',
          description: 'Sales methodology and professional skills',
          weight: 20,
          order: 2,
          questions: [
            {
              id: 'q8',
              text: 'Prospecting and lead generation',
              type: 'rating',
              required: true,
              order: 0
            },
            {
              id: 'q9',
              text: 'Negotiation and closing skills',
              type: 'rating',
              required: true,
              order: 1
            },
            {
              id: 'q10',
              text: 'CRM usage and pipeline management',
              type: 'rating',
              required: true,
              order: 2
            }
          ]
        },
        {
          id: 'section-4',
          title: 'Professional Development',
          description: 'Growth and continuous improvement',
          weight: 10,
          order: 3,
          questions: [
            {
              id: 'q11',
              text: 'Product knowledge and industry expertise',
              type: 'rating',
              required: true,
              order: 0
            },
            {
              id: 'q12',
              text: 'What sales skills would you like to improve?',
              type: 'text',
              required: false,
              order: 1
            }
          ]
        }
      ]
    },
    {
      name: 'Leadership Assessment',
      description: 'Specialized evaluation for senior leaders and executives focusing on vision, strategy, and organizational impact',
      isDefault: false,
      createdBy: user?.id || '',
      sections: [
        {
          id: 'section-1',
          title: 'Vision & Strategy',
          description: 'Strategic leadership and vision setting',
          weight: 35,
          order: 0,
          questions: [
            {
              id: 'q1',
              text: 'Development and communication of organizational vision',
              type: 'rating',
              required: true,
              order: 0
            },
            {
              id: 'q2',
              text: 'Strategic planning and long-term thinking',
              type: 'rating',
              required: true,
              order: 1
            },
            {
              id: 'q3',
              text: 'Market awareness and competitive positioning',
              type: 'rating',
              required: true,
              order: 2
            }
          ]
        },
        {
          id: 'section-2',
          title: 'Organizational Leadership',
          description: 'Leading and developing the organization',
          weight: 30,
          order: 1,
          questions: [
            {
              id: 'q4',
              text: 'Building and developing high-performing teams',
              type: 'rating',
              required: true,
              order: 0
            },
            {
              id: 'q5',
              text: 'Change management and organizational transformation',
              type: 'rating',
              required: true,
              order: 1
            },
            {
              id: 'q6',
              text: 'Culture building and employee engagement',
              type: 'rating',
              required: true,
              order: 2
            }
          ]
        },
        {
          id: 'section-3',
          title: 'Business Impact',
          description: 'Measurable business outcomes and results',
          weight: 25,
          order: 2,
          questions: [
            {
              id: 'q7',
              text: 'Financial performance and business growth',
              type: 'rating',
              required: true,
              order: 0
            },
            {
              id: 'q8',
              text: 'Operational excellence and efficiency',
              type: 'rating',
              required: true,
              order: 1
            },
            {
              id: 'q9',
              text: 'Key strategic initiatives and their outcomes',
              type: 'text',
              required: true,
              order: 2
            }
          ]
        },
        {
          id: 'section-4',
          title: 'Stakeholder Management',
          description: 'External relationships and influence',
          weight: 10,
          order: 3,
          questions: [
            {
              id: 'q10',
              text: 'Board and investor relations',
              type: 'rating',
              required: true,
              order: 0
            },
            {
              id: 'q11',
              text: 'External partnerships and ecosystem development',
              type: 'rating',
              required: true,
              order: 1
            }
          ]
        }
      ]
    }
  ];

  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  const handleSelect = () => {
    if (selectedTemplate !== null) {
      onSelect(preBuiltTemplates[selectedTemplate]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Pre-Built Templates
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Select a ready-to-use template and customize it as needed
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {preBuiltTemplates.map((template, index) => (
              <button
                key={index}
                onClick={() => setSelectedTemplate(index)}
                className={`text-left p-6 rounded-lg border-2 transition-all ${
                  selectedTemplate === index
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                  </div>
                  {selectedTemplate === index && (
                    <CheckCircle className="h-6 w-6 text-purple-600 flex-shrink-0 ml-3" />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Sections:</span>
                    <span className="font-medium text-gray-900">{template.sections.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Questions:</span>
                    <span className="font-medium text-gray-900">
                      {template.sections.reduce((total, section) => total + section.questions.length, 0)}
                    </span>
                  </div>
                </div>

                {/* Section Preview */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-600 mb-2">Sections:</p>
                  <div className="space-y-1">
                    {template.sections.map((section, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-gray-700">{section.title}</span>
                        <span className="text-gray-500">{section.weight}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={selectedTemplate === null}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <CheckCircle className="h-4 w-4" />
            Use This Template
          </button>
        </div>
      </div>
    </div>
  );
}

// View Template Modal
interface ViewTemplateModalProps {
  template: AppraisalTemplate;
  onClose: () => void;
}

function ViewTemplateModal({ template, onClose }: ViewTemplateModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-600" />
              {template.name}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Template Info */}
          <div className="mb-6 flex items-center gap-4">
            {template.isDefault && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <Star className="h-4 w-4" />
                Default Template
              </span>
            )}
            <span className="text-sm text-gray-600">
              {template.sections.length} sections • {template.sections.reduce((total, s) => total + s.questions.length, 0)} questions
            </span>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {template.sections
              .sort((a, b) => a.order - b.order)
              .map((section, sectionIndex) => (
                <div key={section.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          Section {sectionIndex + 1}: {section.title}
                        </h4>
                        <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded">
                          {section.weight}% weight
                        </span>
                      </div>
                      {section.description && (
                        <p className="text-sm text-gray-600">{section.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Questions */}
                  <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                    {section.questions
                      .sort((a, b) => a.order - b.order)
                      .map((question, questionIndex) => (
                        <div key={question.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                Q{questionIndex + 1}: {question.text}
                                {question.required && <span className="text-red-500 ml-1">*</span>}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {question.type.charAt(0).toUpperCase() + question.type.slice(1).replace('-', ' ')}
                            </span>
                            {question.required && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                                Required
                              </span>
                            )}
                          </div>

                          {question.type === 'multiple-choice' && question.options && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-gray-600 mb-2">Options:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {question.options.map((option, idx) => (
                                  <li key={idx} className="text-sm text-gray-700">{option}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {question.type === 'scale' && question.scale && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-gray-600 mb-2">
                                Scale: {question.scale.min} to {question.scale.max}
                              </p>
                              <div className="flex justify-between text-xs text-gray-600">
                                {question.scale.labels.map((label, idx) => (
                                  <span key={idx}>{label}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Delete Confirmation Modal
interface DeleteConfirmationModalProps {
  template: AppraisalTemplate;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

function DeleteConfirmationModal({ template, onConfirm, onCancel, loading }: DeleteConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6">
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>

          {/* Title and Message */}
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
            Delete Template?
          </h3>
          <p className="text-sm text-gray-600 text-center mb-4">
            Are you sure you want to delete <strong>"{template.name}"</strong>? This action cannot be undone.
          </p>

          {/* Warning if default */}
          {template.isDefault && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Warning</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    This is a default template. Deleting it may affect existing appraisals.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Template Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Sections:</span>
              <span className="font-medium text-gray-900">{template.sections.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total Questions:</span>
              <span className="font-medium text-gray-900">
                {template.sections.reduce((total, section) => total + section.questions.length, 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 rounded-b-lg">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            {loading ? 'Deleting...' : 'Delete Template'}
          </button>
        </div>
      </div>
    </div>
  );
}
