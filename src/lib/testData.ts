import { Goal, GoalCategory } from '../types';
import { DataService } from '../lib/data-service';
import TimeService from '../lib/time-service';

export async function addTestGoals(): Promise<void> {
  const todayDate = TimeService.getCurrentDate();
  
  const testGoals: Omit<Goal, 'id' | 'createdAt' | 'planDate'>[] = [
    {
      title: '30 minuten naar de gym',
      description: 'Krachttraining: benen en billen',
      completed: false,
      timeSlot: '11:00-12:00',
      category: 'health' as GoalCategory,
      subcategory: 'sport',
    },
    {
      title: '20 minuten lezen',
      description: 'Verder lezen in "Atomic Habits"',
      completed: true,
      timeSlot: 'voor 22:00',
      category: 'personal_development' as GoalCategory,
      subcategory: 'learning',
      completedAt: new Date(),
    },
    {
      title: 'Boodschappen doen',
      description: 'Groenten, fruit en vlees halen',
      completed: false,
      category: 'practical' as GoalCategory,
      subcategory: 'transportation',
    },
    {
      title: 'Kamer opruimen',
      description: 'Bed opmaken en kleding wegleggen',
      completed: false,
      category: 'household' as GoalCategory,
      subcategory: 'cleaning',
    },
    {
      title: 'Work project review',
      description: 'Code review voor het nieuwe feature',
      completed: false,
      timeSlot: '14:00-15:00',
      category: 'productivity' as GoalCategory,
      subcategory: 'daily_work',
    },
  ];

  for (const goalData of testGoals) {
    const goal: Goal = {
      ...goalData,
      id: DataService.generateId(),
      createdAt: new Date(),
      planDate: todayDate,
    };

    await DataService.addGoalToDayPlan(todayDate, goal);
  }
}

export async function clearAllTestData(): Promise<void> {
  await DataService.clearAllData();
}
