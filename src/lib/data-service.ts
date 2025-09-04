import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  DayPlan, 
  Goal, 
  LongTermGoal, 
  Achievement, 
  UserStats, 
  GoalCategory,
  Suggestion,
  MissedReason,
  Reflection
} from '../types';
import { CategorySystemHelper } from './category-system';
import TimeService from './time-service';

// Storage Keys
const STORAGE_KEYS = {
  dayPlans: 'discipline_day_plans',
  longTermGoals: 'discipline_long_term_goals',
  achievements: 'discipline_achievements',
  userStats: 'discipline_user_stats',
  reflections: 'discipline_reflections',
} as const;

// Utility functions voor AsyncStorage
class Storage {
  static async get<T>(key: string): Promise<T | null> {
    try {
      const item = await AsyncStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from AsyncStorage:', error);
      return null;
    }
  }

  static async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to AsyncStorage:', error);
    }
  }

  static async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from AsyncStorage:', error);
    }
  }
}

// Data Access Layer
export class DataService {
  // Day Plans
  static async getDayPlan(date: string): Promise<DayPlan | null> {
    const dayPlans = await Storage.get<DayPlan[]>(STORAGE_KEYS.dayPlans) || [];
    return dayPlans.find(plan => plan.date === date) || null;
  }

  static async saveDayPlan(dayPlan: DayPlan): Promise<void> {
    const dayPlans = await Storage.get<DayPlan[]>(STORAGE_KEYS.dayPlans) || [];
    const existingIndex = dayPlans.findIndex(plan => plan.date === dayPlan.date);
    
    if (existingIndex >= 0) {
      dayPlans[existingIndex] = dayPlan;
    } else {
      dayPlans.push(dayPlan);
    }
    
    await Storage.set(STORAGE_KEYS.dayPlans, dayPlans);
  }

  static async getAllDayPlans(): Promise<DayPlan[]> {
    return await Storage.get<DayPlan[]>(STORAGE_KEYS.dayPlans) || [];
  }

  // Goals
  static async addGoalToDayPlan(date: string, goal: Goal): Promise<void> {
    let dayPlan = await this.getDayPlan(date);
    
    if (!dayPlan) {
      dayPlan = {
        id: this.generateId(),
        date,
        goals: [],
        suggestions: [],
        createdAt: new Date()
      };
    }
    
    dayPlan.goals.push(goal);
    await this.saveDayPlan(dayPlan);
  }

  static async updateGoal(date: string, goalId: string, updates: Partial<Goal>): Promise<void> {
    const dayPlan = await this.getDayPlan(date);
    if (!dayPlan) return;

    const goalIndex = dayPlan.goals.findIndex(goal => goal.id === goalId);
    if (goalIndex >= 0) {
      dayPlan.goals[goalIndex] = { ...dayPlan.goals[goalIndex], ...updates };
      await this.saveDayPlan(dayPlan);
    }
  }

  static async deleteGoal(date: string, goalId: string): Promise<void> {
    const dayPlan = await this.getDayPlan(date);
    if (!dayPlan) return;

    dayPlan.goals = dayPlan.goals.filter(goal => goal.id !== goalId);
    await this.saveDayPlan(dayPlan);
  }

  static async toggleGoalCompletion(date: string, goalId: string): Promise<void> {
    const dayPlan = await this.getDayPlan(date);
    if (!dayPlan) return;

    const goal = dayPlan.goals.find(g => g.id === goalId);
    if (!goal) return;

    if (goal.completed) {
      // Mark as incomplete
      goal.completed = false;
      goal.completedAt = undefined;
    } else {
      // Mark as completed
      goal.completed = true;
      goal.completedAt = new Date();
    }

    await this.saveDayPlan(dayPlan);
  }

  // Long Term Goals
  static async getLongTermGoals(): Promise<LongTermGoal[]> {
    return await Storage.get<LongTermGoal[]>(STORAGE_KEYS.longTermGoals) || [];
  }

