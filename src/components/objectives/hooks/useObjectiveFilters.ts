import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import type { Objective } from '../../../types';
import type { Filters, SortConfig } from '../types';
import { filterObjectives, sortObjectives } from '../utils';

const initialSort: SortConfig = {
  field: 'title',
  order: 'asc'
};

export function useObjectiveFilters(objectives: Objective[]) {
  const { user } = useAuth();
  const [filters, setFilters] = useState<Filters>({
    search: '',
    level: 'all',
    status: 'all',
    progress: 'all',
    dueDate: 'all',
    department: 'all',
    contributor: user?.id || 'all', // Set initial contributor filter to current user
    hasKpis: 'all'
  });
  const [sort, setSort] = useState<SortConfig>(initialSort);
  const [showFilters, setShowFilters] = useState(false);

  // Update contributor filter when user changes
  useEffect(() => {
    if (user) {
      setFilters(prev => ({
        ...prev,
        contributor: user.id
      }));
    }
  }, [user]);

  const departments = useMemo(() => 
    Array.from(new Set(objectives.map(obj => obj.department).filter(Boolean))),
    [objectives]
  );

  const contributors = useMemo(() => 
    Array.from(new Set(objectives.flatMap(obj => obj.contributors || []))),
    [objectives]
  );

  const filteredObjectives = useMemo(() => 
    sortObjectives(filterObjectives(objectives, filters), sort.field, sort.order),
    [objectives, filters, sort]
  );

  return {
    filters,
    setFilters,
    sort,
    setSort,
    showFilters,
    setShowFilters,
    departments,
    contributors,
    filteredObjectives
  };
}