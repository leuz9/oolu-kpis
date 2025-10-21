import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Download, 
  MoreVertical,
  User,
  Users,
  Calendar,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  FileText,
  Target,
  Trash2
} from 'lucide-react';
import { AppraisalDetailModal } from './AppraisalDetailModal';
import { FixAppraisalsButton } from './FixAppraisalsButton';
import { RecalculateRatingsButton } from './RecalculateRatingsButton';
import { userService } from '../../../services/userService';
import { useAuth } from '../../../contexts/AuthContext';
import { AppraisalService } from '../../../services/appraisalService';
import type { Appraisal, AppraisalCycle, User as UserType } from '../../../types';

interface AppraisalListProps {
  appraisals: Appraisal[];
  cycles: AppraisalCycle[];
  selectedCycle: string | null;
  onAppraisalsChange: (appraisals: Appraisal[]) => void;
  onRefresh: () => void;
}

export function AppraisalList({ 
  appraisals, 
  cycles, 
  selectedCycle, 
  onAppraisalsChange, 
  onRefresh 
}: AppraisalListProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedAppraisal, setSelectedAppraisal] = useState<Appraisal | null>(null);
  const [viewingReviews, setViewingReviews] = useState<Appraisal | null>(null);
  const [users, setUsers] = useState<{ [key: string]: UserType }>({});
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [deletingAppraisal, setDeletingAppraisal] = useState<Appraisal | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [appraisals]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const userIds = new Set<string>();
      
      // Collect valid user IDs
      appraisals.forEach(appraisal => {
        if (appraisal.employeeId && typeof appraisal.employeeId === 'string' && appraisal.employeeId.trim()) {
          userIds.add(appraisal.employeeId);
        }
        if (appraisal.managerId && typeof appraisal.managerId === 'string' && appraisal.managerId.trim()) {
          userIds.add(appraisal.managerId);
        }
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

      setUsers(usersMap);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const getUserName = (userId: string): string => {
    if (!userId || typeof userId !== 'string') return 'N/A';
    return users[userId]?.displayName || userId;
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

  const filteredAppraisals = appraisals
    .filter(appraisal => {
      if (selectedCycle && appraisal.cycleId !== selectedCycle) return false;
      if (statusFilter !== 'all' && appraisal.status !== statusFilter) return false;
      if (ratingFilter !== 'all') {
        const rating = Math.floor(appraisal.overallRating || 0);
        if (ratingFilter !== rating.toString()) return false;
      }
      return true;
    })
    .filter(appraisal => {
      const employeeName = getUserName(appraisal.employeeId).toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      return employeeName.includes(searchLower) || appraisal.employeeId.toLowerCase().includes(searchLower);
    });

  const getStatusIcon = (status: Appraisal['status']) => {
    switch (status) {
      case 'draft': return <Edit className="h-4 w-4 text-gray-500" />;
      case 'self-review': return <User className="h-4 w-4 text-blue-500" />;
      case 'manager-review': return <User className="h-4 w-4 text-yellow-500" />;
      case 'hr-review': return <User className="h-4 w-4 text-purple-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
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

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-4 w-4 ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`} 
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const handleExport = () => {
    // Create CSV content
    let csvContent = 'Appraisal List Export\n\n';
    csvContent += 'Employee Name,Manager Name,Status,Overall Rating,Goals Count,Competencies Count,Last Updated\n';
    
    filteredAppraisals.forEach(appraisal => {
      csvContent += `${getUserName(appraisal.employeeId)},${getUserName(appraisal.managerId)},${appraisal.status},${appraisal.overallRating || 'N/A'},${appraisal.goals.length},${appraisal.competencies.length},${formatDate(appraisal.updatedAt)}\n`;
    });

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `appraisals-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteAppraisal = async () => {
    if (!deletingAppraisal) return;
    
    try {
      setDeleting(true);
      await AppraisalService.deleteAppraisal(deletingAppraisal.id);
      
      // Update local state
      const updatedAppraisals = appraisals.filter(a => a.id !== deletingAppraisal.id);
      onAppraisalsChange(updatedAppraisals);
      
      setDeletingAppraisal(null);
      onRefresh();
    } catch (error) {
      console.error('Error deleting appraisal:', error);
      alert('Failed to delete appraisal');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Appraisals</h2>
          <p className="text-gray-600 mt-1">
            {filteredAppraisals.length} of {appraisals.length} appraisals
          </p>
        </div>
        <div className="flex items-center gap-3">
          <FixAppraisalsButton onComplete={onRefresh} />
          <RecalculateRatingsButton onComplete={onRefresh} />
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            {viewMode === 'table' ? 'Card View' : 'Table View'}
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Download className="h-5 w-5" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by employee name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="self-review">Self Review</option>
            <option value="manager-review">Manager Review</option>
            <option value="hr-review">HR Review</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Goals
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reviews
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppraisals.map((appraisal) => (
                  <tr key={appraisal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-primary-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {getUserName(appraisal.employeeId)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Manager: {getUserName(appraisal.managerId)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appraisal.status)}`}>
                        {getStatusIcon(appraisal.status)}
                        {appraisal.status.charAt(0).toUpperCase() + appraisal.status.slice(1).replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {appraisal.overallRating ? renderStars(appraisal.overallRating) : (
                        <span className="text-sm text-gray-500">Not rated</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{appraisal.goals?.length || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {appraisal.selfReview && (
                          <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded" title="Self Review">S</div>
                        )}
                        {appraisal.managerReview && (
                          <div className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded" title="Manager Review">M</div>
                        )}
                        {appraisal.hrReview && (
                          <div className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded" title="HR Review">H</div>
                        )}
                        {!appraisal.selfReview && !appraisal.managerReview && !appraisal.hrReview && (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(appraisal.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setSelectedAppraisal(appraisal)}
                          className="text-primary-600 hover:text-primary-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {(appraisal.selfReview || appraisal.managerReview || appraisal.hrReview) && (
                          <button 
                            onClick={() => setViewingReviews(appraisal)}
                            className="text-green-600 hover:text-green-900"
                            title="View Reviews"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => setSelectedAppraisal(appraisal)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {user?.role === 'superadmin' && (
                          <button 
                            onClick={() => setDeletingAppraisal(appraisal)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Appraisal"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAppraisals.map((appraisal) => (
            <div key={appraisal.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">{getUserName(appraisal.employeeId)}</h3>
                    <p className="text-xs text-gray-500">Manager: {getUserName(appraisal.managerId)}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appraisal.status)}`}>
                  {getStatusIcon(appraisal.status)}
                  {appraisal.status.charAt(0).toUpperCase() + appraisal.status.slice(1).replace('-', ' ')}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Overall Rating</span>
                  {appraisal.overallRating ? renderStars(appraisal.overallRating) : (
                    <span className="text-sm text-gray-500">Not rated</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Goals</span>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{appraisal.goals?.length || 0}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Competencies</span>
                  <span className="text-sm font-medium text-gray-900">{appraisal.competencies?.length || 0}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Reviews</span>
                  <div className="flex items-center gap-1">
                    {appraisal.selfReview && (
                      <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded" title="Self Review">S</div>
                    )}
                    {appraisal.managerReview && (
                      <div className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded" title="Manager Review">M</div>
                    )}
                    {appraisal.hrReview && (
                      <div className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded" title="HR Review">H</div>
                    )}
                    {!appraisal.selfReview && !appraisal.managerReview && !appraisal.hrReview && (
                      <span className="text-xs text-gray-400">None</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm text-gray-500">
                    {formatDate(appraisal.updatedAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => setSelectedAppraisal(appraisal)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  View
                </button>
                {(appraisal.selfReview || appraisal.managerReview || appraisal.hrReview) && (
                  <button 
                    onClick={() => setViewingReviews(appraisal)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    Reviews
                  </button>
                )}
                <button 
                  onClick={() => setSelectedAppraisal(appraisal)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                {user?.role === 'superadmin' && (
                  <button 
                    onClick={() => setDeletingAppraisal(appraisal)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredAppraisals.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No appraisals found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Appraisal Detail Modal */}
      {selectedAppraisal && (
        <AppraisalDetailModal
          appraisal={selectedAppraisal}
          onClose={() => setSelectedAppraisal(null)}
          onRefresh={() => {
            onRefresh();
            setSelectedAppraisal(null);
          }}
        />
      )}

      {/* Reviews Modal */}
      {viewingReviews && (
        <ReviewsModal
          appraisal={viewingReviews}
          onClose={() => setViewingReviews(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingAppraisal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Appraisal</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-700 mb-2">
                  Are you sure you want to delete the appraisal for:
                </p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-gray-900">{getUserName(deletingAppraisal.employeeId)}</p>
                  <p className="text-sm text-gray-600">Manager: {getUserName(deletingAppraisal.managerId)}</p>
                  <p className="text-sm text-gray-600">Status: {deletingAppraisal.status}</p>
                </div>
                <p className="text-sm text-red-600 mt-2">
                  ⚠️ This will permanently delete all appraisal data including goals, competencies, and reviews.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setDeletingAppraisal(null)}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAppraisal}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete Appraisal
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reviews Modal Component
interface ReviewsModalProps {
  appraisal: Appraisal;
  onClose: () => void;
}

function ReviewsModal({ appraisal, onClose }: ReviewsModalProps) {
  const formatReviewDate = (date: any): string => {
    if (!date) return 'N/A';
    try {
      if (date?.toDate && typeof date.toDate === 'function') {
        return date.toDate().toLocaleDateString();
      }
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'N/A';
      }
      return dateObj.toLocaleDateString();
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Reviews Submitted
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              View all reviews completed for this appraisal
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Self Review */}
          {appraisal.selfReview && (
            <div className="border border-blue-200 rounded-lg overflow-hidden">
              <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900">Self Review</h4>
                      <p className="text-sm text-blue-700">
                        Submitted by employee
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                    {formatReviewDate(appraisal.selfReview.submittedAt)}
                  </span>
                </div>
              </div>
              <div className="p-6 bg-white">
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Overall Comments</h5>
                    <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-4">
                      {appraisal.selfReview.overallComments || 'No comments provided'}
                    </p>
                  </div>
                  {appraisal.selfReview.responses && appraisal.selfReview.responses.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Responses</h5>
                      <div className="space-y-3">
                        {appraisal.selfReview.responses.slice(0, 3).map((response, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">Question {idx + 1}</p>
                            <p className="text-sm text-gray-900">
                              {typeof response.answer === 'number' ? (
                                <span className="flex items-center gap-2">
                                  <span className="font-medium">{response.answer}</span>
                                  <span className="text-gray-500">/ 5</span>
                                </span>
                              ) : (
                                response.answer?.toString()
                              )}
                            </p>
                          </div>
                        ))}
                        {appraisal.selfReview.responses.length > 3 && (
                          <p className="text-xs text-gray-500 text-center">
                            +{appraisal.selfReview.responses.length - 3} more responses
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Manager Review */}
          {appraisal.managerReview && (
            <div className="border border-yellow-200 rounded-lg overflow-hidden">
              <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Users className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-900">Manager Review</h4>
                      <p className="text-sm text-yellow-700">
                        Submitted by manager
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
                    {formatReviewDate(appraisal.managerReview.submittedAt)}
                  </span>
                </div>
              </div>
              <div className="p-6 bg-white">
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Overall Comments</h5>
                    <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-4">
                      {appraisal.managerReview.overallComments || 'No comments provided'}
                    </p>
                  </div>
                  {appraisal.managerReview.responses && appraisal.managerReview.responses.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Responses</h5>
                      <div className="space-y-3">
                        {appraisal.managerReview.responses.slice(0, 3).map((response, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">Question {idx + 1}</p>
                            <p className="text-sm text-gray-900">
                              {typeof response.answer === 'number' ? (
                                <span className="flex items-center gap-2">
                                  <span className="font-medium">{response.answer}</span>
                                  <span className="text-gray-500">/ 5</span>
                                </span>
                              ) : (
                                response.answer?.toString()
                              )}
                            </p>
                          </div>
                        ))}
                        {appraisal.managerReview.responses.length > 3 && (
                          <p className="text-xs text-gray-500 text-center">
                            +{appraisal.managerReview.responses.length - 3} more responses
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* HR Review */}
          {appraisal.hrReview && (
            <div className="border border-purple-200 rounded-lg overflow-hidden">
              <div className="bg-purple-50 px-6 py-4 border-b border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-900">HR Review</h4>
                      <p className="text-sm text-purple-700">
                        Submitted by HR
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                    {formatReviewDate(appraisal.hrReview.submittedAt)}
                  </span>
                </div>
              </div>
              <div className="p-6 bg-white">
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Overall Comments</h5>
                    <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-4">
                      {appraisal.hrReview.overallComments || 'No comments provided'}
                    </p>
                  </div>
                  {appraisal.hrReview.responses && appraisal.hrReview.responses.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Responses</h5>
                      <div className="space-y-3">
                        {appraisal.hrReview.responses.slice(0, 3).map((response, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">Question {idx + 1}</p>
                            <p className="text-sm text-gray-900">
                              {typeof response.answer === 'number' ? (
                                <span className="flex items-center gap-2">
                                  <span className="font-medium">{response.answer}</span>
                                  <span className="text-gray-500">/ 5</span>
                                </span>
                              ) : (
                                response.answer?.toString()
                              )}
                            </p>
                          </div>
                        ))}
                        {appraisal.hrReview.responses.length > 3 && (
                          <p className="text-xs text-gray-500 text-center">
                            +{appraisal.hrReview.responses.length - 3} more responses
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* No Reviews */}
          {!appraisal.selfReview && !appraisal.managerReview && !appraisal.hrReview && (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-600">No reviews have been submitted for this appraisal.</p>
            </div>
          )}
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
