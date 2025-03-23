import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { objectiveService } from './objectiveService';
import { kpiService } from './kpiService';
import { departmentService } from './departmentService';

// Custom date utility functions
function startOfDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

function endOfDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
}

function startOfWeek(date: Date): Date {
  const newDate = new Date(date);
  const day = newDate.getDay();
  const diff = newDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  newDate.setDate(diff);
  return startOfDay(newDate);
}

function endOfWeek(date: Date): Date {
  const newDate = new Date(date);
  const day = newDate.getDay();
  const diff = newDate.getDate() + (day === 0 ? 0 : 7 - day);
  newDate.setDate(diff);
  return endOfDay(newDate);
}

function startOfMonth(date: Date): Date {
  const newDate = new Date(date);
  newDate.setDate(1);
  return startOfDay(newDate);
}

function endOfMonth(date: Date): Date {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + 1);
  newDate.setDate(0);
  return endOfDay(newDate);
}

function startOfQuarter(date: Date): Date {
  const newDate = new Date(date);
  const month = Math.floor(newDate.getMonth() / 3) * 3;
  newDate.setMonth(month);
  newDate.setDate(1);
  return startOfDay(newDate);
}

function endOfQuarter(date: Date): Date {
  const newDate = new Date(date);
  const month = Math.floor(newDate.getMonth() / 3) * 3 + 2;
  newDate.setMonth(month + 1);
  newDate.setDate(0);
  return endOfDay(newDate);
}

function startOfYear(date: Date): Date {
  const newDate = new Date(date);
  newDate.setMonth(0, 1);
  return startOfDay(newDate);
}

function endOfYear(date: Date): Date {
  const newDate = new Date(date);
  newDate.setMonth(11, 31);
  return endOfDay(newDate);
}

// Helper functions
function getDateRange(period: 'week' | 'month' | 'quarter' | 'year') {
  const now = new Date();
  switch (period) {
    case 'week':
      return {
        start: startOfWeek(now),
        end: endOfWeek(now)
      };
    case 'month':
      return {
        start: startOfMonth(now),
        end: endOfMonth(now)
      };
    case 'quarter':
      return {
        start: startOfQuarter(now),
        end: endOfQuarter(now)
      };
    case 'year':
      return {
        start: startOfYear(now),
        end: endOfYear(now)
      };
  }
}

function formatDate(timestamp: any): string {
  if (!timestamp) return '';
  
  // Handle Firestore Timestamp
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toLocaleDateString();
  }
  
  // Handle Date object
  if (timestamp instanceof Date) {
    return timestamp.toLocaleDateString();
  }
  
  // Handle string date
  if (typeof timestamp === 'string') {
    return new Date(timestamp).toLocaleDateString();
  }
  
  // Handle timestamp with nanoseconds/seconds
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  }
  
  return '';
}

