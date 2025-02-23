import React, { useState, useEffect } from 'react';
import type { Objective, KPI, User } from '../../../../types';
import { kpiService } from '../../../../services/kpiService';
import { objectiveService } from '../../../../services/objectiveService';
import { userService } from '../../../../services/userService';
import { useAuth } from '../../../../contexts/AuthContext';
import KPILinkModal from '../KPILinkModal';
import ProgressUpdateModal from '../ProgressUpdateModal';
import Header from './Header';
import Metrics from './Metrics';
import LinkedKPIs from './LinkedKPIs';
import Contributors from './Contributors';
import Actions from './Actions';
import History from './History';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ObjectiveDetailsProps {
  objective: Objective;
  onEdit: () => void;
  onArchive: () => void;
  onLinkKPI: (kpiId: string) => Promise<void>;
  onUnlinkKPI: (kpiId: string) => Promise<void>;
}

export default function ObjectiveDetails({ 
  objective, 
  onEdit,
  onArchive,
  onLinkKPI,
  onUnlinkKPI
}: ObjectiveDetailsProps) {
  const { user } = useAuth();
  const [showKPIModal, setShowKPIModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [linkedKPIs, setLinkedKPIs] = useState<KPI[]>([]);
  const [contributors, setContributors] = useState<User[]>([]);
  const [childObjectives, setChildObjectives] = useState<Objective[]>([]);
  const [childContributors, setChildContributors] = useState<Map<string, User[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [loadingContributors, setLoadingContributors] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (objective?.id) {
      fetchLinkedKPIs();
      fetchContributors();
      if (objective.level === 'company') {
        fetchChildObjectives();
      }
    }
  }, [objective?.id, objective?.kpiIds, objective?.contributors]);

  const fetchLinkedKPIs = async () => {
    try {
      setLoading(true);
      if (objective.kpiIds?.length > 0) {
        const kpis = await kpiService.getKPIsByObjective(objective.id);
        setLinkedKPIs(kpis);
      } else {
        setLinkedKPIs([]);
      }
    } catch (err) {
      console.error('Error fetching linked KPIs:', err);
      setError('Failed to load KPIs');
    } finally {
      setLoading(false);
    }
  };

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

  const fetchChildObjectives = async () => {
    try {
      const objectives = await objectiveService.getObjectives();
      const children = objectives.filter(obj => obj.parentId === objective.id);
      setChildObjectives(children);

      // Fetch contributors for each child objective
      const contributorsMap = new Map<string, User[]>();
      await Promise.all(
        children.map(async (child) => {
          if (child.contributors?.length) {
            const users = await Promise.all(
              child.contributors.map(userId => userService.getUser(userId))
            );
            contributorsMap.set(child.id, users);
          }
        })
      );
      setChildContributors(contributorsMap);
    } catch (err) {
      console.error('Error fetching child objectives:', err);
      setError('Failed to load child objectives');
    }
  };

  const handleLinkKPI = async (kpiId: string) => {
    try {
      await objectiveService.linkKPI(objective.id, kpiId);
      await fetchLinkedKPIs();
      onLinkKPI(kpiId);
    } catch (err) {
      console.error('Error linking KPI:', err);
      setError('Failed to link KPI');
      throw err;
    }
  };

  const handleUnlinkKPI = async (kpiId: string) => {
    try {
      await objectiveService.unlinkKPI(objective.id, kpiId);
      await fetchLinkedKPIs();
      onUnlinkKPI(kpiId);
    } catch (err) {
      console.error('Error unlinking KPI:', err);
      setError('Failed to unlink KPI');
      throw err;
    }
  };

  const handleUpdateKPI = async (kpiId: string, value: number, comment: string) => {
    try {
      const kpi = linkedKPIs.find(k => k.id === kpiId);
      if (!kpi) return;

      const updatedKpi = {
        ...kpi,
        value,
        progress: Math.min(100, Math.round((value / kpi.target) * 100)),
        trend: value > kpi.value ? 'up' : value < kpi.value ? 'down' : 'stable',
        status: value >= kpi.target ? 'on-track' : value >= kpi.target * 0.7 ? 'at-risk' : 'behind',
        lastUpdated: new Date().toISOString(),
        history: [
          ...(kpi.history || []),
          {
            value,
            comment,
            timestamp: new Date().toISOString()
          }
        ]
      };

      await kpiService.updateKPI(kpiId, updatedKpi);
      setLinkedKPIs(prev => prev.map(k => k.id === kpiId ? updatedKpi : k));

      // Update objective progress
      await handleUpdate();
    } catch (err) {
      console.error('Error updating KPI:', err);
      setError('Failed to update KPI');
      throw err;
    }
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      setError(null);
      const newProgress = await objectiveService.calculateProgress(objective.id);
      objective.progress = newProgress;
      await fetchLinkedKPIs();
    } catch (err) {
      console.error('Error updating objective progress:', err);
      setError('Failed to update objective progress');
    } finally {
      setUpdating(false);
    }
  };

  const handleProgressUpdate = async (progress: number, comment: string) => {
    try {
      setUpdating(true);
      setError(null);
      
      await objectiveService.updateObjective(objective.id, {
        progress,
        status: progress >= 90 ? 'on-track' : progress >= 60 ? 'at-risk' : 'behind',
        history: [
          ...(objective.history || []),
          {
            progress,
            comment,
            timestamp: new Date().toISOString()
          }
        ]
      });

      objective.progress = progress;
      setShowProgressModal(false);
    } catch (err) {
      console.error('Error updating objective progress:', err);
      setError('Failed to update objective progress');
      throw err;
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
            {objective.level === 'company' ? (
              <span className="text-sm text-gray-500">
                {Array.from(childContributors.values()).reduce((total, users) => total + users.length, 0) + contributors.length} total contributors
              </span>
            ) : (
              <span className="text-sm text-gray-500">
                {contributors.length} member{contributors.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <Contributors
            contributors={contributors}
            childObjectives={childObjectives}
            childContributors={childContributors}
            loading={loadingContributors}
            isCompanyLevel={objective.level === 'company'}
          />
        </div>

        {/* KPIs Section */}
        <LinkedKPIs
          linkedKPIs={linkedKPIs}
          loading={loading}
          error={error}
          onManageKPIs={() => setShowKPIModal(true)}
          onUpdateKPI={handleUpdateKPI}
        />

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
          onUpdate={() => setShowProgressModal(true)}
          updating={updating}
          isAdmin={!!user?.isAdmin}
        />
      </div>

      {showKPIModal && (
        <KPILinkModal
          objectiveId={objective.id}
          linkedKPIs={linkedKPIs}
          onClose={() => setShowKPIModal(false)}
          onLink={handleLinkKPI}
          onUnlink={handleUnlinkKPI}
        />
      )}

      {showProgressModal && (
        <ProgressUpdateModal
          objective={objective}
          onClose={() => setShowProgressModal(false)}
          onUpdate={handleProgressUpdate}
        />
      )}
    </div>
  );
}