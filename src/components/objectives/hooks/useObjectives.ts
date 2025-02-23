import { useState, useEffect } from 'react';
import { objectiveService } from '../../../services/objectiveService';
import type { Objective } from '../../../types';

export function useObjectives() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchObjectives();
  }, []);

  const fetchObjectives = async () => {
    try {
      setLoading(true);
      const fetchedObjectives = await objectiveService.getObjectives();
      setObjectives(fetchedObjectives);
    } catch (err) {
      setError('Failed to load objectives. Please try again later.');
      console.error('Error fetching objectives:', err);
    } finally {
      setLoading(false);
    }
  };

  const addObjective = async (newObjective: Omit<Objective, 'id'>) => {
    try {
      const createdObjective = await objectiveService.addObjective(newObjective);
      setObjectives(prev => [...prev, createdObjective]);
      return createdObjective;
    } catch (err) {
      setError('Failed to create objective. Please try again.');
      console.error('Error adding objective:', err);
      throw err;
    }
  };

  const updateObjective = async (updatedObjective: Objective) => {
    try {
      await objectiveService.updateObjective(updatedObjective.id, updatedObjective);
      setObjectives(prev => prev.map(obj =>
        obj.id === updatedObjective.id ? updatedObjective : obj
      ));
      return updatedObjective;
    } catch (err) {
      setError('Failed to update objective. Please try again.');
      console.error('Error updating objective:', err);
      throw err;
    }
  };

  const archiveObjective = async (objectiveId: string) => {
    try {
      await objectiveService.archiveObjective(objectiveId);
      setObjectives(prev => prev.filter(obj => obj.id !== objectiveId));
    } catch (err) {
      setError('Failed to archive objective. Please try again.');
      console.error('Error archiving objective:', err);
      throw err;
    }
  };

  const linkKPI = async (objectiveId: string, kpiId: string) => {
    try {
      await objectiveService.linkKPI(objectiveId, kpiId);
      setObjectives(prev => prev.map(obj => {
        if (obj.id === objectiveId) {
          return {
            ...obj,
            kpiIds: [...(obj.kpiIds || []), kpiId]
          };
        }
        return obj;
      }));
    } catch (err) {
      setError('Failed to link KPI to objective. Please try again.');
      console.error('Error linking KPI:', err);
      throw err;
    }
  };

  const unlinkKPI = async (objectiveId: string, kpiId: string) => {
    try {
      await objectiveService.unlinkKPI(objectiveId, kpiId);
      setObjectives(prev => prev.map(obj => {
        if (obj.id === objectiveId) {
          return {
            ...obj,
            kpiIds: obj.kpiIds?.filter(id => id !== kpiId) || []
          };
        }
        return obj;
      }));
    } catch (err) {
      setError('Failed to unlink KPI from objective. Please try again.');
      console.error('Error unlinking KPI:', err);
      throw err;
    }
  };

  return {
    objectives,
    loading,
    error,
    addObjective,
    updateObjective,
    archiveObjective,
    linkKPI,
    unlinkKPI,
    refreshObjectives: fetchObjectives
  };
}