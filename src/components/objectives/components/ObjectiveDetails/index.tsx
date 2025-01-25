import React, { useState, useEffect } from 'react';
import type { Objective, KPI, User } from '../../../../types';
import { kpiService } from '../../../../services/kpiService';
import { objectiveService } from '../../../../services/objectiveService';
import { userService } from '../../../../services/userService';
import KPILinkModal from '../KPILinkModal';
import Header from './Header';
import Metrics from './Metrics';
import LinkedKPIs from './LinkedKPIs';
import Contributors from './Contributors';
import Actions from './Actions';

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
  const [showKPIModal, setShowKPIModal] = useState(false);
  const [linkedKPIs, setLinkedKPIs] = useState<KPI[]>([]);
  const [contributors, setContributors] = useState<User[]>([]);
  const [childObjectives, setChildObjectives] = useState<Objective[]>([]);
  const [childContributors, setChildContributors] = useState<Map<string, User[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [loadingContributors, setLoadingContributors] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  if (!objective) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <Header objective={objective} />
        <div className="mt-6">
          <Metrics objective={objective} />
        </div>
      </div>

      <div className="p-6">
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
        />
      </div>

      <div className="p-6 bg-gray-50 border-t border-gray-100">
        <Actions
          onEdit={onEdit}
          onArchive={onArchive}
          onUpdate={handleUpdate}
          updating={updating}
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
    </div>
  );
}