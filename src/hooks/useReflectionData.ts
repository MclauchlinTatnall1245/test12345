import { useState, useEffect } from 'react';
import { DataService } from '../lib/data-service';
import { Goal, Reflection, GoalReflection } from '../types';
import TimeService from '../lib/time-service';

export function useReflectionData() {
  const [todayGoals, setTodayGoals] = useState<Goal[]>([]);
  const [goalReflections, setGoalReflections] = useState<Record<string, GoalReflection>>({});
  const [currentGoalIndex, setCurrentGoalIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [savedReflection, setSavedReflection] = useState<Reflection | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [allReflections, setAllReflections] = useState<Reflection[]>([]);
  const [selectedHistoryReflection, setSelectedHistoryReflection] = useState<Reflection | null>(null);
  const [overallFeeling, setOverallFeeling] = useState<1 | 2 | 3 | 4 | 5 | undefined>(undefined);
  const [generalNotes, setGeneralNotes] = useState<string>('');
  
  const today = TimeService.getCurrentDate();
  
  useEffect(() => {
    loadTodayGoals();
    loadAllReflections();
    checkExistingReflection();
  }, []);

  const loadAllReflections = async () => {
    try {
      const reflections = await DataService.getReflections();
      setAllReflections(reflections);
    } catch (error) {
      console.error('Error loading reflections:', error);
      setAllReflections([]);
    }
  };

  const checkExistingReflection = async () => {
    try {
      const existingReflection = await DataService.getReflection(today);
      if (existingReflection) {
        setSavedReflection(existingReflection);
        setIsCompleted(true);
        setIsEditing(false);
        
        // Load existing overall feeling and notes
        setOverallFeeling(existingReflection.overallFeeling);
        setGeneralNotes(existingReflection.notes || '');
        
        // Load feedback into goal reflections if available
        const reflectionsWithFeedback: Record<string, GoalReflection> = {};
        Object.entries(existingReflection.goalFeedback || {}).forEach(([goalId, feedback]) => {
          reflectionsWithFeedback[goalId] = {
            goalId,
            completed: !existingReflection.missedGoals[goalId],
            feedback,
            reason: existingReflection.missedGoals[goalId]
          };
        });
        setGoalReflections(prev => ({ ...prev, ...reflectionsWithFeedback }));
      }
    } catch (error) {
      console.error('Error checking existing reflection:', error);
    }
  };

  const loadTodayGoals = async () => {
    try {
      const dayPlan = await DataService.getDayPlan(today);
      if (dayPlan) {
        setTodayGoals(dayPlan.goals);
        const initialReflections: Record<string, GoalReflection> = {};
        dayPlan.goals.forEach(goal => {
          initialReflections[goal.id] = {
            goalId: goal.id,
            completed: goal.completed,
            feedback: '',
            reason: goal.completed ? undefined : ''
          };
        });
        setGoalReflections(initialReflections);
      }
    } catch (error) {
      console.error('Error loading today goals:', error);
      setTodayGoals([]);
    }
  };

  const updateGoalReflection = (goalId: string, updates: Partial<GoalReflection>) => {
    setGoalReflections(prev => ({
      ...prev,
      [goalId]: { ...prev[goalId], ...updates }
    }));
  };

  const handleSaveReflection = async () => {
    try {
      const reflection: Reflection = {
        id: savedReflection?.id || DataService.generateId(),
        date: today,
        totalGoals: todayGoals.length,
        completedGoals: Object.values(goalReflections).filter(r => r.completed).length,
        completionPercentage: Math.round((Object.values(goalReflections).filter(r => r.completed).length / todayGoals.length) * 100),
        missedGoals: Object.values(goalReflections)
          .filter(r => !r.completed)
          .reduce((acc, r) => ({ ...acc, [r.goalId]: r.reason || 'no_reason' }), {}),
        goalFeedback: Object.values(goalReflections)
          .reduce((acc, r) => ({ ...acc, [r.goalId]: r.feedback || '' }), {}),
        overallFeeling,
        notes: generalNotes,
        createdAt: savedReflection?.createdAt || new Date(),
        lastModified: new Date()
      };

      await DataService.saveReflection(reflection);
      setSavedReflection(reflection);
      
      // Update goals with completion status
      for (const goal of todayGoals) {
        const goalReflection = goalReflections[goal.id];
        if (goalReflection) {
          await DataService.updateGoal(today, goal.id, { 
            ...goal, 
            completed: goalReflection.completed,
            completedAt: goalReflection.completed ? new Date() : undefined
          });
        }
      }

      setIsCompleted(true);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving reflection:', error);
      throw error;
    }
  };

  return {
    // State
    todayGoals,
    goalReflections,
    currentGoalIndex,
    isCompleted,
    savedReflection,
    isEditing,
    showHistory,
    allReflections,
    selectedHistoryReflection,
    today,
    overallFeeling,
    generalNotes,
    
    // Actions
    setCurrentGoalIndex,
    setIsEditing,
    setShowHistory,
    setSelectedHistoryReflection,
    updateGoalReflection,
    handleSaveReflection,
    loadAllReflections,
    setOverallFeeling,
    setGeneralNotes,
  };
}