  static async saveLongTermGoal(goal: LongTermGoal): Promise<void> {
    const goals = await this.getLongTermGoals();
    const existingIndex = goals.findIndex(g => g.id === goal.id);
    
    if (existingIndex >= 0) {
      goals[existingIndex] = goal;
    } else {
      goals.push(goal);
    }
    
    await Storage.set(STORAGE_KEYS.longTermGoals, goals);
  }

  static async deleteLongTermGoal(goalId: string): Promise<void> {
    const goals = await this.getLongTermGoals();
    const filteredGoals = goals.filter(g => g.id !== goalId);
    await Storage.set(STORAGE_KEYS.longTermGoals, filteredGoals);
  }

  // Reflections
  static async getReflections(): Promise<Reflection[]> {
    return await Storage.get<Reflection[]>(STORAGE_KEYS.reflections) || [];
  }

  static async saveReflection(reflection: Reflection): Promise<void> {
    const reflections = await this.getReflections();
    const existingIndex = reflections.findIndex(r => r.date === reflection.date);
    
    if (existingIndex >= 0) {
      reflections[existingIndex] = reflection;
    } else {
      reflections.push(reflection);
    }
    
    await Storage.set(STORAGE_KEYS.reflections, reflections);
  }

  static async getReflection(date: string): Promise<Reflection | null> {
    const reflections = await this.getReflections();
    return reflections.find(r => r.date === date) || null;
  }

  // Helper methods
  static generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  static async getGoalsForDate(date: string): Promise<Goal[]> {
    const dayPlan = await this.getDayPlan(date);
    return dayPlan?.goals || [];
  }

  static async getTodaysGoals(): Promise<Goal[]> {
    const today = TimeService.getCurrentDate();
    return await this.getGoalsForDate(today);
  }

  static async getCompletedGoalsCount(date: string): Promise<number> {
    const goals = await this.getGoalsForDate(date);
    return goals.filter(goal => goal.completed).length;
  }

  static async getTotalGoalsCount(date: string): Promise<number> {
    const goals = await this.getGoalsForDate(date);
    return goals.length;
  }

  // Statistics
  static async getUserStats(): Promise<UserStats> {
    const storedStats = await Storage.get<UserStats>(STORAGE_KEYS.userStats);
    if (storedStats) return storedStats;

    // Calculate fresh stats if none stored
    const dayPlans = await this.getAllDayPlans();
    const allGoals = dayPlans.flatMap(plan => plan.goals);
    const completedGoals = allGoals.filter(goal => goal.completed);

    return {
      totalGoalsCompleted: completedGoals.length,
      currentStreak: 0, // Would need to calculate based on consecutive days
      longestStreak: 0,
      weeklyCompletionRate: 0,
      commonFailureReasons: [],
      achievements: []
    };
  }

  static async saveUserStats(stats: UserStats): Promise<void> {
    await Storage.set(STORAGE_KEYS.userStats, stats);
  }

  // Suggestions
  static async getSuggestionsForDate(date: string): Promise<Suggestion[]> {
    const dayPlan = await this.getDayPlan(date);
    return dayPlan?.suggestions || [];
  }

  static async addSuggestionToDayPlan(date: string, suggestion: Suggestion): Promise<void> {
    let dayPlan = await this.getDayPlan(date);
    
    if (!dayPlan) {
      dayPlan = {
        id: this.generateId(),
        date,
        goals: [],
        suggestions: [],
        createdAt: new Date()
      };
    }
    
    dayPlan.suggestions.push(suggestion);
    await this.saveDayPlan(dayPlan);
  }

  // Clear all data (for testing/reset)
  static async clearAllData(): Promise<void> {
    await Promise.all([
      Storage.remove(STORAGE_KEYS.dayPlans),
      Storage.remove(STORAGE_KEYS.longTermGoals),
      Storage.remove(STORAGE_KEYS.achievements),
      Storage.remove(STORAGE_KEYS.userStats),
      Storage.remove(STORAGE_KEYS.reflections),
    ]);
  }

  // === PLANNING METHODS ===
  static getActualTodayDate(): string {
    return TimeService.getCurrentDate();
  }

