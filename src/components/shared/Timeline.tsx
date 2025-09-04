import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Goal, MissedReason } from '../../types';
import { GoalItem } from './GoalItem';

interface TimelineProps {
  goals: Goal[];
  onToggleGoal?: (goalId: string) => void;
  onEditGoal?: (goal: Goal) => void;
  onMissGoal?: (goalId: string, reason: MissedReason, notes?: string) => void;
  onDeleteGoal?: (goalId: string) => void;
  targetDate: string; // YYYY-MM-DD format
  showEmptySlots?: boolean;
}

export function Timeline({ 
  goals, 
  onToggleGoal, 
  onEditGoal, 
  onMissGoal, 
  onDeleteGoal
}: TimelineProps) {

  // Parse tijd string naar uren en minuten
  const parseTime = (timeStr: string): { hour: number; minute: number } | null => {
    // "Voor 09:00" -> 09:00
    if (timeStr.toLowerCase().includes('voor')) {
      const match = timeStr.match(/(\d{1,2}):?(\d{2})?/);
      if (match) {
        return {
          hour: parseInt(match[1]),
          minute: parseInt(match[2] || '0')
        };
      }
    }
    
    // "10:00-11:00" -> gebruik starttijd
    if (timeStr.includes('-')) {
      const startTime = timeStr.split('-')[0].trim();
      const match = startTime.match(/(\d{1,2}):(\d{2})/);
      if (match) {
        return {
          hour: parseInt(match[1]),
          minute: parseInt(match[2])
        };
      }
    }
    
    // "14:30" -> normaal tijdformaat
    const match = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (match) {
      return {
        hour: parseInt(match[1]),
        minute: parseInt(match[2])
      };
    }
    
    return null;
  };

  // Groepeer doelen per tijdslot
  const groupGoalsByTime = () => {
    const timedGoals = goals.filter(goal => goal.timeSlot);
    const untimedGoals = goals.filter(goal => !goal.timeSlot);
    
    const goalsByTime = new Map<string, Goal[]>();
    
    timedGoals.forEach(goal => {
      if (goal.timeSlot) {
        const parsed = parseTime(goal.timeSlot);
        if (parsed) {
          const timeKey = `${parsed.hour.toString().padStart(2, '0')}:${parsed.minute.toString().padStart(2, '0')}`;
          if (!goalsByTime.has(timeKey)) {
            goalsByTime.set(timeKey, []);
          }
          goalsByTime.get(timeKey)!.push(goal);
        }
      }
    });

    // Sorteer tijdslots
    const sortedTimes = Array.from(goalsByTime.keys()).sort();
    
    return { sortedTimes, goalsByTime, untimedGoals };
  };

  const { sortedTimes, goalsByTime, untimedGoals } = groupGoalsByTime();

  return (
    <View style={styles.container}>
      {/* Doelen met tijdslots */}
      {sortedTimes.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="time-outline" size={24} color="#1e293b" />
              <Text style={styles.sectionTitle}>
                Geplande doelen
              </Text>
            </View>
          </View>
          
          {sortedTimes.map(timeSlot => {
            const timeGoals = goalsByTime.get(timeSlot) || [];
            return (
              <View key={timeSlot} style={styles.timeSlotSection}>
                <View style={styles.timeHeader}>
                  <Text style={styles.timeLabel}>{timeSlot}</Text>
                </View>
                {timeGoals.map(goal => (
                  <GoalItem
                    key={goal.id}
                    goal={goal}
                    onToggleComplete={onToggleGoal ? (goalId: string) => onToggleGoal(goalId) : undefined}
                    onEdit={onEditGoal ? (goal: Goal) => onEditGoal(goal) : undefined}
                    onDelete={onDeleteGoal ? (goalId: string) => onDeleteGoal(goalId) : undefined}
                    onMarkAsMissed={onMissGoal ? (goalId: string, reason: MissedReason, notes?: string) => onMissGoal(goalId, reason, notes) : undefined}
                  />
                ))}
              </View>
            );
          })}
        </View>
      )}

      {/* Doelen zonder tijdslot */}
      {untimedGoals.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="list-outline" size={24} color="#1e293b" />
              <Text style={styles.sectionTitle}>
                Ongeplande doelen ({untimedGoals.length})
              </Text>
            </View>
          </View>
          
          {untimedGoals.map(goal => (
            <GoalItem
              key={goal.id}
              goal={goal}
              onToggleComplete={onToggleGoal ? (goalId: string) => onToggleGoal(goalId) : undefined}
              onEdit={onEditGoal ? (goal: Goal) => onEditGoal(goal) : undefined}
              onDelete={onDeleteGoal ? (goalId: string) => onDeleteGoal(goalId) : undefined}
              onMarkAsMissed={onMissGoal ? (goalId: string, reason: MissedReason, notes?: string) => onMissGoal(goalId, reason, notes) : undefined}
            />
          ))}
        </View>
      )}

      {/* Empty state */}
      {goals.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>Geen doelen gepland</Text>
          <Text style={styles.emptyMessage}>
            Er zijn geen doelen gepland voor deze dag
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginHorizontal: 24,
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  timeSlotSection: {
    marginBottom: 24,
  },
  timeHeader: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#667eea',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
    marginHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
});
