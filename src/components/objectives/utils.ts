import type { Objective, Filters } from '../../types';

export function filterObjectives(objectives: Objective[], filters: Filters) {
  return objectives.filter(obj => {
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
    
    // Department filter
    const matchesDepartment = filters.department === 'all' || obj.department === filters.department;
    
    // Contributor filter
    const matchesContributor = filters.contributor === 'all' || 
                              obj.contributors?.includes(filters.contributor);
    
    // KPIs filter
    const matchesKpis = filters.hasKpis === 'all' || (
      filters.hasKpis === 'yes' ? (obj.kpiIds?.length || 0) > 0 :
      (obj.kpiIds?.length || 0) === 0
    );

    return matchesSearch && matchesLevel && matchesStatus && matchesProgress && 
           matchesDueDate && matchesDepartment && matchesContributor && matchesKpis;
  });
}

export function sortObjectives(objectives: Objective[], field: string, order: 'asc' | 'desc') {
  return [...objectives].sort((a, b) => {
    let comparison = 0;
    switch (field) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'progress':
        comparison = a.progress - b.progress;
        break;
      case 'dueDate':
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        break;
      case 'status': {
        const statusOrder = { 'on-track': 0, 'at-risk': 1, 'behind': 2 };
        comparison = statusOrder[a.status] - statusOrder[b.status];
        break;
      }
      case 'level': {
        const levelOrder = { company: 0, department: 1, individual: 2 };
        comparison = levelOrder[a.level] - levelOrder[b.level];
        break;
      }
    }
    return order === 'asc' ? comparison : -comparison;
  });
}