  static getSmartPlanningDate(): string {
    const currentHour = TimeService.getCurrentHour();
    const config = TimeService.getConfig();
    
    // Get the smart "today" date (sync fallback)
    const smartToday = this.getSmartTodayDate();
    
    // Tussen nightModeStartHour en nightModeEndHour: plan voor "vandaag" (huidige kalenderdag)
    // Anders: plan voor "morgen" (volgende kalenderdag)
    if (currentHour >= config.nightModeStartHour && currentHour < config.nightModeEndHour) {
      // Night mode: check of smart today afwijkt van echte dag
      const actualToday = this.getActualTodayDate();
      if (smartToday !== actualToday) {
        return actualToday; // Plan voor de echte kalenderdag
      }
      return smartToday; // Plan voor dezelfde dag als smart today
    } else {
      // Normale planning: morgen na de smart today datum
      const tomorrow = new Date(smartToday);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Gebruik lokale datum, niet UTC
      const year = tomorrow.getFullYear();
      const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const day = String(tomorrow.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }

  // Async versie die accurater is
  static async getSmartPlanningDateAsync(): Promise<string> {
    const currentHour = TimeService.getCurrentHour();
    const config = TimeService.getConfig();
    
    // Get the smart "today" date
    const smartToday = await this.getSmartTodayDateAsync();
    
    // Tussen nightModeStartHour en nightModeEndHour: plan voor "vandaag" (huidige kalenderdag)
    // Anders: plan voor "morgen" (volgende kalenderdag)
    if (currentHour >= config.nightModeStartHour && currentHour < config.nightModeEndHour) {
      // Als smart today gisteren is (omdat we nog doelen hebben van gisteren),
      // dan plannen we voor vandaag (kalenderdag)
      const actualToday = this.getActualTodayDate();
      if (smartToday !== actualToday) {
        return actualToday; // Plan voor de echte kalenderdag
      }
      return smartToday; // Plan voor dezelfde dag als smart today
    } else {
      // Normale planning: morgen na de smart today datum
      const tomorrow = new Date(smartToday);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Gebruik lokale datum, niet UTC
      const year = tomorrow.getFullYear();
      const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const day = String(tomorrow.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }

  // Slimme "vandaag" datum die rekening houdt met slaap-cycli
  // Als het tussen 00:00-06:00 is EN er zijn onafgemaakte doelen van gisteren,
  // wordt de vorige dag als "vandaag" beschouwd
  static getSmartTodayDate(): string {
    return TimeService.getSmartTodayDate(this);
  }

  // Async versie die de volledige smart date logica implementeert
  static async getSmartTodayDateAsync(): Promise<string> {
    return await TimeService.getSmartTodayDateAsync(this);
  }

  static formatDate(date: string): string {
    return new Date(date).toLocaleDateString('nl-NL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Legacy support voor getDateLogicInfo - gebruik nu TimeService
  static getDateLogicInfo(): {
    actualToday: string;
    smartToday: string;
    planningDate: string;
    currentHour: number;
    explanation: string;
  } {
    const currentHour = TimeService.getCurrentHour();
    const config = TimeService.getConfig();
    const actualToday = this.getActualTodayDate();
    const smartToday = this.getSmartTodayDate();
    const planningDate = this.getSmartPlanningDate();
    
    let explanation = '';
    if (currentHour >= config.nightModeStartHour && currentHour < config.nightModeEndHour) {
      if (smartToday !== actualToday) {
        explanation = `Het is ${currentHour}:xx 's nachts. Planning voor de echte kalenderdag (${actualToday}).`;
      } else {
        explanation = `Het is ${currentHour}:xx 's nachts. Planning voor vandaag (${smartToday}).`;
      }
    } else {
      explanation = `Het is ${currentHour}:xx. Planning voor morgen (${planningDate}).`;
    }
    
    return {
      actualToday,
      smartToday,
      planningDate,
      currentHour,
      explanation
    };
  }
}

// Smart Suggestions Engine
export class SuggestionEngine {
  static getSmartSuggestions(goals: Goal[]): Suggestion[] {
    const suggestions: Suggestion[] = [];
    const categories = goals.map(goal => goal.category);

    // Check voor ontbrekende beweging
    if (!categories.includes('health')) {
      suggestions.push({
        id: DataService.generateId(),
        title: '30 minuten wandelen',
        description: 'Een wandeling is goed voor lichaam en geest',
        category: 'health',
        condition: 'no_exercise'
      });
    }

    // Check voor ontbrekend huishouden
    if (!categories.includes('household')) {
      suggestions.push({
        id: DataService.generateId(),
        title: 'Kamer/huis opruimen',
        description: 'Een opgeruimde ruimte geeft rust en focus',
        category: 'household',
        condition: 'no_cleaning'
      });
    }

    // Check voor ontbrekende ontspanning
    if (!categories.includes('personal_development')) {
      suggestions.push({
        id: DataService.generateId(),
        title: '10 minuten ademhalingsoefening',
        description: 'Ontspanning helpt bij stress en focus',
        category: 'personal_development',
        condition: 'no_relaxation'
      });
    }

    // Check voor ontbrekende praktische zaken
    if (!categories.includes('practical')) {
      suggestions.push({
        id: DataService.generateId(),
        title: 'Auto onderhoud checken',
        description: 'Praktische zaken regelen voorkomt stress later',
        category: 'practical',
        condition: 'no_practical'
      });
    }

    return suggestions;
  }

  // TimeService integration helpers
  static getUnreflectedDays(): string[] {
    return TimeService.getUnreflectedDays(this);
  }

  static hasUnreflectedDays(): boolean {
    return TimeService.hasUnreflectedDays(this);
  }

  static getTimeDebugInfo(): object {
    return TimeService.getDebugInfo(this);
  }

  // ==========================================
  // REFLECTION METHODS
  // ==========================================

  static getTodayDate(): string {
    return TimeService.getCurrentDate();
  }

  static async saveReflection(reflection: Reflection): Promise<void> {
    try {
      const reflections = await this.getReflections();
      const reflectionIndex = reflections.findIndex(r => r.date === reflection.date);
      
      if (reflectionIndex >= 0) {
        reflections[reflectionIndex] = reflection;
      } else {
        reflections.push(reflection);
      }
      
      // Sort by date (newest first)
      reflections.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      await Storage.set(STORAGE_KEYS.reflections, reflections);
    } catch (error) {
      console.error('Error saving reflection:', error);
      throw error;
    }
  }

  static async getReflection(date: string): Promise<Reflection | null> {
    try {
      const reflections = await this.getReflections();
      return reflections.find(r => r.date === date) || null;
    } catch (error) {
      console.error('Error getting reflection:', error);
      return null;
    }
  }

  static async getAllReflections(): Promise<Reflection[]> {
    return this.getReflections();
  }

  static async getReflections(): Promise<Reflection[]> {
    try {
      const reflections = await Storage.get<Reflection[]>(STORAGE_KEYS.reflections);
      if (!reflections) return [];
      
      // Parse dates back to Date objects
      return reflections.map(reflection => ({
        ...reflection,
        createdAt: new Date(reflection.createdAt),
        lastModified: new Date(reflection.lastModified)
      }));
    } catch (error) {
      console.error('Error loading reflections:', error);
      return [];
    }
  }

  static async deleteReflection(date: string): Promise<void> {
    try {
      const reflections = await this.getReflections();
      const filteredReflections = reflections.filter(r => r.date !== date);
      await Storage.set(STORAGE_KEYS.reflections, filteredReflections);
    } catch (error) {
      console.error('Error deleting reflection:', error);
      throw error;
    }
  }
}

// Automatic Category Detection Engine - now uses central system
export class CategoryDetectionEngine {
  static detectCategoryAndSubcategory(title: string, description?: string, timeSlot?: string): { category: GoalCategory; subcategory?: string } | null {
    return CategorySystemHelper.detectCategoryAndSubcategory(title, description, timeSlot);
  }

  // Get available subcategories for a given main category
  static getSubcategoriesForCategory(category: GoalCategory): string[] {
    return CategorySystemHelper.getSubcategoriesForCategory(category);
  }
}
