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

// Helper functions
function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfQuarter(date: Date): Date {
  const quarter = Math.floor(date.getMonth() / 3);
  return new Date(date.getFullYear(), quarter * 3, 1);
}

function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1);
}

function formatTimestamp(timestamp: Timestamp) {
  const now = new Date();
  const date = timestamp.toDate();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString();
  }
}

export const analyticsService = {
  async getAnalyticsByPeriod(period: 'week' | 'month' | 'quarter' | 'year') {
    try {
      // Get start date based on period
      const now = new Date();
      let startDate: Date;
      switch (period) {
        case 'week':
          startDate = startOfWeek(now);
          break;
        case 'month':
          startDate = startOfMonth(now);
          break;
        case 'quarter':
          startDate = startOfQuarter(now);
          break;
        case 'year':
          startDate = startOfYear(now);
          break;
      }

      // Fetch all required data in parallel
      const [objectives, keyResults, departments] = await Promise.all([
        objectiveService.getObjectives(),
        kpiService.getKPIs(),
        departmentService.getDepartments()
      ]);

      // Calculate objective completion rate
      const totalObjectives = objectives.length;
      const completedObjectives = objectives.filter(obj => obj.progress >= 100).length;
      const objectiveRate = totalObjectives > 0 ? Math.round((completedObjectives / totalObjectives) * 100) : 0;

      // Calculate team performance
      const departmentPerformance = departments.map(dept => ({
        name: dept.name,
        progress: objectives
          .filter(obj => obj.department === dept.name)
          .reduce((avg, obj) => avg + obj.progress, 0) / objectives.filter(obj => obj.department === dept.name).length || 0,
        status: 'on-track' as const // You might want to calculate this based on actual metrics
      }));

      // Calculate key results metrics
      const keyResultMetrics = {
        total: keyResults.length,
        onTrack: keyResults.filter(kr => kr.status === 'on-track').length,
        atRisk: keyResults.filter(kr => kr.status === 'at-risk').length,
        behind: keyResults.filter(kr => kr.status === 'behind').length,
        trending: {
          up: keyResults.filter(kr => kr.trend === 'up').length,
          down: keyResults.filter(kr => kr.trend === 'down').length,
          neutral: keyResults.filter(kr => kr.trend === 'stable').length
        }
      };

      // Calculate objective progress by level
      const objectiveProgress = {
        company: {
          completed: objectives.filter(obj => obj.level === 'company' && obj.progress >= 100).length,
          total: objectives.filter(obj => obj.level === 'company').length
        },
        department: {
          completed: objectives.filter(obj => obj.level === 'department' && obj.progress >= 100).length,
          total: objectives.filter(obj => obj.level === 'department').length
        },
        individual: {
          completed: objectives.filter(obj => obj.level === 'individual' && obj.progress >= 100).length,
          total: objectives.filter(obj => obj.level === 'individual').length
        }
      };

      // Get recent updates
      const recentUpdates = await this.getRecentUpdates();

      return {
        metrics: {
          objectiveRate,
          teamPerformance: Math.round(departmentPerformance.reduce((sum, dept) => sum + dept.progress, 0) / departmentPerformance.length),
          keyResultsOnTrack: keyResults.length > 0 ? Math.round((keyResultMetrics.onTrack / keyResults.length) * 100) : 0,
          activeProjects: objectives.filter(obj => obj.status === 'in-progress').length
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
  },

  async getRecentUpdates() {
    try {
      const updates = [];
      
      // Get recent objective updates
      const objectivesQuery = query(
        collection(db, 'objectives'),
        orderBy('updatedAt', 'desc'),
        limit(3)
      );
      const objectivesSnapshot = await getDocs(objectivesQuery);
      updates.push(...objectivesSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'objective' as const,
        title: `${doc.data().title} updated`,
        timestamp: formatTimestamp(doc.data().updatedAt)
      })));

      // Get recent key result updates
      const kpisQuery = query(
        collection(db, 'kpis'),
        orderBy('updatedAt', 'desc'),
        limit(3)
      );
      const kpisSnapshot = await getDocs(kpisQuery);
      updates.push(...kpisSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'key-result' as const,
        title: `${doc.data().name} updated`,
        timestamp: formatTimestamp(doc.data().updatedAt)
      })));

      // Sort updates by timestamp
      return updates.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ).slice(0, 3);
    } catch (error) {
      console.error('Error fetching recent updates:', error);
      throw error;
    }
  }
};