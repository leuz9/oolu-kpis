import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { userService } from './userService';
import { objectiveService } from './objectiveService';
import { notificationService } from './notificationService';
import type { 
  AppraisalCycle, 
  AppraisalTemplate, 
  Appraisal, 
  AppraisalResponse, 
  Feedback360, 
  AppraisalAnalytics,
  AppraisalGoal,
  AppraisalCompetency
} from '../types';

const COLLECTIONS = {
  CYCLES: 'appraisal_cycles',
  TEMPLATES: 'appraisal_templates',
  APPRAISALS: 'appraisals',
  RESPONSES: 'appraisal_responses',
  FEEDBACK_360: 'feedback_360',
  GOALS: 'appraisal_goals',
  COMPETENCIES: 'appraisal_competencies'
};

export class AppraisalService {
  // Appraisal Cycles
  static async getCycles(): Promise<AppraisalCycle[]> {
    try {
      const cyclesRef = collection(db, COLLECTIONS.CYCLES);
      const q = query(cyclesRef, orderBy('year', 'desc'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppraisalCycle));
    } catch (error) {
      console.error('Error fetching appraisal cycles:', error);
      throw error;
    }
  }

  static async getCycle(id: string): Promise<AppraisalCycle | null> {
    try {
      const cycleRef = doc(db, COLLECTIONS.CYCLES, id);
      const snapshot = await getDoc(cycleRef);
      return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as AppraisalCycle : null;
    } catch (error) {
      console.error('Error fetching appraisal cycle:', error);
      throw error;
    }
  }

