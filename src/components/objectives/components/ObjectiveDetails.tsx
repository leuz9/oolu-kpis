import React, { useState, useEffect } from 'react';
import { Target, Calendar, Users, CheckCircle2, AlertTriangle, XCircle, Pencil, Plus, Archive, Link } from 'lucide-react';
import type { Objective, KeyResult, KPI } from '../../../types';
import KeyResultCard from './KeyResultCard';
import KPILinkModal from './KPILinkModal';
import { kpiService } from '../../../services/kpiService';
import { objectiveService } from '../../../services/objectiveService';

interface ObjectiveDetailsProps {
  objective: Objective;
  onEdit: () => void;
  onAddKeyResult: () => void;
  onArchive: () => void;
  onLinkKPI: (kpiId: string) => Promise<void>;
  onUnlinkKPI: (kpiId: string) => Promise<void>;
}

export default function ObjectiveDetails({ 
  objective, 
  onEdit, 
  onAddKeyResult, 
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'text-green-500';
      case 'at-risk':
        return 'text-yellow-500';
      case 'behind':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'at-risk':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'behind':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  if (!objective) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <Target className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                {objective.title}
              </h2>
            </div>
            <p className="mt-2 text-gray-600">{objective.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(objective.status)}
            <span className={`text-sm font-medium capitalize ${getStatusColor(objective.status)}`}>
              {objective.status.replace('-', ' ')}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-gray-500 mb-1">Progress</div>
            <div className="text-2xl font-bold text-gray-900">{objective.progress}%</div>
            <div className="mt-2 w-full h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 rounded-full bg-indigo-600"
                style={{ width: `${objective.progress}%` }}
              />
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-gray-500 mb-1">Due Date</div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-900">
                {new Date(objective.dueDate).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-gray-500 mb-1">Contributors</div>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-900">
                {objective.contributors?.length || 0} members
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* KPIs Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Linked KPIs</h3>
            <button
              onClick={() => setShowKPIModal(true)}
              className="flex items-center px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              <Link className="h-4 w-4 mr-1" />
              Manage KPIs
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <p className="ml-3 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            </div>
          ) : linkedKPIs.length === 0 ? (
            <p className="text-sm text-gray-500">No KPIs linked to this objective</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {linkedKPIs.map((kpi) => (
                <div
                  key={kpi.id}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{kpi.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{kpi.category}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      kpi.trend === 'up' ? 'bg-green-100 text-green-800' :
                      kpi.trend === 'down' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {kpi.value} / {kpi.target} {kpi.unit}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 rounded-full bg-primary-600"
                        style={{ width: `${(kpi.value / kpi.target) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Key Results Section */}
        <h3 className="text-lg font-medium text-gray-900 mb-4">Key Results</h3>
        <div className="space-y-4">
          {objective.keyResults?.map(kr => (
            <KeyResultCard key={kr.id} keyResult={kr} />
          ))}
        </div>
      </div>

      <div className="p-6 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Objective
            </button>
            <button
              onClick={onAddKeyResult}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Key Result
            </button>
          </div>
          <button
            onClick={onArchive}
            className="px-4 py-2 bg-red-50 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-100 flex items-center"
          >
            <Archive className="h-4 w-4 mr-2" />
            Archive Objective
          </button>
        </div>
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