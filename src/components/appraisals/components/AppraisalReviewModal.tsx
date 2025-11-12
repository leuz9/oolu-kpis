import { useState, useEffect } from 'react';
import { X, Send, Star, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { AppraisalService } from '../../../services/appraisalService';
import { notificationService } from '../../../services/notificationService';
import type { Appraisal, AppraisalTemplate, AppraisalResponse, QuestionResponse } from '../../../types';

interface AppraisalReviewModalProps {
  appraisal: Appraisal;
  reviewType: 'self' | 'manager' | 'hr';
  onClose: () => void;
  onSubmit: () => void;
}

export function AppraisalReviewModal({ appraisal, reviewType, onClose, onSubmit }: AppraisalReviewModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState<AppraisalTemplate | null>(null);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [overallComments, setOverallComments] = useState('');

  useEffect(() => {
    loadTemplate();
  }, []);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      if (!appraisal.templateId) {
        console.error('Appraisal missing templateId:', appraisal);
        alert('Error: This appraisal is missing a template. Please contact an administrator.');
        return;
      }
      const templateData = await AppraisalService.getTemplate(appraisal.templateId);
      setTemplate(templateData);
      
      // Initialize responses
      const initialResponses: QuestionResponse[] = [];
      if (templateData) {
        templateData.sections.forEach(section => {
          section.questions.forEach(question => {
            initialResponses.push({
              questionId: question.id,
              answer: question.type === 'rating' ? 3 : '',
              comments: ''
            });
          });
        });
      }
      setResponses(initialResponses);
    } catch (error) {
      console.error('Error loading template:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateResponse = (questionId: string, field: 'answer' | 'comments', value: any) => {
    setResponses(responses.map(r => 
      r.questionId === questionId ? { ...r, [field]: value } : r
    ));
  };

  const getResponse = (questionId: string) => {
    return responses.find(r => r.questionId === questionId);
  };

  const handleSubmit = async () => {
    if (!user) return;

    // Check if appraisal has templateId
    if (!appraisal.templateId) {
      alert('Error: This appraisal is missing a template. Please contact an administrator.');
      console.error('Appraisal missing templateId:', appraisal);
      return;
    }

    // Check permissions based on template reviewType
    if (reviewType === 'self' && template?.reviewType && template.reviewType !== 'self' && template.reviewType !== 'both') {
      alert('This template does not allow self reviews.');
      return;
    }
    
    if (reviewType === 'manager' && template?.reviewType && template.reviewType !== 'manager' && template.reviewType !== 'both') {
      alert('This template does not allow manager reviews.');
      return;
    }

    // Check user permissions
    if (reviewType === 'self' && user.id !== appraisal.employeeId) {
      alert('Only the employee can submit a self review.');
      return;
    }
    
    if (reviewType === 'manager' && user.id !== appraisal.managerId) {
      alert('Only the manager can submit a manager review.');
      return;
    }

    // Validate required questions
    if (template) {
      const requiredQuestions = template.sections.flatMap(s => 
        s.questions.filter(q => q.required).map(q => q.id)
      );
      
      const unansweredRequired = requiredQuestions.filter(qId => {
        const response = getResponse(qId);
        return !response || !response.answer || response.answer === '';
      });

      if (unansweredRequired.length > 0) {
        alert('Please answer all required questions');
        return;
      }
    }

    try {
      setLoading(true);
      const reviewResponse: AppraisalResponse = {
        id: `response-${Date.now()}`,
        responses,
        overallComments,
        submittedAt: new Date().toISOString(),
        submittedBy: user.id
      };

      await AppraisalService.submitResponse(appraisal.id, reviewResponse, reviewType);
      onSubmit();

      // Notify relevant parties
      try {
        if (reviewType === 'self' && appraisal.managerId) {
          await notificationService.createNotification({
            userId: appraisal.managerId,
            title: 'Self Review Submitted',
            message: 'An employee has submitted their self review.',
            type: 'system',
            priority: 'low',
            link: '/appraisals'
          } as any);
        }
        if (reviewType === 'manager' && appraisal.employeeId) {
          await notificationService.createNotification({
            userId: appraisal.employeeId,
            title: 'Manager Review Submitted',
            message: 'Your manager has submitted your review.',
            type: 'system',
            priority: 'medium',
            link: '/appraisals'
          } as any);
        }
        if (reviewType === 'hr' && appraisal.employeeId) {
          await notificationService.createNotification({
            userId: appraisal.employeeId,
            title: 'HR Review Completed',
            message: 'HR has completed your appraisal review.',
            type: 'system',
            priority: 'high',
            link: '/appraisals'
          } as any);
        }
      } catch (e) {
        console.warn('Notification dispatch failed (non-blocking).');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const getReviewTitle = () => {
    switch (reviewType) {
      case 'self': return 'Self Review';
      case 'manager': return 'Manager Review';
      case 'hr': return 'HR Review';
      default: return 'Review';
    }
  };

  const renderQuestion = (question: any) => {
    const response = getResponse(question.id);
    
    return (
      <div key={question.id} className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="font-medium text-gray-900">
              {question.text}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </p>
          </div>
        </div>

        {/* Answer Input Based on Question Type */}
        <div className="space-y-3">
          {question.type === 'rating' && (
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 cursor-pointer ${
                    i < (response?.answer as number || 0)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                  onClick={() => updateResponse(question.id, 'answer', i + 1)}
                />
              ))}
              <span className="text-sm text-gray-600 ml-2">
                {response?.answer || 0} / 5
              </span>
            </div>
          )}

          {question.type === 'text' && (
            <textarea
              value={response?.answer as string || ''}
              onChange={(e) => updateResponse(question.id, 'answer', e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter your answer..."
              required={question.required}
            />
          )}

          {question.type === 'multiple-choice' && question.options && (
            <div className="space-y-2">
              {question.options.map((option: string) => (
                <label key={option} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={response?.answer === option}
                    onChange={(e) => updateResponse(question.id, 'answer', e.target.value)}
                    className="h-4 w-4 text-primary-600"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          )}

          {question.type === 'yes-no' && (
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name={question.id}
                  value="yes"
                  checked={response?.answer === 'yes'}
                  onChange={(e) => updateResponse(question.id, 'answer', e.target.value)}
                  className="h-4 w-4 text-primary-600"
                />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name={question.id}
                  value="no"
                  checked={response?.answer === 'no'}
                  onChange={(e) => updateResponse(question.id, 'answer', e.target.value)}
                  className="h-4 w-4 text-primary-600"
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          )}

          {question.type === 'scale' && question.scale && (
            <div className="space-y-2">
              <input
                type="range"
                min={question.scale.min}
                max={question.scale.max}
                value={response?.answer as number || question.scale.min}
                onChange={(e) => updateResponse(question.id, 'answer', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-600">
                {question.scale.labels.map((label: string, idx: number) => (
                  <span key={idx}>{label}</span>
                ))}
              </div>
              <p className="text-sm text-gray-700 text-center">
                Selected: {response?.answer}
              </p>
            </div>
          )}

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comments (optional)
            </label>
            <textarea
              value={response?.comments || ''}
              onChange={(e) => updateResponse(question.id, 'comments', e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Add any additional comments..."
            />
          </div>
        </div>
      </div>
    );
  };

  if (loading || !template) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Loading template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{getReviewTitle()}</h2>
            <p className="text-sm text-gray-600 mt-1">
              Complete all required fields marked with *
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
        <div className="p-6 space-y-6">
          {/* Template Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">{template.name}</h3>
                <p className="text-sm text-blue-800 mt-1">{template.description}</p>
              </div>
            </div>
          </div>

          {/* Sections */}
          {template.sections
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <div key={section.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                    <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      Weight: {section.weight}%
                    </span>
                  </div>
                  {section.description && (
                    <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                  )}
                </div>

                <div className="space-y-4">
                  {section.questions
                    .sort((a, b) => a.order - b.order)
                    .map((question) => renderQuestion(question))}
                </div>
              </div>
            ))}

          {/* Overall Comments */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Comments</h3>
            <textarea
              value={overallComments}
              onChange={(e) => setOverallComments(e.target.value)}
              rows={5}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Provide your overall assessment and any additional comments..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            <Send className="h-4 w-4" />
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
}