  static async createCycle(cycle: Omit<AppraisalCycle, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const cyclesRef = collection(db, COLLECTIONS.CYCLES);
      const docRef = await addDoc(cyclesRef, {
        ...cycle,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating appraisal cycle:', error);
      throw error;
    }
  }

  static async updateCycle(id: string, updates: Partial<AppraisalCycle>): Promise<void> {
    try {
      const cycleRef = doc(db, COLLECTIONS.CYCLES, id);
      await updateDoc(cycleRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating appraisal cycle:', error);
      throw error;
    }
  }

  static async deleteCycle(id: string): Promise<void> {
    try {
      const cycleRef = doc(db, COLLECTIONS.CYCLES, id);
      await deleteDoc(cycleRef);
    } catch (error) {
      console.error('Error deleting appraisal cycle:', error);
      throw error;
    }
  }

  // Appraisal Templates
  static async getTemplates(): Promise<AppraisalTemplate[]> {
    try {
      const templatesRef = collection(db, COLLECTIONS.TEMPLATES);
      const q = query(templatesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppraisalTemplate));
    } catch (error) {
      console.error('Error fetching appraisal templates:', error);
      throw error;
    }
  }

  static async getTemplate(id: string): Promise<AppraisalTemplate | null> {
    try {
      const templateRef = doc(db, COLLECTIONS.TEMPLATES, id);
      const snapshot = await getDoc(templateRef);
      return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as AppraisalTemplate : null;
    } catch (error) {
      console.error('Error fetching appraisal template:', error);
      throw error;
    }
  }

  static async createTemplate(template: Omit<AppraisalTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const templatesRef = collection(db, COLLECTIONS.TEMPLATES);
      const docRef = await addDoc(templatesRef, {
        ...template,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating appraisal template:', error);
      throw error;
    }
  }

  static async updateTemplate(id: string, updates: Partial<AppraisalTemplate>): Promise<void> {
    try {
      const templateRef = doc(db, COLLECTIONS.TEMPLATES, id);
      await updateDoc(templateRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating appraisal template:', error);
      throw error;
    }
  }

  static async deleteTemplate(id: string): Promise<void> {
    try {
      const templateRef = doc(db, COLLECTIONS.TEMPLATES, id);
      await deleteDoc(templateRef);
    } catch (error) {
      console.error('Error deleting appraisal template:', error);
      throw error;
    }
  }

  // Appraisals
  static async getAppraisals(cycleId?: string, employeeId?: string): Promise<Appraisal[]> {
    try {
      const appraisalsRef = collection(db, COLLECTIONS.APPRAISALS);
      let q = query(appraisalsRef, orderBy('createdAt', 'desc'));

      if (cycleId) {
        q = query(q, where('cycleId', '==', cycleId));
      }
      if (employeeId) {
        q = query(q, where('employeeId', '==', employeeId));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appraisal));
    } catch (error) {
      console.error('Error fetching appraisals:', error);
      throw error;
    }
  }

  static async getAppraisal(id: string): Promise<Appraisal | null> {
    try {
      const appraisalRef = doc(db, COLLECTIONS.APPRAISALS, id);
      const snapshot = await getDoc(appraisalRef);
      return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as Appraisal : null;
    } catch (error) {
      console.error('Error fetching appraisal:', error);
      throw error;
    }
  }

  static async createAppraisal(appraisal: Omit<Appraisal, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const appraisalsRef = collection(db, COLLECTIONS.APPRAISALS);
      const docRef = await addDoc(appraisalsRef, {
        ...appraisal,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating appraisal:', error);
      throw error;
    }
  }

  static async updateAppraisal(id: string, updates: Partial<Appraisal>): Promise<void> {
    try {
      const appraisalRef = doc(db, COLLECTIONS.APPRAISALS, id);
      await updateDoc(appraisalRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating appraisal:', error);
      throw error;
    }
  }

  static async deleteAppraisal(id: string): Promise<void> {
    try {
      const appraisalRef = doc(db, COLLECTIONS.APPRAISALS, id);
      await deleteDoc(appraisalRef);
    } catch (error) {
      console.error('Error deleting appraisal:', error);
      throw error;
    }
  }

  // Helper function to calculate overall rating from responses
  private static calculateOverallRating(responses: AppraisalResponse[]): number {
    const validResponses = responses.filter(r => r && r.responses);
    if (validResponses.length === 0) return 0;

    let totalRating = 0;
    let ratingCount = 0;

    validResponses.forEach(response => {
      response.responses.forEach(questionResponse => {
        if (typeof questionResponse.answer === 'number') {
          totalRating += questionResponse.answer;
          ratingCount++;
        }
      });
    });

    return ratingCount > 0 ? totalRating / ratingCount : 0;
  }

  // Appraisal Responses
  static async submitResponse(appraisalId: string, response: AppraisalResponse, type: 'self' | 'manager' | 'hr'): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Add the response
      const responsesRef = collection(db, COLLECTIONS.RESPONSES);
      const responseRef = doc(responsesRef);
      batch.set(responseRef, {
        ...response,
        appraisalId,
        type,
        submittedAt: serverTimestamp()
      });

      // Get current appraisal and template to determine next status
      const appraisalRef = doc(db, COLLECTIONS.APPRAISALS, appraisalId);
      const appraisalDoc = await getDoc(appraisalRef);
      const currentAppraisal = appraisalDoc.data() as Appraisal;
      
      // Get template to check reviewType
      const templateRef = doc(db, COLLECTIONS.TEMPLATES, currentAppraisal.templateId);
      const templateDoc = await getDoc(templateRef);
      const template = templateDoc.data() as AppraisalTemplate;

      // Update the appraisal with the response
      const updateData: any = {
        updatedAt: serverTimestamp()
      };

      if (type === 'self') {
        updateData.selfReview = response;
        // For "both" type: go to manager-review, for "self" type: complete
        if (template?.reviewType === 'both') {
          updateData.status = 'manager-review';
        } else if (template?.reviewType === 'self') {
          updateData.status = 'completed';
          updateData.completedAt = serverTimestamp();
        }
      } else if (type === 'manager') {
        updateData.managerReview = response;
        // For "both" type: go to hr-review, for "manager" type: complete
        if (template?.reviewType === 'both') {
          updateData.status = 'hr-review';
        } else if (template?.reviewType === 'manager') {
          updateData.status = 'completed';
          updateData.completedAt = serverTimestamp();
        }
        
        // Calculate overall rating when manager review is submitted
        const allResponses = [
          currentAppraisal.selfReview,
          response
        ].filter(r => r) as AppraisalResponse[];
        updateData.overallRating = this.calculateOverallRating(allResponses);
      } else if (type === 'hr') {
        updateData.hrReview = response;
        updateData.status = 'completed';
        updateData.completedAt = serverTimestamp();
        
        // Final overall rating calculation including all reviews
        const allResponses = [
          currentAppraisal.selfReview,
          currentAppraisal.managerReview,
          response
        ].filter(r => r) as AppraisalResponse[];
        updateData.overallRating = this.calculateOverallRating(allResponses);
      }

      batch.update(appraisalRef, updateData);
      await batch.commit();

      // Send notifications based on the type of response submitted
      try {
        const employee = await userService.getUser(currentAppraisal.employeeId);
        const manager = currentAppraisal.managerId ? await userService.getUser(currentAppraisal.managerId) : null;
        
        if (type === 'self') {
          // Notify manager that employee completed self-review
          if (manager && currentAppraisal.managerId !== currentAppraisal.employeeId) {
            await notificationService.createNotification({
              userId: currentAppraisal.managerId,
              title: 'Self-Review Completed',
              message: `${employee?.name || employee?.email || 'Employee'} has completed their self-review. Please complete your manager review.`,
              type: 'appraisal',
              priority: 'medium',
              link: '/appraisals'
            } as any);
          }
        } else if (type === 'manager') {
          // Notify employee that manager completed review
          await notificationService.createNotification({
            userId: currentAppraisal.employeeId,
            title: 'Manager Review Completed',
            message: `Your manager has completed their review of your appraisal. ${template?.reviewType === 'both' ? 'HR review is now pending.' : 'Your appraisal is now complete.'}`,
            type: 'appraisal',
            priority: 'medium',
            link: '/appraisals'
          } as any);
        } else if (type === 'hr') {
          // Notify employee and manager that appraisal is complete
          await notificationService.createNotification({
            userId: currentAppraisal.employeeId,
            title: 'Appraisal Complete',
            message: 'Your annual appraisal has been completed. You can view the final results.',
            type: 'appraisal',
            priority: 'medium',
            link: '/appraisals'
          } as any);
          
          if (manager && currentAppraisal.managerId !== currentAppraisal.employeeId) {
            await notificationService.createNotification({
              userId: currentAppraisal.managerId,
              title: 'Appraisal Complete',
              message: `The appraisal for ${employee?.name || employee?.email || 'your employee'} has been completed by HR.`,
              type: 'appraisal',
              priority: 'medium',
              link: '/appraisals'
            } as any);
          }
        }
      } catch (error) {
        console.error('Error sending appraisal submission notifications:', error);
        // Don't throw error here as the response was submitted successfully
      }
    } catch (error) {
      console.error('Error submitting appraisal response:', error);
      throw error;
    }
  }

  // 360 Feedback
  static async getFeedback360(appraisalId: string): Promise<Feedback360[]> {
    try {
      const feedbackRef = collection(db, COLLECTIONS.FEEDBACK_360);
      const q = query(feedbackRef, where('appraisalId', '==', appraisalId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Feedback360));
    } catch (error) {
      console.error('Error fetching 360 feedback:', error);
      throw error;
    }
  }

  static async submitFeedback360(feedback: Omit<Feedback360, 'id' | 'createdAt'>): Promise<string> {
    try {
      const feedbackRef = collection(db, COLLECTIONS.FEEDBACK_360);
      const docRef = await addDoc(feedbackRef, {
        ...feedback,
        createdAt: serverTimestamp()
      });

      // Send notification to the employee being reviewed
      try {
        const employee = await userService.getUser(feedback.revieweeId);
        const reviewer = await userService.getUser(feedback.reviewerId);
        
        await notificationService.createNotification({
          userId: feedback.revieweeId,
          title: '360° Feedback Received',
          message: `${reviewer?.name || reviewer?.email || 'A colleague'} has provided 360° feedback for your appraisal.`,
          type: 'appraisal',
          priority: 'low',
          link: '/appraisals'
        } as any);
      } catch (error) {
        console.error('Error sending 360 feedback notification:', error);
        // Don't throw error here as the feedback was submitted successfully
      }

      return docRef.id;
    } catch (error) {
      console.error('Error submitting 360 feedback:', error);
      throw error;
    }
  }

  static async deleteFeedback360(feedbackId: string): Promise<void> {
    try {
      const feedbackRef = doc(db, COLLECTIONS.FEEDBACK_360, feedbackId);
      await deleteDoc(feedbackRef);
    } catch (error) {
      console.error('Error deleting 360 feedback:', error);
      throw error;
    }
  }

  static async updateFeedback360(feedbackId: string, updates: Partial<Feedback360>): Promise<void> {
    try {
      const feedbackRef = doc(db, COLLECTIONS.FEEDBACK_360, feedbackId);
      await updateDoc(feedbackRef, updates);
    } catch (error) {
      console.error('Error updating 360 feedback:', error);
      throw error;
    }
  }

  // Goals and Competencies
  static async updateGoals(appraisalId: string, goals: AppraisalGoal[]): Promise<void> {
    try {
      const appraisalRef = doc(db, COLLECTIONS.APPRAISALS, appraisalId);
      await updateDoc(appraisalRef, {
        goals,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating appraisal goals:', error);
      throw error;
    }
  }

  static async updateCompetencies(appraisalId: string, competencies: AppraisalCompetency[]): Promise<void> {
    try {
      const appraisalRef = doc(db, COLLECTIONS.APPRAISALS, appraisalId);
      await updateDoc(appraisalRef, {
        competencies,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating appraisal competencies:', error);
      throw error;
    }
  }

  // Analytics
  static async getAppraisalAnalytics(cycleId: string): Promise<AppraisalAnalytics> {
    try {
      const appraisals = await this.getAppraisals(cycleId);
      const completedAppraisals = appraisals.filter(a => a.status === 'completed');
      
      const totalAppraisals = appraisals.length;
      const completedCount = completedAppraisals.length;
      
      // Filter valid ratings and calculate average
      const validRatings = completedAppraisals
        .map(a => a.overallRating)
        .filter(r => r !== undefined && r !== null && typeof r === 'number' && !isNaN(r)) as number[];
      
      const averageRating = validRatings.length > 0 
        ? validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length 
        : 0;
      
      // Rating distribution with better handling
      const ratingDistribution: { [key: string]: number } = {
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 0
      };
      
      validRatings.forEach(rating => {
        const key = Math.floor(rating).toString();
        if (ratingDistribution.hasOwnProperty(key)) {
          ratingDistribution[key]++;
        }
      });

      // Status breakdown
      const statusBreakdown = {
        draft: appraisals.filter(a => a.status === 'draft').length,
        'self-review': appraisals.filter(a => a.status === 'self-review').length,
        'manager-review': appraisals.filter(a => a.status === 'manager-review').length,
        'hr-review': appraisals.filter(a => a.status === 'hr-review').length,
        completed: completedCount,
        cancelled: appraisals.filter(a => a.status === 'cancelled').length
      };

      // Department breakdown (improved)
      const departmentBreakdown: { [department: string]: { count: number; averageRating: number } } = {};
      completedAppraisals.forEach(appraisal => {
        // This would need to be joined with user data to get department
        // For now, we'll use a placeholder
        const department = 'Unknown';
        if (!departmentBreakdown[department]) {
          departmentBreakdown[department] = { count: 0, averageRating: 0 };
        }
        departmentBreakdown[department].count++;
        if (appraisal.overallRating && typeof appraisal.overallRating === 'number') {
          departmentBreakdown[department].averageRating += appraisal.overallRating;
        }
      });

      // Calculate average ratings per department
      Object.keys(departmentBreakdown).forEach(dept => {
        const deptData = departmentBreakdown[dept];
        deptData.averageRating = deptData.count > 0 ? deptData.averageRating / deptData.count : 0;
      });

      // Competency gaps analysis (improved)
      const competencyGaps = completedAppraisals
        .flatMap(a => a.competencies || [])
        .filter(c => c && c.name && typeof c.rating === 'number')
        .reduce((acc, competency) => {
          const existing = acc.find(c => c.competency === competency.name);
          if (existing) {
            existing.averageRating = (existing.averageRating + competency.rating) / 2;
          } else {
            acc.push({
              competency: competency.name,
              averageRating: competency.rating,
              improvementNeeded: competency.rating < 3
            });
          }
          return acc;
        }, [] as { competency: string; averageRating: number; improvementNeeded: boolean }[]);

      return {
        cycleId,
        totalAppraisals,
        completedAppraisals: completedCount,
        averageRating,
        ratingDistribution,
        statusBreakdown,
        departmentBreakdown,
        competencyGaps
      };
    } catch (error) {
      console.error('Error generating appraisal analytics:', error);
      throw error;
    }
  }

  // Bulk operations
  static async createAppraisalsForCycle(cycleId: string, employeeIds: string[], templateId: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      const appraisalsRef = collection(db, COLLECTIONS.APPRAISALS);

      // Load all users to get their managers
      const usersData = await Promise.all(
        employeeIds.map(async (employeeId) => {
          try {
            const user = await userService.getUser(employeeId);
            return { employeeId, user };
          } catch (error) {
            console.error(`Error loading user ${employeeId}:`, error);
            return { employeeId, user: null };
          }
        })
      );

      for (const { employeeId, user } of usersData) {
        // Get manager from user data first, then team data, or use employee as fallback
        let managerId = employeeId; // Default to self
        
        if (user) {
          // First check if user has a managerId field directly
          if (user.managerId && typeof user.managerId === 'string' && user.managerId.trim() !== '') {
            managerId = user.managerId;
          } else {
            // Try to get manager from team collection
            try {
              const teamQuery = query(
                collection(db, 'team'),
                where('userId', '==', employeeId)
              );
              const teamSnapshot = await getDocs(teamQuery);
              if (!teamSnapshot.empty) {
                const teamData = teamSnapshot.docs[0].data();
                if (teamData.manager && teamData.manager.trim() !== '') {
                  managerId = teamData.manager;
                }
              }
            } catch (error) {
              console.error(`Error getting manager for ${employeeId}:`, error);
            }
          }
        }

        const appraisalRef = doc(appraisalsRef);
        batch.set(appraisalRef, {
          cycleId,
          employeeId,
          managerId,
          templateId,
          status: 'draft',
          goals: [],
          competencies: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      await batch.commit();

      // Send notifications to employees and managers
      try {
        const cycle = await this.getCycle(cycleId);
        const template = await this.getTemplate(templateId);
        
        for (const { employeeId, user } of usersData) {
          if (user) {
            // Get manager info
            let managerId = employeeId;
            if (user.managerId && typeof user.managerId === 'string' && user.managerId.trim() !== '') {
              managerId = user.managerId;
            } else {
              try {
                const teamQuery = query(
                  collection(db, 'team'),
                  where('userId', '==', employeeId)
                );
                const teamSnapshot = await getDocs(teamQuery);
                if (!teamSnapshot.empty) {
                  const teamData = teamSnapshot.docs[0].data();
                  if (teamData.manager && teamData.manager.trim() !== '') {
                    managerId = teamData.manager;
                  }
                }
              } catch (error) {
                console.error(`Error getting manager for notification ${employeeId}:`, error);
              }
            }

            // Notify employee
            try {
              await notificationService.createNotification({
                userId: employeeId,
                title: 'New Appraisal Created',
                message: `A new appraisal has been created for you for ${cycle?.name || 'the current cycle'}. Please complete your self-review when ready.`,
                type: 'appraisal',
                priority: 'medium',
                link: '/appraisals'
              } as any);
            } catch (error) {
              console.error(`Error notifying employee ${employeeId}:`, error);
            }

            // Notify manager (if different from employee)
            if (managerId !== employeeId) {
              try {
                await notificationService.createNotification({
                  userId: managerId,
                  title: 'New Appraisal to Review',
                  message: `A new appraisal has been created for ${user.name || user.email} for ${cycle?.name || 'the current cycle'}. Please review when the employee completes their self-review.`,
                  type: 'appraisal',
                  priority: 'medium',
                  link: '/appraisals'
                } as any);
              } catch (error) {
                console.error(`Error notifying manager ${managerId}:`, error);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error sending appraisal notifications:', error);
        // Don't throw error here as appraisals were created successfully
      }
    } catch (error) {
      console.error('Error creating appraisals for cycle:', error);
      throw error;
    }
  }

  // Recalculate overall rating for an appraisal
  static async recalculateOverallRating(appraisalId: string): Promise<number> {
    try {
      const appraisal = await this.getAppraisal(appraisalId);
      if (!appraisal) {
        throw new Error('Appraisal not found');
      }

      const allResponses = [
        appraisal.selfReview,
        appraisal.managerReview,
        appraisal.hrReview
      ].filter(r => r) as AppraisalResponse[];

      const overallRating = this.calculateOverallRating(allResponses);

      // Update the appraisal
      await this.updateAppraisal(appraisalId, { overallRating });

      return overallRating;
    } catch (error) {
      console.error('Error recalculating overall rating:', error);
      throw error;
    }
  }

  // Import employee objectives as appraisal goals
  static async importEmployeeObjectives(employeeId: string): Promise<AppraisalGoal[]> {
    try {
      const objectives = await objectiveService.getObjectives();
      
      // Filter objectives where employee is a contributor
      const employeeObjectives = objectives.filter(obj => 
        obj.contributors?.includes(employeeId) || 
        obj.level === 'individual'
      );

      // Convert objectives to appraisal goals
      const goals: AppraisalGoal[] = employeeObjectives.map(objective => ({
        id: objective.id,
        title: objective.title,
        description: objective.description,
        target: `${objective.progress}% completion`,
        actual: `${objective.progress}%`,
        rating: objective.progress >= 90 ? 5 : 
                objective.progress >= 75 ? 4 : 
                objective.progress >= 60 ? 3 : 
                objective.progress >= 40 ? 2 : 1,
        status: objective.progress >= 90 ? 'achieved' : 
                objective.progress >= 60 ? 'partially-achieved' : 
                'not-achieved',
        comments: `Status: ${objective.status}, Progress: ${objective.progress}%`
      }));

      return goals;
    } catch (error) {
      console.error('Error importing employee objectives:', error);
      throw error;
    }
  }
}
