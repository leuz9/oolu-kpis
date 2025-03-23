import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { objectiveService } from '../../../../services/objectiveService';
import { userService } from '../../../../services/userService';
import ProgressUpdateModal from '../ProgressUpdateModal';
import Header from './Header';
import Metrics from './Metrics';
import Contributors from './Contributors';
import KeyResults from './KeyResults';
import Actions from './Actions';
import History from './History';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { Objective, User } from '../../../../types';

interface ObjectiveDetailsProps {
  objective: Objective;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export default function ObjectiveDetails({ 
  objective, 
  onEdit,
  onArchive,
  onDelete
}: ObjectiveDetailsProps) {
  const { user } = useAuth();
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [contributors, setContributors] = useState<User[]>([]);
  const [loadingContributors, setLoadingContributors] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (objective?.id) {
      fetchContributors();
    }
  }, [objective?.id]);

  const fetchContributors = async () => {
    try {
      setLoadingContributors(true);
      if (objective.contributors?.length > 0) {
        const users = await Promise.all(
          objective.contributors.map(userId => userService.getUser(userId))
        );
        setContributors(users);
      } else {
        setContributors([]);
      }
    } catch (err) {
      console.error('Error fetching contributors:', err);
      setError('Failed to load contributors');
    } finally {
      setLoadingContributors(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      setError(null);
      const newProgress = await objectiveService.calculateProgress(objective.id);
      objective.progress = newProgress;
      setShowProgressModal(false);
      setSuccess('Progress updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating objective progress:', err);
      setError('Failed to update objective progress');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <Header objective={objective} />
        <div className="mt-6">
          <Metrics objective={objective} />
        </div>
      </div>

      <div className="p-6">
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

        {/* Contributors Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Contributors</h3>
            <span className="text-sm text-gray-500">
              {contributors.length} member{contributors.length !== 1 ? 's' : ''}
            </span>
          </div>
          <Contributors
            contributors={contributors}
            loading={loadingContributors}
          />
        </div>

        {/* Key Results Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Key Results</h3>
          </div>
          <KeyResults keyResults={objective.keyResults || []} />
        </div>

        {/* History Section */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Update History</h3>
          <History 
            history={objective.history} 
            currentProgress={objective.progress}
          />
        </div>
      </div>

      <div className="p-6 bg-gray-50 border-t border-gray-100">
        <Actions
          onEdit={onEdit}
          onArchive={user?.isAdmin ? onArchive : undefined}
          onDelete={user?.role === 'superadmin' ? onDelete : undefined}
          onUpdate={() => setShowProgressModal(true)}
          updating={updating}
          isAdmin={!!user?.isAdmin}
          isSuperAdmin={user?.role === 'superadmin'}
        />
      </div>

      {showProgressModal && (
        <ProgressUpdateModal
          objective={objective}
          onClose={() => setShowProgressModal(false)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}