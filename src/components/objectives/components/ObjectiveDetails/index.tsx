import React, { useState, useEffect } from 'react';
import type { Objective, KPI } from '../../../../types';
import { kpiService } from '../../../../services/kpiService';
import { objectiveService } from '../../../../services/objectiveService';
import KPILinkModal from '../KPILinkModal';
import Header from './Header';
import Metrics from './Metrics';
import LinkedKPIs from './LinkedKPIs';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (objective?.id) {
      fetchLinkedKPIs();
    }
  }, [objective?.id, objective?.kpiIds]);

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