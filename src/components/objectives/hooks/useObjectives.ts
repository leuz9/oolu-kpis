import { useState, useEffect } from 'react';
import { objectiveService } from '../../../services/objectiveService';
import type { Objective } from '../../../types';

export function useObjectives() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Use real-time listener instead of one-time fetch
    const unsubscribe = objectiveService.subscribeToObjectives((objectives) => {
      setObjectives(objectives);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
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
      // No need to manually update state - real-time listener will handle it
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
      // No need to manually update state - real-time listener will handle it
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
      // No need to manually update state - real-time listener will handle it
    } catch (err: any) {
      setError(err.message || 'Failed to archive objective. Please try again.');
      console.error('Error archiving objective:', err);
      throw err;
    }
  };

  const deleteObjective = async (objectiveId: string) => {
    try {
      await objectiveService.deleteObjective(objectiveId);
      // No need to manually update state - real-time listener will handle it
    } catch (err: any) {
      if (err.message === 'Only superadmin can delete objectives') {
        setError('Only superadmin can delete objectives');
      } else {
        setError('Failed to delete objective. Please try again.');
      }
      console.error('Error deleting objective:', err);
      throw err;
    }
  };

  const linkKPI = async (objectiveId: string, kpiId: string) => {
    try {
      await objectiveService.linkKPI(objectiveId, kpiId);
      // No need to manually update state - real-time listener will handle it
    } catch (err) {
      setError('Failed to link KPI to objective. Please try again.');
      console.error('Error linking KPI:', err);
      throw err;
    }
  };

  const unlinkKPI = async (objectiveId: string, kpiId: string) => {
    try {
      await objectiveService.unlinkKPI(objectiveId, kpiId);
      // No need to manually update state - real-time listener will handle it
    } catch (err) {
      setError('Failed to unlink KPI from objective. Please try again.');
      console.error('Error unlinking KPI:', err);
      throw err;
    }
  };

  const updateProgress = async (objectiveId: string, progress: number, comment: string, keyResultUpdates?: Record<string, number>) => {
    try {
      const updatedObjective = await objectiveService.updateProgress(objectiveId, progress, comment, keyResultUpdates);
      // No need to manually update state - real-time listener will handle it
      return updatedObjective;
    } catch (err) {
      setError('Failed to update objective progress. Please try again.');
      console.error('Error updating progress:', err);
      throw err;
    }
  };

  return {
    objectives,
    loading,
    error,
    addObjective,
    updateObjective,
    updateProgress,
    archiveObjective,
    deleteObjective,
    linkKPI,
    unlinkKPI,
    refreshObjectives: fetchObjectives
  };
}