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
    department: user?.department || 'all',
    contributor: user?.id || 'all',
    hasKpis: 'all'
  });
  const [sort, setSort] = useState<SortConfig>(initialSort);
  const [showFilters, setShowFilters] = useState(false);

  // Update contributor filter when user changes
  useEffect(() => {
    if (user) {
      setFilters(prev => ({
        ...prev,
        department: user.department || 'all',
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

  const filteredObjectives = useMemo(() => {
    // First filter objectives
    const filtered = objectives.filter(obj => {
      // Search filter
      const matchesSearch = obj.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                          obj.description?.toLowerCase().includes(filters.search.toLowerCase());
      
      // Level filter
      const matchesLevel = filters.level === 'all' || obj.level === filters.level;
      
      // Status filter
      const matchesStatus = filters.status === 'all' || obj.status === filters.status;
      
      // Progress filter
      const matchesProgress = filters.progress === 'all' || (
        filters.progress === '0-25' ? obj.progress <= 25 :
        filters.progress === '26-50' ? obj.progress > 25 && obj.progress <= 50 :
        filters.progress === '51-75' ? obj.progress > 50 && obj.progress <= 75 :
        obj.progress > 75
      );
      
      // Due date filter
      const today = new Date();
      const dueDate = new Date(obj.dueDate);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const matchesDueDate = filters.dueDate === 'all' || (
        filters.dueDate === 'overdue' ? dueDate < today :
        filters.dueDate === 'this-week' ? dueDate <= nextWeek :
        filters.dueDate === 'this-month' ? (
          dueDate.getMonth() === today.getMonth() &&
          dueDate.getFullYear() === today.getFullYear()
        ) :
        filters.dueDate === 'next-month' ? (
          dueDate.getMonth() === nextMonth.getMonth() &&
          dueDate.getFullYear() === nextMonth.getFullYear()
        ) : true
      );
      
      // Department filter - Include company objectives, department objectives, and linked individual objectives
      const matchesDepartment = filters.department === 'all' || (
        // Include if:
        obj.department === filters.department || // Direct department match
        (obj.level === 'company' && objectives.some(deptObj => // Company objective with linked department objectives
          deptObj.level === 'department' && 
          deptObj.department === filters.department && 
          deptObj.parentId === obj.id
        )) ||
        (obj.level === 'individual' && // Individual objective linked to department
          obj.parentId && 
          objectives.some(parentObj => 
            parentObj.id === obj.parentId && 
            parentObj.department === filters.department
          )
        )
      );
      
      // Contributor filter
      const matchesContributor = filters.contributor === 'all' || 
                                obj.contributors?.includes(filters.contributor);
      
      // KPIs filter
      const matchesKpis = filters.hasKpis === 'all' || (
        filters.hasKpis === 'yes' ? (obj.keyResults?.length || 0) > 0 :
        (obj.keyResults?.length || 0) === 0
      );

      return matchesSearch && matchesLevel && matchesStatus && matchesProgress && 
             matchesDueDate && matchesDepartment && matchesContributor && matchesKpis;
    });

    // Then sort filtered objectives
    return sortObjectives(filtered, sort.field, sort.order);
  }, [objectives, filters, sort]);

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