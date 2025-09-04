// Database Types voor Discipline App - React Native Version
// Import and re-export from central category system
import type { 
  GoalCategory, 
  MissedReason 
} from '../lib/category-system';

export type { 
  GoalCategory, 
  MissedReason 
} from '../lib/category-system';

// Long Term Goals Types
export interface LongTermGoal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  category: string;
  progress: number; // 0-100
  relatedDailyActions: string[];
  createdAt: Date;
  lastCheckIn?: Date;
  completed?: boolean;
}

export interface GoalCategoryInfo {
  value: string;
  label: string;
  color: string;
  icon: string;
}

export const GOAL_CATEGORIES: GoalCategoryInfo[] = [
  { value: 'health', label: 'Gezondheid & Fitness', color: '#10B981', icon: '💪' },
  { value: 'productivity', label: 'Werk & Productiviteit', color: '#3B82F6', icon: '💼' },
  { value: 'household', label: 'Huishouden & Wonen', color: '#F59E0B', icon: '🏠' },
  { value: 'practical', label: 'Praktisch & Regelen', color: '#F97316', icon: '📋' },
  { value: 'personal_development', label: 'Persoonlijke Ontwikkeling', color: '#8B5CF6', icon: '🧠' },
  { value: 'entertainment', label: 'Ontspanning & Hobby\'s', color: '#EC4899', icon: '🎮' },
  { value: 'social', label: 'Sociaal & Relaties', color: '#06B6D4', icon: '👥' },
  { value: 'finance', label: 'Financieel', color: '#6366F1', icon: '💰' },
  { value: 'shopping', label: 'Shopping & Aankopen', color: '#059669', icon: '🛍️' },
];

export interface Goal {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  timeSlot?: string; // bijv. "voor 09:00", "11:00-12:00"
  category: GoalCategory;
  subcategory?: string; // automatisch gedetecteerd
  createdAt: Date;
  completedAt?: Date;
  planDate: string; // YYYY-MM-DD format
  missed?: {
    reason: MissedReason;
    notes?: string;
    missedAt: Date;
  };
}

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  condition: 'no_exercise' | 'no_cleaning' | 'no_relaxation' | 'no_learning' | 'no_practical';
}

export interface DayPlan {
  id: string;
  date: string; // YYYY-MM-DD
  goals: Goal[];
  suggestions: Suggestion[];
  createdAt: Date;
  reflection?: DayReflection;
}

export interface DayReflection {
  completedGoals: string[]; // Goal IDs
  missedGoals: MissedGoal[];
  overallFeeling: 1 | 2 | 3 | 4 | 5; // 1=slecht, 5=geweldig
  notes?: string;
  createdAt: Date;
}

export interface Reflection {
  id: string;
  date: string; // YYYY-MM-DD
  totalGoals: number;
  completedGoals: number;
  completionPercentage: number;
  missedGoals: Record<string, string>; // goalId -> reason
  goalFeedback: Record<string, string>; // goalId -> feedback
  overallFeeling?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  createdAt: Date;
  lastModified: Date;
  aiSuggestions?: AISuggestion[];
}

export interface AISuggestion {
  id: string;
  type: 'tip' | 'improvement' | 'encouragement' | 'pattern';
  title: string;
  content: string;
  category?: GoalCategory;
  priority: 'low' | 'medium' | 'high';
}

export interface MissedGoal {
  goalId: string;
  reason: MissedReason;
  notes?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  condition: {
    type: 'streak' | 'total' | 'percentage';
    target: number;
    timeframe?: 'week' | 'month' | 'all';
  };
}

export interface UserStats {
  totalGoalsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  weeklyCompletionRate: number;
  commonFailureReasons: { reason: MissedReason; count: number }[];
  achievements: Achievement[];
}

// Reflection System Types
export interface GoalReflection {
  goalId: string;
  completed: boolean;
  feedback: string;
  reason?: string;
}

export interface ReflectionState {
  todayGoals: Goal[];
  goalReflections: Record<string, GoalReflection>;
  currentGoalIndex: number;
  isCompleted: boolean;
  savedReflection: Reflection | null;
  isEditing: boolean;
  showHistory: boolean;
  allReflections: Reflection[];
  selectedHistoryReflection: Reflection | null;
}

export type ReflectionScreen = 'workflow' | 'completed' | 'noGoals';