export const analyticsService = {
  async getAnalyticsByPeriod(period: 'week' | 'month' | 'quarter' | 'year') {
    try {
      const dateRange = getDateRange(period);

      // Fetch all required data in parallel
      const [objectives, keyResults, departments] = await Promise.all([
        objectiveService.getObjectives(),
        kpiService.getKPIs(),
        departmentService.getDepartments()
      ]);

      // Filter data by date range
      const filteredObjectives = objectives.filter(obj => {
        const createdAt = new Date(obj.createdAt);
        return createdAt >= dateRange.start && createdAt <= dateRange.end;
      });

      const filteredKPIs = keyResults.filter(kpi => {
        const updatedAt = new Date(kpi.lastUpdated);
        return updatedAt >= dateRange.start && updatedAt <= dateRange.end;
      });

      // Calculate metrics
      const objectiveRate = calculateObjectiveRate(filteredObjectives);
      const teamPerformance = calculateTeamPerformance(filteredObjectives, departments);
      const keyResultsOnTrack = calculateKeyResultsOnTrack(filteredKPIs);
      const activeProjects = calculateActiveProjects(filteredObjectives);

      // Calculate department performance
      const departmentPerformance = calculateDepartmentPerformance(filteredObjectives, departments);

      // Calculate objective progress
      const objectiveProgress = calculateObjectiveProgress(filteredObjectives);

      // Calculate key results metrics
      const keyResultMetrics = calculateKeyResultMetrics(filteredKPIs);

      // Get recent updates
      const recentUpdates = await getRecentUpdates(dateRange.start, dateRange.end);

      return {
        metrics: {
          objectiveRate,
          teamPerformance,
          keyResultsOnTrack,
          activeProjects
        },
        departmentPerformance,
        objectiveProgress,
        keyResultMetrics,
        recentUpdates
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }
};

// Helper functions for calculations
function calculateObjectiveRate(objectives: any[]): number {
  if (!objectives.length) return 0;
  const completed = objectives.filter(obj => obj.progress >= 100).length;
  return Math.round((completed / objectives.length) * 100);
}

function calculateTeamPerformance(objectives: any[], departments: any[]): number {
  if (!departments.length) return 0;
  const departmentScores = departments.map(dept => {
    const deptObjectives = objectives.filter(obj => obj.department === dept.id);
    if (!deptObjectives.length) return 0;
    return deptObjectives.reduce((sum, obj) => sum + obj.progress, 0) / deptObjectives.length;
  });
  return Math.round(departmentScores.reduce((sum, score) => sum + score, 0) / departments.length);
}

function calculateKeyResultsOnTrack(kpis: any[]): number {
  if (!kpis.length) return 0;
  const onTrack = kpis.filter(kpi => kpi.status === 'on-track').length;
  return Math.round((onTrack / kpis.length) * 100);
}

function calculateActiveProjects(objectives: any[]): number {
  return objectives.filter(obj => obj.status === 'in-progress').length;
}

function calculateDepartmentPerformance(objectives: any[], departments: any[]) {
  return departments.map(dept => {
    const deptObjectives = objectives.filter(obj => obj.department === dept.id);
    const progress = deptObjectives.length
      ? Math.round(deptObjectives.reduce((sum, obj) => sum + obj.progress, 0) / deptObjectives.length)
      : 0;
    
    return {
      name: dept.name,
      progress,
      status: progress >= 90 ? 'on-track' : progress >= 60 ? 'at-risk' : 'behind'
    };
  });
}

function calculateObjectiveProgress(objectives: any[]) {
  const company = objectives.filter(obj => obj.level === 'company');
  const department = objectives.filter(obj => obj.level === 'department');
  const individual = objectives.filter(obj => obj.level === 'individual');

  return {
    company: {
      completed: company.filter(obj => obj.progress >= 100).length,
      total: company.length
    },
    department: {
      completed: department.filter(obj => obj.progress >= 100).length,
      total: department.length
    },
    individual: {
      completed: individual.filter(obj => obj.progress >= 100).length,
      total: individual.length
    }
  };
}

function calculateKeyResultMetrics(kpis: any[]) {
  return {
    total: kpis.length,
    onTrack: kpis.filter(kpi => kpi.status === 'on-track').length,
    atRisk: kpis.filter(kpi => kpi.status === 'at-risk').length,
    behind: kpis.filter(kpi => kpi.status === 'behind').length,
    trending: {
      up: kpis.filter(kpi => kpi.trend === 'up').length,
      down: kpis.filter(kpi => kpi.trend === 'down').length,
      neutral: kpis.filter(kpi => kpi.trend === 'stable').length
    }
  };
}

async function getRecentUpdates(startDate: Date, endDate: Date) {
  try {
    // Get recent objective updates
    const objectivesQuery = query(
      collection(db, 'objectives'),
      where('updatedAt', '>=', startDate),
      where('updatedAt', '<=', endDate),
      orderBy('updatedAt', 'desc'),
      limit(3)
    );
    const objectivesSnapshot = await getDocs(objectivesQuery);
    const objectiveUpdates = objectivesSnapshot.docs.map(doc => ({
      id: doc.id,
      type: 'objective' as const,
      title: `${doc.data().title} updated`,
      timestamp: formatDate(doc.data().updatedAt)
    }));

    // Get recent key result updates
    const kpisQuery = query(
      collection(db, 'kpis'),
      where('updatedAt', '>=', startDate),
      where('updatedAt', '<=', endDate),
      orderBy('updatedAt', 'desc'),
      limit(3)
    );
    const kpisSnapshot = await getDocs(kpisQuery);
    const kpiUpdates = kpisSnapshot.docs.map(doc => ({
      id: doc.id,
      type: 'key-result' as const,
      title: `${doc.data().name} updated`,
      timestamp: formatDate(doc.data().updatedAt)
    }));

    // Combine and sort updates
    return [...objectiveUpdates, ...kpiUpdates]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 3);
  } catch (error) {
    console.error('Error fetching recent updates:', error);
    return [];
  }
}