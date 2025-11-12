import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Calendar, 
  Star, 
  CheckCircle, 
  Edit,
  Save,
  Target,
  TrendingUp,
  Award,
  Users,
  FileText,
  Download
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { AppraisalService } from '../../../services/appraisalService';
import { userService } from '../../../services/userService';
import { AppraisalReviewModal } from './AppraisalReviewModal';
import { SuccessModal } from './SuccessModal';
import type { Appraisal, User as UserType, AppraisalGoal, AppraisalCompetency, AppraisalTemplate } from '../../../types';

interface AppraisalDetailModalProps {
  appraisal: Appraisal;
  onClose: () => void;
  onRefresh: () => void;
}

export function AppraisalDetailModal({ appraisal, onClose, onRefresh }: AppraisalDetailModalProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState<UserType | null>(null);
  const [manager, setManager] = useState<UserType | null>(null);
  const [template, setTemplate] = useState<AppraisalTemplate | null>(null);
  const [goals, setGoals] = useState<AppraisalGoal[]>(appraisal.goals || []);
  const [competencies, setCompetencies] = useState<AppraisalCompetency[]>(appraisal.competencies || []);
  const [overallRating, setOverallRating] = useState<number>(appraisal.overallRating || 0);
  const [comments, setComments] = useState<string>(appraisal.comments || '');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewType, setReviewType] = useState<'self' | 'manager' | 'hr'>('self');
  const [successMessage, setSuccessMessage] = useState<{ title: string; message: string; details?: any[] } | null>(null);

  // Check if current user is viewing their own appraisal (as employee)
  // This includes managers viewing their own self-review
  const isEmployeeViewingOwnAppraisal = user?.id === appraisal.employeeId;

  // Debug logs
  useEffect(() => {
    console.log('=== AppraisalDetailModal Debug ===');
    console.log('User ID:', user?.id);
    console.log('User Role:', user?.role);
    console.log('Appraisal Employee ID:', appraisal.employeeId);
    console.log('Appraisal Manager ID:', appraisal.managerId);
    console.log('Is Employee Viewing Own:', isEmployeeViewingOwnAppraisal);
    console.log('Has Self Review:', !!appraisal.selfReview);
    console.log('Has Manager Review:', !!appraisal.managerReview);
    console.log('Self Review:', appraisal.selfReview);
    console.log('Manager Review:', appraisal.managerReview);
    console.log('==================================');
  }, [user?.id, appraisal.employeeId, appraisal.managerId, appraisal.selfReview, appraisal.managerReview]);

  useEffect(() => {
    loadUsers();
    loadTemplate();
  }, []);

  const loadUsers = async () => {
    try {
      const promises = [];
      
      // Load employee
      if (appraisal.employeeId && typeof appraisal.employeeId === 'string' && appraisal.employeeId.trim()) {
        promises.push(
          userService.getUser(appraisal.employeeId)
            .then(data => setEmployee(data))
            .catch(err => {
              console.error('Error loading employee:', appraisal.employeeId, err);
              setEmployee(null);
            })
        );
      }

      // Load manager
      if (appraisal.managerId && typeof appraisal.managerId === 'string' && appraisal.managerId.trim()) {
        promises.push(
          userService.getUser(appraisal.managerId)
            .then(data => setManager(data))
            .catch(err => {
              console.error('Error loading manager:', appraisal.managerId, err);
              setManager(null);
            })
        );
      }

      if (promises.length > 0) {
        await Promise.all(promises);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadTemplate = async () => {
    try {
      const templateData = await AppraisalService.getTemplate(appraisal.templateId);
      setTemplate(templateData);
    } catch (error) {
      console.error('Error loading template:', error);
    }
  };

  const addGoal = () => {
    const newGoal: AppraisalGoal = {
      id: `goal-${Date.now()}`,
      title: '',
      description: '',
      target: '',
      actual: '',
      rating: 3,
      status: 'not-achieved',
      comments: ''
    };
    setGoals([...goals, newGoal]);
  };

  const updateGoal = (index: number, field: keyof AppraisalGoal, value: any) => {
    const updatedGoals = [...goals];
    updatedGoals[index] = { ...updatedGoals[index], [field]: value };
    setGoals(updatedGoals);
  };

  const removeGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const addCompetency = () => {
    const newCompetency: AppraisalCompetency = {
      id: `competency-${Date.now()}`,
      name: '',
      description: '',
      level: 'intermediate',
      rating: 3,
      evidence: '',
      developmentNeeds: ''
    };
    setCompetencies([...competencies, newCompetency]);
  };

  const updateCompetency = (index: number, field: keyof AppraisalCompetency, value: any) => {
    const updatedCompetencies = [...competencies];
    updatedCompetencies[index] = { ...updatedCompetencies[index], [field]: value };
    setCompetencies(updatedCompetencies);
  };

  const removeCompetency = (index: number) => {
    setCompetencies(competencies.filter((_, i) => i !== index));
  };

  const formatDate = (date: any): string => {
    if (!date) return 'N/A';
    try {
      // Handle Firestore Timestamp
      if (date?.toDate && typeof date.toDate === 'function') {
        return date.toDate().toLocaleDateString();
      }
      // Handle string or Date object
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'N/A';
      }
      return dateObj.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      await Promise.all([
        AppraisalService.updateGoals(appraisal.id, goals),
        AppraisalService.updateCompetencies(appraisal.id, competencies),
        AppraisalService.updateAppraisal(appraisal.id, {
          overallRating,
          comments
        })
      ]);
      setIsEditing(false);
      setSuccessMessage({
        title: 'Changes Saved!',
        message: 'The appraisal has been successfully updated.',
        details: [
          { label: 'Goals', value: goals.length },
          { label: 'Competencies', value: competencies.length },
          { label: 'Rating', value: overallRating > 0 ? `${overallRating.toFixed(1)} ⭐` : 'Not set' }
        ]
      });
      onRefresh();
    } catch (error) {
      console.error('Error saving appraisal:', error);
      alert('Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  const handleImportObjectives = async () => {
    if (!appraisal.employeeId) {
      alert('Employee ID not found');
      return;
    }

    try {
      setLoading(true);
      const importedGoals = await AppraisalService.importEmployeeObjectives(appraisal.employeeId);
      
      if (importedGoals.length === 0) {
        alert('No objectives found for this employee');
        return;
      }

      setGoals(importedGoals);
      setIsEditing(true);
      setSuccessMessage({
        title: 'Objectives Imported!',
        message: `Successfully imported ${importedGoals.length} objective(s) as goals.`,
        details: [
          { label: 'Objectives Imported', value: importedGoals.length },
          { label: 'Employee', value: employee?.displayName || appraisal.employeeId }
        ]
      });
    } catch (error) {
      console.error('Error importing objectives:', error);
      alert('Failed to import objectives');
    } finally {
      setLoading(false);
    }
  };

  const canEdit = user?.id === appraisal.managerId || user?.isAdmin;
  
  // Check if template allows self review and user is the employee
  const canStartSelfReview = user?.id === appraisal.employeeId && 
    appraisal.status === 'draft' && 
    template?.reviewType && 
    (template.reviewType === 'self' || template.reviewType === 'both');
  
  // Check if template allows manager review and user is the manager
  const canStartManagerReview = user?.id === appraisal.managerId && 
    template?.reviewType && 
    (template.reviewType === 'manager' || template.reviewType === 'both') &&
    (
      // For "both" type: manager can start after self-review
      (template.reviewType === 'both' && appraisal.status === 'self-review') ||
      // For "manager" type: manager can start directly from draft
      (template.reviewType === 'manager' && appraisal.status === 'draft')
    );
  
  // Remove HR review functionality
  const canStartHRReview = false;

  const handleStartReview = (type: 'self' | 'manager' | 'hr') => {
    setReviewType(type);
    setShowReviewModal(true);
  };

  const getStatusColor = (status: Appraisal['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'self-review': return 'bg-blue-100 text-blue-800';
      case 'manager-review': return 'bg-yellow-100 text-yellow-800';
      case 'hr-review': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number, editable: boolean = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-5 w-5 ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            } ${editable ? 'cursor-pointer' : ''}`}
            onClick={() => editable && onChange && onChange(i + 1)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary-100 rounded-lg">
              <FileText className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Appraisal Details</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appraisal.status)}`}>
                  {appraisal.status.charAt(0).toUpperCase() + appraisal.status.slice(1).replace('-', ' ')}
                </span>
                <span className="text-sm text-gray-500">
                  Last updated: {formatDate(appraisal.updatedAt)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
            )}
            {isEditing && (
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Saving...' : 'Save'}
              </button>
            )}
            {canStartSelfReview && (
              <button
                onClick={() => handleStartReview('self')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                Start Self Review
              </button>
            )}
            {canStartManagerReview && (
              <button
                onClick={() => handleStartReview('manager')}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                Start Manager Review
              </button>
            )}
            {canStartHRReview && (
              <button
                onClick={() => handleStartReview('hr')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                Start HR Review
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Employee Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <User className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Employee</h3>
              </div>
              <p className="text-lg font-medium text-gray-900">
                {employee?.displayName || appraisal.employeeId || 'N/A'}
              </p>
              {employee && (
                <>
                  <p className="text-sm text-gray-600">{employee.email}</p>
                  <p className="text-sm text-gray-600">{employee.department}</p>
                </>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Manager</h3>
              </div>
              <p className="text-lg font-medium text-gray-900">
                {manager?.displayName || appraisal.managerId || 'N/A'}
              </p>
              {manager && (
                <p className="text-sm text-gray-600">{manager.email}</p>
              )}
            </div>
          </div>

          {/* Overall Rating */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <h3 className="font-semibold text-gray-900">Overall Rating</h3>
              </div>
              {isEditing ? (
                renderStars(overallRating, true, setOverallRating)
              ) : (
                <div className="flex items-center gap-2">
                  {renderStars(overallRating)}
                  <span className="text-lg font-bold text-gray-900">{overallRating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {isEditing ? (
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Overall comments..."
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            ) : (
              comments && <p className="text-gray-700">{comments}</p>
            )}
          </div>

          {/* Goals */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold text-gray-900">Goals ({goals.length})</h3>
              </div>
              <div className="flex items-center gap-2">
                {(canEdit || isEditing) && (
                  <button
                    onClick={handleImportObjectives}
                    disabled={loading}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1 rounded transition-colors disabled:opacity-50"
                    title="Import employee's objectives as goals"
                  >
                    <Download className="h-4 w-4" />
                    {goals.length === 0 ? 'Import Objectives' : 'Reload Objectives'}
                  </button>
                )}
                {isEditing && (
                  <button
                    onClick={addGoal}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    + Add Goal
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {goals.map((goal, index) => (
                <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      {isEditing ? (
                        <input
                          type="text"
                          value={goal.title}
                          onChange={(e) => updateGoal(index, 'title', e.target.value)}
                          placeholder="Goal title"
                          className="w-full font-medium text-gray-900 border border-gray-300 rounded px-3 py-1 mb-2"
                        />
                      ) : (
                        <h4 className="font-medium text-gray-900">{goal.title}</h4>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {isEditing ? (
                        renderStars(goal.rating, true, (rating) => updateGoal(index, 'rating', rating))
                      ) : (
                        renderStars(goal.rating)
                      )}
                      {isEditing && (
                        <button
                          onClick={() => removeGoal(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Target</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={goal.target}
                          onChange={(e) => updateGoal(index, 'target', e.target.value)}
                          className="w-full text-sm text-gray-900 border border-gray-300 rounded px-2 py-1 mt-1"
                        />
                      ) : (
                        <p className="text-sm text-gray-900">{goal.target}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Actual</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={goal.actual}
                          onChange={(e) => updateGoal(index, 'actual', e.target.value)}
                          className="w-full text-sm text-gray-900 border border-gray-300 rounded px-2 py-1 mt-1"
                        />
                      ) : (
                        <p className="text-sm text-gray-900">{goal.actual}</p>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <>
                      <textarea
                        value={goal.description}
                        onChange={(e) => updateGoal(index, 'description', e.target.value)}
                        placeholder="Description"
                        rows={2}
                        className="w-full text-sm text-gray-700 border border-gray-300 rounded px-2 py-1 mt-2"
                      />
                      <select
                        value={goal.status}
                        onChange={(e) => updateGoal(index, 'status', e.target.value as AppraisalGoal['status'])}
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1 mt-2"
                      >
                        <option value="achieved">Achieved</option>
                        <option value="partially-achieved">Partially Achieved</option>
                        <option value="not-achieved">Not Achieved</option>
                      </select>
                    </>
                  ) : (
                    <>
                      {goal.description && <p className="text-sm text-gray-700 mt-2">{goal.description}</p>}
                      <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                        goal.status === 'achieved' ? 'bg-green-100 text-green-800' :
                        goal.status === 'partially-achieved' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {goal.status.replace('-', ' ').charAt(0).toUpperCase() + goal.status.slice(1)}
                      </span>
                    </>
                  )}
                </div>
              ))}

              {goals.length === 0 && (
                <p className="text-center text-gray-500 py-4">No goals defined yet</p>
              )}
            </div>
          </div>

          {/* Competencies */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold text-gray-900">Competencies ({competencies.length})</h3>
              </div>
              {isEditing && (
                <button
                  onClick={addCompetency}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  + Add Competency
                </button>
              )}
            </div>

            <div className="space-y-4">
              {competencies.map((competency, index) => (
                <div key={competency.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      {isEditing ? (
                        <input
                          type="text"
                          value={competency.name}
                          onChange={(e) => updateCompetency(index, 'name', e.target.value)}
                          placeholder="Competency name"
                          className="w-full font-medium text-gray-900 border border-gray-300 rounded px-3 py-1"
                        />
                      ) : (
                        <h4 className="font-medium text-gray-900">{competency.name}</h4>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {isEditing ? (
                        renderStars(competency.rating, true, (rating) => updateCompetency(index, 'rating', rating))
                      ) : (
                        renderStars(competency.rating)
                      )}
                      {isEditing && (
                        <button
                          onClick={() => removeCompetency(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <>
                      <textarea
                        value={competency.description}
                        onChange={(e) => updateCompetency(index, 'description', e.target.value)}
                        placeholder="Description"
                        rows={2}
                        className="w-full text-sm text-gray-700 border border-gray-300 rounded px-2 py-1 mt-2"
                      />
                      <select
                        value={competency.level}
                        onChange={(e) => updateCompetency(index, 'level', e.target.value as AppraisalCompetency['level'])}
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1 mt-2"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                    </>
                  ) : (
                    <>
                      {competency.description && <p className="text-sm text-gray-700 mt-2">{competency.description}</p>}
                      <span className="inline-block mt-2 px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {competency.level.charAt(0).toUpperCase() + competency.level.slice(1)}
                      </span>
                    </>
                  )}
                </div>
              ))}

              {competencies.length === 0 && (
                <p className="text-center text-gray-500 py-4">No competencies defined yet</p>
              )}
            </div>
          </div>

          {/* Reviews */}
          {(() => {
            console.log('=== Rendering Reviews Section ===');
            console.log('appraisal.selfReview exists:', !!appraisal.selfReview);
            console.log('appraisal.managerReview exists:', !!appraisal.managerReview);
            console.log('appraisal.hrReview exists:', !!appraisal.hrReview);
            console.log('Should show reviews section:', !!(appraisal.selfReview || appraisal.managerReview || appraisal.hrReview));
            console.log('user?.id:', user?.id);
            console.log('appraisal.employeeId:', appraisal.employeeId);
            console.log('appraisal.managerId:', appraisal.managerId);
            return null;
          })()}
          {(appraisal.selfReview || appraisal.managerReview || appraisal.hrReview) && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Reviews</h3>
              
              {(() => {
                console.log('=== Rendering Self Review in Detail Modal ===');
                console.log('appraisal.selfReview exists:', !!appraisal.selfReview);
                console.log('Will render self review:', !!appraisal.selfReview);
                return null;
              })()}
              {appraisal.selfReview && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Self Review</h4>
                  <p className="text-sm text-blue-800">{appraisal.selfReview.overallComments}</p>
                </div>
              )}

              {appraisal.managerReview && (user?.id === appraisal.managerId) && (
                <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">Manager Review</h4>
                  <p className="text-sm text-yellow-800">{appraisal.managerReview.overallComments}</p>
                </div>
              )}

              {appraisal.hrReview && (
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">HR Review</h4>
                  <p className="text-sm text-purple-800">{appraisal.hrReview.overallComments}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Review Modal */}
        {showReviewModal && (
          <AppraisalReviewModal
            appraisal={appraisal}
            reviewType={reviewType}
            onClose={() => setShowReviewModal(false)}
            onSubmit={() => {
              setShowReviewModal(false);
              onRefresh();
            }}
          />
        )}

        {/* Success Modal */}
        <SuccessModal
          isOpen={!!successMessage}
          title={successMessage?.title || ''}
          message={successMessage?.message || ''}
          details={successMessage?.details}
          icon={successMessage?.title.includes('Imported') ? 'target' : 'check'}
          onClose={() => setSuccessMessage(null)}
        />
      </div>
    </div>
  );
}
