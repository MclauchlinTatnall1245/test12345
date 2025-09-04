import { useState, useEffect, useCallback } from 'react';
import { Goal, DayPlan, MissedReason } from '../types';
import { DataService } from '../lib/data-service';
import TimeService from '../lib/time-service';

export interface UseTodayGoalsResult {
  goals: Goal[];
  dayPlan: DayPlan | null;
  loading: boolean;
  error: string | null;
  todayDate: string;
  
  // Actions
  toggleGoal: (goalId: string) => Promise<void>;
  addGoal: (newGoal: Goal) => Promise<void>;
  editGoal: (updatedGoal: Goal) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  markGoalAsMissed: (goalId: string, reason: MissedReason, notes?: string) => Promise<void>;
  refreshGoals: () => Promise<void>;
}

export function useTodayGoals(): UseTodayGoalsResult {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [dayPlan, setDayPlan] = useState<DayPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const todayDate = TimeService.getCurrentDate();

  const loadTodaysPlan = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const plan = await DataService.getDayPlan(todayDate);
      setDayPlan(plan);
      setGoals(plan?.goals || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis bij het laden van de doelen');
      console.error('Error loading today plan:', err);
    } finally {
      setLoading(false);
    }
  }, [todayDate]);

  useEffect(() => {
    loadTodaysPlan();
  }, [loadTodaysPlan]);

  const toggleGoal = useCallback(async (goalId: string) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const updatedGoal = {
        ...goal,
        completed: !goal.completed,
        completedAt: !goal.completed ? new Date() : undefined
      };

      // Optimistic update
      const updatedGoals = goals.map(g => g.id === goalId ? updatedGoal : g);
      setGoals(updatedGoals);

      // Persist to storage
      await DataService.updateGoal(todayDate, goalId, {
        completed: updatedGoal.completed,
        completedAt: updatedGoal.completedAt
      });
    } catch (err) {
      setError('Er ging iets mis bij het updaten van het doel');
      console.error('Error toggling goal:', err);
      // Revert optimistic update on error
      await loadTodaysPlan();
    }
  }, [goals, todayDate, loadTodaysPlan]);

  const addGoal = useCallback(async (newGoal: Goal) => {
    try {
      // Optimistic update
      setGoals(prevGoals => [...prevGoals, newGoal]);

      // Persist to storage
      await DataService.addGoalToDayPlan(todayDate, newGoal);
    } catch (err) {
      setError('Er ging iets mis bij het toevoegen van het doel');
      console.error('Error adding goal:', err);
      // Revert optimistic update on error
      await loadTodaysPlan();
    }
  }, [todayDate, loadTodaysPlan]);

  const editGoal = useCallback(async (updatedGoal: Goal) => {
    try {
      // Optimistic update
      const updatedGoals = goals.map(goal => 
        goal.id === updatedGoal.id ? updatedGoal : goal
      );
      setGoals(updatedGoals);

      // Persist to storage
      await DataService.updateGoal(todayDate, updatedGoal.id, updatedGoal);
    } catch (err) {
      setError('Er ging iets mis bij het bewerken van het doel');
      console.error('Error editing goal:', err);
      // Revert optimistic update on error
      await loadTodaysPlan();
    }
  }, [goals, todayDate, loadTodaysPlan]);

  const deleteGoal = useCallback(async (goalId: string) => {
    try {
      // Optimistic update
      const updatedGoals = goals.filter(goal => goal.id !== goalId);
      setGoals(updatedGoals);

      // Persist to storage
      await DataService.deleteGoal(todayDate, goalId);
    } catch (err) {
      setError('Er ging iets mis bij het verwijderen van het doel');
      console.error('Error deleting goal:', err);
      // Revert optimistic update on error
      await loadTodaysPlan();
    }
  }, [goals, todayDate, loadTodaysPlan]);

  const markGoalAsMissed = useCallback(async (goalId: string, reason: MissedReason, notes?: string) => {
    try {
      if (reason === 'wrong_goal') {
        // Remove the goal completely
        await deleteGoal(goalId);
      } else {
        // Mark as missed
        const updatedGoals = goals.map(goal => 
          goal.id === goalId 
            ? { ...goal, missed: { reason, notes, missedAt: new Date() } }
            : goal
        );
        setGoals(updatedGoals);

        // TODO: Implement markGoalAsMissed in DataService
        await DataService.updateGoal(todayDate, goalId, {
          missed: { reason, notes, missedAt: new Date() }
        });
      }
    } catch (err) {
      setError('Er ging iets mis bij het markeren van het doel');
      console.error('Error marking goal as missed:', err);
      // Revert optimistic update on error
      await loadTodaysPlan();
    }
  }, [goals, todayDate, deleteGoal, loadTodaysPlan]);

  const refreshGoals = useCallback(async () => {
    await loadTodaysPlan();
  }, [loadTodaysPlan]);

  return {
    goals,
    dayPlan,
    loading,
    error,
    todayDate,
    toggleGoal,
    addGoal,
    editGoal,
    deleteGoal,
    markGoalAsMissed,
    refreshGoals,
  };
}
