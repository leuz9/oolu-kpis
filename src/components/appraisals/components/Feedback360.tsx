import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Star,
  MessageSquare,
  Target,
  TrendingUp,
  Eye,
  Edit,
  Search,
  X,
  User,
  FileText
} from 'lucide-react';
import { AppraisalService } from '../../../services/appraisalService';
import { notificationService } from '../../../services/notificationService';
import { userService } from '../../../services/userService';
import { ConfirmationModal } from './ConfirmationModal';
import { SuccessModal } from './SuccessModal';
import type { Appraisal, Feedback360, User as UserType } from '../../../types';

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

interface Feedback360Props {
  appraisals: Appraisal[];
  selectedCycle: string | null;
}

type TabType = 'feedback' | 'invitations';

export function Feedback360({ appraisals, selectedCycle }: Feedback360Props) {
  const [feedback360, setFeedback360] = useState<Feedback360[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedAppraisal, setSelectedAppraisal] = useState<Appraisal | null>(null);
  const [currentTab, setCurrentTab] = useState<TabType>('feedback');
  const [pendingInvitations, setPendingInvitations] = useState<Feedback360[]>([]);
  const [feedbackUsers, setFeedbackUsers] = useState<{ [key: string]: UserType }>({});
  const [viewingFeedback, setViewingFeedback] = useState<Feedback360 | null>(null);
  const [deletingFeedback, setDeletingFeedback] = useState<Feedback360 | null>(null);
  const [submittingFeedback, setSubmittingFeedback] = useState<Feedback360 | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [feedbackToCancel, setFeedbackToCancel] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<{ title: string; message: string; details?: any[] } | null>(null);

  useEffect(() => {
    loadFeedback360();
  }, [selectedCycle]);

  const loadFeedback360 = async () => {
    try {
      setLoading(true);
      // Load feedback for all appraisals in the selected cycle
      const cycleAppraisals = appraisals.filter(a => a.cycleId === selectedCycle);
      const allFeedback = [];
      
      for (const appraisal of cycleAppraisals) {
        const feedback = await AppraisalService.getFeedback360(appraisal.id);
        allFeedback.push(...feedback);
      }
      
      setFeedback360(allFeedback);
      
      // Separate pending invitations
      const pending = allFeedback.filter(f => f.status === 'pending');
      setPendingInvitations(pending);

      // Load user data for feedback
      const userIds = new Set<string>();
      allFeedback.forEach(f => {
        if (f.revieweeId) userIds.add(f.revieweeId);
        if (f.reviewerId) userIds.add(f.reviewerId);
      });

      const usersMap: { [key: string]: UserType } = {};
      await Promise.all(
        Array.from(userIds).map(async (userId) => {
          try {
            const user = await userService.getUser(userId);
            if (user) {
              usersMap[userId] = user;
            }
          } catch (error) {
            console.error(`Error loading user ${userId}:`, error);
          }
        })
      );

      setFeedbackUsers(usersMap);
    } catch (error) {
      console.error('Error loading 360 feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId: string): string => {
    return feedbackUsers[userId]?.displayName || userId;
  };

  const handleCancelInvitation = async () => {
    if (!feedbackToCancel) return;

    try {
      await AppraisalService.deleteFeedback360(feedbackToCancel);
      setShowCancelConfirm(false);
      setFeedbackToCancel(null);
      setSuccessMessage({
        title: 'Invitation Cancelled',
        message: 'The feedback invitation has been successfully cancelled.',
        details: []
      });
      loadFeedback360();
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      alert('Failed to cancel invitation');
    }
  };

  const handleResendInvitation = async (feedback: Feedback360) => {
    try {
      // In a real implementation, this would send an email notification
      setSuccessMessage({
        title: 'Invitation Resent',
        message: `Invitation has been resent to ${getUserName(feedback.reviewerId)}`,
        details: []
      });
    } catch (error) {
      console.error('Error resending invitation:', error);
      alert('Failed to resend invitation');
    }
  };

  const getFeedbackStats = () => {
    const total = feedback360.length;
    const completed = feedback360.filter(f => f.status === 'completed').length;
    const pending = feedback360.filter(f => f.status === 'pending').length;
    
    return { total, completed, pending, completionRate: total > 0 ? (completed / total) * 100 : 0 };
  };

  const tabs = [
    { id: 'feedback' as TabType, label: 'All Feedback', count: feedback360.length },
    { id: 'invitations' as TabType, label: 'Pending Invitations', count: pendingInvitations.length }
  ];

  const getRelationshipIcon = (relationship: Feedback360['relationship']) => {
    switch (relationship) {
      case 'peer': return <Users className="h-4 w-4 text-blue-500" />;
      case 'subordinate': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'customer': return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'other': return <UserPlus className="h-4 w-4 text-gray-500" />;
      default: return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRelationshipColor = (relationship: Feedback360['relationship']) => {
    switch (relationship) {
      case 'peer': return 'bg-blue-100 text-blue-800';
      case 'subordinate': return 'bg-green-100 text-green-800';
      case 'customer': return 'bg-purple-100 text-purple-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = getFeedbackStats();

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
          <h2 className="text-xl font-semibold text-gray-900">360° Feedback</h2>
          <p className="text-gray-600 mt-1">Multi-rater feedback system for comprehensive evaluations</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <UserPlus className="h-5 w-5" />
          Invite Reviewers
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completionRate.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  currentTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  currentTab === tab.id
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

      {/* Tab Content */}
      {currentTab === 'feedback' && (
        <>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Feedback Requests</h3>
          </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reviewee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reviewer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Relationship
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feedback360.map((feedback) => (
                <tr key={feedback.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {getUserName(feedback.revieweeId)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getUserName(feedback.reviewerId)}</div>
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRelationshipColor(feedback.relationship)}`}>
                      {getRelationshipIcon(feedback.relationship)}
                      {feedback.relationship.charAt(0).toUpperCase() + feedback.relationship.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      feedback.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {feedback.status === 'completed' ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(feedback.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {feedback.status === 'pending' ? (
                        <button 
                          onClick={() => setSubmittingFeedback(feedback)}
                          className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          title="Submit Feedback"
                        >
                          <Edit className="h-4 w-4" />
                          Submit
                        </button>
                      ) : (
                        <button 
                          onClick={() => setViewingFeedback(feedback)}
                          className="text-primary-600 hover:text-primary-900"
                          title="View Feedback"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      {feedback.status === 'pending' && (
                        <button 
                          onClick={() => {
                            setFeedbackToCancel(feedback.id);
                            setShowCancelConfirm(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Cancel Invitation"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {feedback360.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback requests</h3>
            <p className="text-gray-600 mb-4">Start by inviting reviewers for 360° feedback.</p>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors mx-auto"
            >
              <UserPlus className="h-5 w-5" />
              Invite Reviewers
            </button>
          </div>
        )}
        </>
      )}

      {/* Pending Invitations Tab */}
      {currentTab === 'invitations' && (
        <>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Pending Invitations</h3>
            <p className="text-sm text-gray-600 mt-1">Review requests waiting for response</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reviewee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reviewer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Relationship
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingInvitations.map((invitation) => (
                  <tr key={invitation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {getUserName(invitation.revieweeId)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {feedbackUsers[invitation.revieweeId]?.email || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {getUserName(invitation.reviewerId)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {feedbackUsers[invitation.reviewerId]?.department || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRelationshipColor(invitation.relationship)}`}>
                        {getRelationshipIcon(invitation.relationship)}
                        {invitation.relationship.charAt(0).toUpperCase() + invitation.relationship.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-gray-900">{formatDate(invitation.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleResendInvitation(invitation)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Resend Invitation"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setFeedbackToCancel(invitation.id);
                            setShowCancelConfirm(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Cancel Invitation"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pendingInvitations.length === 0 && (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending invitations</h3>
              <p className="text-gray-600 mb-4">All invitations have been responded to.</p>
            </div>
          )}
        </>
      )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteReviewersModal
          appraisals={appraisals.filter(a => a.cycleId === selectedCycle)}
          onClose={() => setShowInviteModal(false)}
          onInvite={async (invites) => {
            try {
              // Send each invitation
              for (const invite of invites) {
                const feedback: Omit<Feedback360, 'id' | 'createdAt'> = {
                  appraisalId: invite.appraisalId,
                  revieweeId: invite.revieweeId,
                  reviewerId: invite.reviewerId,
                  relationship: invite.relationship,
                  responses: [],
                  status: 'pending'
                };
                
                await AppraisalService.submitFeedback360(feedback);

                // Notify the reviewer about the invitation
                await notificationService.createNotification({
                  userId: invite.reviewerId,
                  title: '360° Feedback Request',
                  message: `You have been invited to provide feedback for ${getUserName(invite.revieweeId)}.`,
                  type: 'system',
                  priority: 'medium',
                  link: '/appraisals'
                } as any);
              }
              
              setShowInviteModal(false);
              setSuccessMessage({
                title: 'Invitations Sent!',
                message: `Successfully sent ${invites.length} feedback invitation(s).`,
                details: [
                  { label: 'Reviewers Invited', value: invites.length },
                  { label: 'Status', value: 'Pending Response' }
                ]
              });
              loadFeedback360();
            } catch (error) {
              console.error('Error sending invitations:', error);
              alert('Failed to send some invitations. Please try again.');
            }
          }}
        />
      )}

      {/* View Feedback Modal */}
      {viewingFeedback && (
        <ViewFeedbackModal
          feedback={viewingFeedback}
          revieweeName={getUserName(viewingFeedback.revieweeId)}
          reviewerName={getUserName(viewingFeedback.reviewerId)}
          onClose={() => setViewingFeedback(null)}
        />
      )}

      {/* Submit Feedback Modal */}
      {submittingFeedback && (
        <SubmitFeedback360Modal
          feedback={submittingFeedback}
          revieweeName={getUserName(submittingFeedback.revieweeId)}
          reviewerName={getUserName(submittingFeedback.reviewerId)}
          appraisal={appraisals.find(a => a.id === submittingFeedback.appraisalId) || null}
          onClose={() => setSubmittingFeedback(null)}
          onSubmit={async (responses) => {
            try {
              await AppraisalService.updateFeedback360(submittingFeedback.id, {
                responses,
                status: 'completed',
                submittedAt: new Date().toISOString()
              });
              setSubmittingFeedback(null);
              setSuccessMessage({
                title: 'Feedback Submitted!',
                message: 'Your 360° feedback has been successfully submitted.',
                details: [
                  { label: 'For', value: getUserName(submittingFeedback.revieweeId) },
                  { label: 'Questions Answered', value: responses.length }
                ]
              });
              loadFeedback360();

              // Notify the reviewee that feedback was submitted
              await notificationService.createNotification({
                userId: submittingFeedback.revieweeId,
                title: '360° Feedback Submitted',
                message: `${getUserName(submittingFeedback.reviewerId)} submitted their feedback.`,
                type: 'system',
                priority: 'low',
                link: '/appraisals'
              } as any);
            } catch (error) {
              console.error('Error submitting feedback:', error);
              alert('Failed to submit feedback');
            }
          }}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelConfirm}
        title="Cancel Invitation?"
        message="Are you sure you want to cancel this feedback invitation? This action cannot be undone."
        type="danger"
        confirmText="Yes, Cancel"
        cancelText="No, Keep It"
        onConfirm={handleCancelInvitation}
        onCancel={() => {
          setShowCancelConfirm(false);
          setFeedbackToCancel(null);
        }}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={!!successMessage}
        title={successMessage?.title || ''}
        message={successMessage?.message || ''}
        details={successMessage?.details}
        icon="check"
        onClose={() => setSuccessMessage(null)}
      />
    </div>
  );
}

// View Feedback Modal
interface ViewFeedbackModalProps {
  feedback: Feedback360;
  revieweeName: string;
  reviewerName: string;
  onClose: () => void;
}

function ViewFeedbackModal({ feedback, revieweeName, reviewerName, onClose }: ViewFeedbackModalProps) {
  const getRelationshipIcon = (relationship: Feedback360['relationship']) => {
    switch (relationship) {
      case 'peer': return <Users className="h-4 w-4 text-blue-500" />;
      case 'subordinate': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'customer': return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'other': return <UserPlus className="h-4 w-4 text-gray-500" />;
      default: return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRelationshipColor = (relationship: Feedback360['relationship']) => {
    switch (relationship) {
      case 'peer': return 'bg-blue-100 text-blue-800';
      case 'subordinate': return 'bg-green-100 text-green-800';
      case 'customer': return 'bg-purple-100 text-purple-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-600" />
              360° Feedback Details
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {feedback.status === 'pending' ? 'Invitation pending' : 'Feedback completed'}
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
          {/* Participants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-primary-600" />
                <h4 className="font-semibold text-primary-900">Reviewee</h4>
              </div>
              <p className="text-lg font-medium text-gray-900">{revieweeName}</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900">Reviewer</h4>
              </div>
              <p className="text-lg font-medium text-gray-900">{reviewerName}</p>
            </div>
          </div>

          {/* Relationship */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Relationship</span>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getRelationshipColor(feedback.relationship)}`}>
                {getRelationshipIcon(feedback.relationship)}
                {feedback.relationship.charAt(0).toUpperCase() + feedback.relationship.slice(1)}
              </span>
            </div>
          </div>

          {/* Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Status</span>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                feedback.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {feedback.status === 'completed' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
                {feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Responses */}
          {feedback.status === 'completed' && feedback.responses && feedback.responses.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Feedback Responses</h4>
              <div className="space-y-4">
                {feedback.responses.map((response, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Question {idx + 1}</p>
                    <p className="text-sm text-gray-900">
                      {typeof response.answer === 'number' ? (
                        <span className="flex items-center gap-2">
                          <span className="font-medium text-lg">{response.answer}</span>
                          <span className="text-gray-500">/ 5</span>
                          <div className="flex items-center gap-1 ml-2">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${
                                  i < (response.answer as number) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                        </span>
                      ) : (
                        response.answer?.toString()
                      )}
                    </p>
                    {response.comments && (
                      <p className="text-xs text-gray-600 mt-2 italic">"{response.comments}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-2">
                <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Pending Response</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    The reviewer has not yet completed this feedback.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Created Date */}
          <div className="text-sm text-gray-600">
            Invitation sent on {formatDate(feedback.createdAt)}
            {feedback.submittedAt && (
              <> • Completed on {formatDate(feedback.submittedAt)}</>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          {feedback.status === 'pending' && (
            <button
              onClick={() => {
                handleCancelInvitation(feedback.id);
                onClose();
              }}
              className="px-4 py-2 text-red-600 hover:text-red-700 transition-colors"
            >
              Cancel Invitation
            </button>
          )}
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

// Submit Feedback 360 Modal
interface SubmitFeedback360ModalProps {
  feedback: Feedback360;
  revieweeName: string;
  reviewerName: string;
  appraisal: Appraisal | null;
  onClose: () => void;
  onSubmit: (responses: any[]) => void;
}

function SubmitFeedback360Modal({ feedback, revieweeName, reviewerName, appraisal, onClose, onSubmit }: SubmitFeedback360ModalProps) {
  const [responses, setResponses] = useState<Array<{
    questionId: string;
    question: string;
    answer: number | string;
    comments: string;
  }>>([
    { questionId: '1', question: 'How would you rate their communication skills?', answer: 3, comments: '' },
    { questionId: '2', question: 'How effective is their teamwork and collaboration?', answer: 3, comments: '' },
    { questionId: '3', question: 'How would you rate their problem-solving ability?', answer: 3, comments: '' },
    { questionId: '4', question: 'How professional are they in their work?', answer: 3, comments: '' },
    { questionId: '5', question: 'What are their key strengths?', answer: '', comments: '' },
    { questionId: '6', question: 'What areas could they improve?', answer: '', comments: '' }
  ]);

  const updateResponse = (index: number, field: 'answer' | 'comments', value: any) => {
    const updated = [...responses];
    updated[index] = { ...updated[index], [field]: value };
    setResponses(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required rating questions
    const ratingQuestions = responses.slice(0, 4);
    const allRated = ratingQuestions.every(r => r.answer && r.answer !== 0);
    
    if (!allRated) {
      alert('Please provide ratings for all questions');
      return;
    }

    onSubmit(responses);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Edit className="h-5 w-5 text-green-600" />
              Submit 360° Feedback
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Provide feedback for {revieweeName}
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
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    You are providing feedback as a {feedback.relationship}
                  </p>
                  <p className="text-xs text-blue-800 mt-1">
                    Your responses will help {revieweeName} understand their performance and areas for growth.
                  </p>
                </div>
              </div>
            </div>

            {/* Rating Questions */}
            <div className="space-y-6">
              {responses.slice(0, 4).map((response, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    {response.question} *
                  </label>
                  
                  {/* Star Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => updateResponse(index, 'answer', rating)}
                        className="focus:outline-none"
                      >
                        <Star 
                          className={`h-8 w-8 cursor-pointer transition-colors ${
                            rating <= (response.answer as number) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300 hover:text-gray-400'
                          }`} 
                        />
                      </button>
                    ))}
                    <span className="text-sm font-medium text-gray-900 ml-2">
                      {response.answer || 0} / 5
                    </span>
                  </div>

                  <textarea
                    value={response.comments}
                    onChange={(e) => updateResponse(index, 'comments', e.target.value)}
                    placeholder="Add comments (optional)"
                    rows={2}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ))}

              {/* Text Questions */}
              {responses.slice(4).map((response, index) => (
                <div key={index + 4} className="bg-white border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    {response.question}
                  </label>
                  
                  <textarea
                    value={response.answer as string}
                    onChange={(e) => updateResponse(index + 4, 'answer', e.target.value)}
                    placeholder="Your answer..."
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Send className="h-4 w-4" />
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Invite Reviewers Modal
interface InviteReviewersModalProps {
  appraisals: Appraisal[];
  onClose: () => void;
  onInvite: (invites: any[]) => void;
}

function InviteReviewersModal({ appraisals, onClose, onInvite }: InviteReviewersModalProps) {
  const [selectedAppraisal, setSelectedAppraisal] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [employees, setEmployees] = useState<{ [key: string]: UserType }>({});
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [reviewers, setReviewers] = useState<Array<{
    userId: string;
    relationship: Feedback360['relationship'];
  }>>([]);
  const [reviewerSearchTerm, setReviewerSearchTerm] = useState<string>('');
  const [showReviewerDropdown, setShowReviewerDropdown] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, [appraisals]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.appraisal-search-container')) {
        setShowDropdown(false);
      }
      if (!target.closest('.reviewer-search-container')) {
        setShowReviewerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      
      // Load all users for reviewer selection
      const allUsersData = await userService.getAllUsers();
      setAllUsers(allUsersData);
      
      // Also create a map for appraisal employees
      const employeeIds = new Set<string>();
      appraisals.forEach(appraisal => {
        if (appraisal.employeeId) {
          employeeIds.add(appraisal.employeeId);
        }
      });

      const employeesMap: { [key: string]: UserType } = {};
      allUsersData.forEach(user => {
        if (employeeIds.has(user.id)) {
          employeesMap[user.id] = user;
        }
      });

      setEmployees(employeesMap);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const getEmployeeName = (employeeId: string): string => {
    return employees[employeeId]?.displayName || employeeId;
  };

  const selectedAppraisalData = appraisals.find(a => a.id === selectedAppraisal);
  
  const filteredAppraisals = appraisals.filter(appraisal => {
    const employeeName = getEmployeeName(appraisal.employeeId).toLowerCase();
    return employeeName.includes(searchTerm.toLowerCase()) || 
           appraisal.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const addReviewer = (userId: string) => {
    // Check if already added
    if (reviewers.find(r => r.userId === userId)) {
      alert('This reviewer has already been added');
      return;
    }
    
    // Don't allow adding the employee being reviewed
    if (selectedAppraisalData && userId === selectedAppraisalData.employeeId) {
      alert('Cannot add the employee as their own reviewer');
      return;
    }

    setReviewers([...reviewers, { userId, relationship: 'peer' }]);
    setReviewerSearchTerm('');
    setShowReviewerDropdown(false);
  };

  const removeReviewer = (index: number) => {
    setReviewers(reviewers.filter((_, i) => i !== index));
  };

  const updateReviewerRelationship = (index: number, relationship: Feedback360['relationship']) => {
    const updated = [...reviewers];
    updated[index] = { ...updated[index], relationship };
    setReviewers(updated);
  };

  const getReviewerUser = (userId: string): UserType | undefined => {
    return allUsers.find(u => u.id === userId);
  };

  const filteredUsers = allUsers.filter(user => {
    const searchLower = reviewerSearchTerm.toLowerCase();
    const matchesSearch = user.displayName.toLowerCase().includes(searchLower) || 
                         user.email.toLowerCase().includes(searchLower);
    const notAlreadyAdded = !reviewers.find(r => r.userId === user.id);
    const notEmployee = !selectedAppraisalData || user.id !== selectedAppraisalData.employeeId;
    
    return matchesSearch && notAlreadyAdded && notEmployee;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAppraisal && reviewers.length > 0) {
      const invites = reviewers.map(reviewer => {
        const user = getReviewerUser(reviewer.userId);
        return {
        appraisalId: selectedAppraisal,
          reviewerId: reviewer.userId,
          revieweeId: selectedAppraisalData?.employeeId,
          relationship: reviewer.relationship,
          email: user?.email || '',
          name: user?.displayName || ''
        };
      });
      onInvite(invites);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite 360° Reviewers</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Appraisal *
            </label>
            
            {/* Search Input */}
            <div className="relative appraisal-search-container">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={selectedAppraisalData ? getEmployeeName(selectedAppraisalData.employeeId) : searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                    if (selectedAppraisal) {
                      setSelectedAppraisal('');
                    }
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search by employee name..."
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {selectedAppraisalData && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAppraisal('');
                      setSearchTerm('');
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Dropdown */}
              {showDropdown && !selectedAppraisalData && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {loadingEmployees ? (
                    <div className="px-4 py-3 text-sm text-gray-500">Loading...</div>
                  ) : filteredAppraisals.length > 0 ? (
                    filteredAppraisals.map(appraisal => (
                      <button
                        key={appraisal.id}
                        type="button"
                        onClick={() => {
                          setSelectedAppraisal(appraisal.id);
                          setShowDropdown(false);
                          setSearchTerm('');
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-primary-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {getEmployeeName(appraisal.employeeId)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                appraisal.status === 'completed' ? 'bg-green-100 text-green-800' :
                                ['self-review', 'manager-review', 'hr-review'].includes(appraisal.status) ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {appraisal.status.charAt(0).toUpperCase() + appraisal.status.slice(1).replace('-', ' ')}
                              </span>
                              {appraisal.overallRating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                  <span className="text-xs text-gray-600">{appraisal.overallRating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500">No appraisals found</div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Appraisal Display */}
            {selectedAppraisalData && (
              <div className="mt-2 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {getEmployeeName(selectedAppraisalData.employeeId)}
                    </p>
                    <p className="text-xs text-gray-600">
                      Status: {selectedAppraisalData.status.charAt(0).toUpperCase() + selectedAppraisalData.status.slice(1).replace('-', ' ')}
                    </p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Add Reviewers ({reviewers.length} selected)
              </label>
            </div>
            
            {/* Reviewer Search */}
            <div className="relative mb-4 reviewer-search-container">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={reviewerSearchTerm}
                  onChange={(e) => {
                    setReviewerSearchTerm(e.target.value);
                    setShowReviewerDropdown(true);
                  }}
                  onFocus={() => setShowReviewerDropdown(true)}
                  placeholder="Search employees to add as reviewers..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Reviewer Dropdown */}
              {showReviewerDropdown && reviewerSearchTerm && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.slice(0, 10).map(user => (
              <button
                        key={user.id}
                type="button"
                        onClick={() => addReviewer(user.id)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user.displayName}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              {user.email} • {user.department || 'No department'}
                            </p>
                          </div>
                        </div>
              </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500">No employees found</div>
                  )}
                </div>
              )}
            </div>
            
            {/* Selected Reviewers List */}
            <div className="space-y-3">
              {reviewers.map((reviewer, index) => {
                const user = getReviewerUser(reviewer.userId);
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-blue-600" />
                  </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.displayName || 'Unknown User'}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {user?.email || ''} {user?.department && `• ${user.department}`}
                      </p>
                  </div>
                    <div className="w-36">
                    <select
                      value={reviewer.relationship}
                        onChange={(e) => updateReviewerRelationship(index, e.target.value as Feedback360['relationship'])}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="peer">Peer</option>
                      <option value="subordinate">Subordinate</option>
                      <option value="customer">Customer</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeReviewer(index)}
                      className="text-red-600 hover:text-red-700 p-2"
                      title="Remove reviewer"
                  >
                      <X className="h-4 w-4" />
                  </button>
                  </div>
                );
              })}

              {reviewers.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-2">No reviewers added yet</p>
                  <p className="text-xs text-gray-500">Search and select employees above to add them as reviewers</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedAppraisal || reviewers.length === 0}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              Send Invites
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
