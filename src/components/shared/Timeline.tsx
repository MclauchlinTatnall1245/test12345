import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Goal, MissedReason, GoalCategory } from '../../types';
import { CategorySystemHelper } from '../../lib/category-system';
import { EditGoalForm } from './EditGoalForm';
import { MissGoalModal } from './MissGoalModal';
import { Card } from '../ui/Card';

interface TimelineProps {
  goals: Goal[];
  onToggleGoal?: (goalId: string) => void;
  onEditGoal?: (goal: Goal) => void;
  onMissGoal?: (goalId: string, reason: MissedReason, notes?: string) => void;
  onDeleteGoal?: (goalId: string) => void;
  targetDate: string; // YYYY-MM-DD format
  showEmptySlots?: boolean;
}

interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
  goals: Goal[];
  status: 'upcoming' | 'current' | 'passed' | 'completed' | 'missed';
}

export function Timeline({ 
  goals, 
  onToggleGoal, 
  onEditGoal, 
  onMissGoal, 
  onDeleteGoal, 
  targetDate, 
  showEmptySlots = true 
}: TimelineProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [missGoalId, setMissGoalId] = useState<string | null>(null);

  const getCategoryLabel = (category: string) => {
    return CategorySystemHelper.getCategoryLabel(category as GoalCategory) || 'Anders';
  };

  const getCategoryColor = (category: GoalCategory) => {
    const colorMap: { [key in GoalCategory]: string } = {
      health: '#10B981',
      productivity: '#3B82F6',
      household: '#F59E0B',
      practical: '#F97316',
      personal_development: '#8B5CF6',
      entertainment: '#EC4899',
      social: '#EF4444',
      finance: '#6366F1',
      shopping: '#06B6D4',
      other: '#6B7280'
    };
    return colorMap[category] || '#6B7280';
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update elke minuut

    return () => clearInterval(timer);
  }, []);

  // Check of target date vandaag is
  const today = new Date().toISOString().split('T')[0];
  const isToday = targetDate === today;
  const isFuture = targetDate > today;
  const isPast = targetDate < today;

  // Parse tijd string naar uren en minuten (zoals origineel)
  const parseTime = (timeStr: string): { hour: number; minute: number; originalTime: string } | null => {
    // "Voor 09:00" -> 09:00
    if (timeStr.toLowerCase().includes('voor')) {
      const match = timeStr.match(/(\d{1,2}):?(\d{2})?/);
      if (match) {
        return {
          hour: parseInt(match[1]),
          minute: parseInt(match[2] || '0'),
          originalTime: `${match[1].padStart(2, '0')}:${(match[2] || '00').padStart(2, '0')}`
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
          minute: parseInt(match[2]),
          originalTime: timeStr
        };
      }
    }
    
    // "14:30" -> normaal tijdformaat
    const match = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (match) {
      return {
        hour: parseInt(match[1]),
        minute: parseInt(match[2]),
        originalTime: timeStr
      };
    }
    
    return null;
  };

  // Maak tijdslots - ALLEEN voor tijden met goals (zoals origineel)
  const createTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const timedGoals = goals.filter(goal => goal.timeSlot);
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();

    // Groepeer doelen per tijdslot
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

    // Voeg context slots toe (zoals origineel)
    const timePoints = new Set<string>();
    goalsByTime.forEach((_, timeKey) => {
      timePoints.add(timeKey);
    });

    if (showEmptySlots && goalsByTime.size > 0) {
      const existingTimes = Array.from(goalsByTime.keys()).sort();
      const firstTime = existingTimes[0];
      const lastTime = existingTimes[existingTimes.length - 1];
      
      // Voeg een tijdslot toe voor en na de eerste/laatste geplande tijd
      const [firstHour, firstMin] = firstTime.split(':').map(Number);
      const [lastHour, lastMin] = lastTime.split(':').map(Number);
      
      if (firstHour > 6) {
        timePoints.add(`${(firstHour - 1).toString().padStart(2, '0')}:${firstMin.toString().padStart(2, '0')}`);
      }
      
      if (lastHour < 23) {
        timePoints.add(`${(lastHour + 1).toString().padStart(2, '0')}:${lastMin.toString().padStart(2, '0')}`);
      }
    }

    // Converteer naar slots en sorteer
    Array.from(timePoints).sort().forEach(timeKey => {
      const [hourStr, minuteStr] = timeKey.split(':');
      const hour = parseInt(hourStr);
      const minute = parseInt(minuteStr);
      const slotGoals = goalsByTime.get(timeKey) || [];
      
      // Bepaal status (zoals origineel)
      let status: TimeSlot['status'] = 'upcoming';
      
      if (!isToday) {
        // Voor toekomstige/verleden dagen: kijk alleen naar completed status
        if (slotGoals.length === 0) {
          status = 'upcoming';
        } else {
          status = slotGoals.every(g => g.completed) ? 'completed' : 'upcoming';
        }
      } else {
        // Voor vandaag: gebruik tijd logica
        const slotTotalMinutes = hour * 60 + minute;
        const currentTotalMinutes = currentHour * 60 + currentMinute;
        
        if (slotTotalMinutes > currentTotalMinutes + 15) {
          status = 'upcoming';
        } else if (slotTotalMinutes >= currentTotalMinutes - 15 && slotTotalMinutes <= currentTotalMinutes + 15) {
          status = 'current';
        } else {
          // In het verleden
          if (slotGoals.length === 0) {
            status = 'passed';
          } else {
            status = slotGoals.every(g => g.completed) ? 'completed' : 'missed';
          }
        }
      }
      
      slots.push({
        time: timeKey,
        hour,
        minute,
        goals: slotGoals,
        status
      });
    });
    
    return slots;
  };

  // Goals zonder specifiek tijdslot
  const unscheduledGoals = goals.filter(goal => !goal.timeSlot);
  const timeSlots = createTimeSlots();

  const handleMissGoal = (reason: MissedReason, notes?: string) => {
    if (!missGoalId || !onMissGoal) return;
    
    if (reason === 'wrong_goal') {
      // Verwijder het doel volledig
      onDeleteGoal?.(missGoalId);
    } else {
      // Markeer als gemist
      onMissGoal(missGoalId, reason, notes);
    }
    
    setMissGoalId(null);
  };

  const getStatusIcon = (status: TimeSlot['status']) => {
    switch (status) {
      case 'completed':
        return <Ionicons name="checkmark-circle" size={20} color="#10B981" />;
      case 'current':
        return <Ionicons name="time" size={20} color="#F59E0B" />;
      case 'missed':
        return <Ionicons name="close-circle" size={20} color="#EF4444" />;
      case 'passed':
        return <Ionicons name="remove-circle" size={20} color="#9CA3AF" />;
      default:
        return <Ionicons name="ellipse-outline" size={20} color="#D1D5DB" />;
    }
  };

  const getStatusColor = (status: TimeSlot['status']) => {
    switch (status) {
      case 'completed':
        return '#F0FDF4';
      case 'current':
        return '#FFFBEB';
      case 'missed':
        return '#FEF2F2';
      case 'passed':
        return '#F9FAFB';
      default:
        return '#FFFFFF';
    }
  };

  const getDateLabel = () => {
    if (isToday) return 'Vandaag';
    if (isFuture) return 'Toekomst';
    if (isPast) return 'Verleden';
    return '';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header met datum info (zoals origineel) */}
      <Card style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>
              📅 Dagplanning - {getDateLabel()}
            </Text>
            <Text style={styles.headerDate}>
              {new Date(targetDate).toLocaleDateString('nl-NL', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
          
          {isToday && (
            <View style={styles.currentTimeContainer}>
              <Text style={styles.currentTimeLabel}>Huidige tijd</Text>
              <Text style={styles.currentTimeValue}>
                {currentTime.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          )}
        </View>
      </Card>

      {/* Timeline - Alleen tijden met doelen */}
      <View style={styles.timeline}>
        {timeSlots.length === 0 ? (
          <Card style={styles.emptyTimelineCard}>
            <View style={styles.emptyTimelineContent}>
              <Ionicons name="time-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyTimelineTitle}>Geen tijdslots met doelen</Text>
              <Text style={styles.emptyTimelineMessage}>Doelen zonder tijdslot staan hieronder</Text>
            </View>
          </Card>
        ) : (
          timeSlots.map((slot) => {
            const hasGoals = slot.goals.length > 0;
            
            // Alleen slots met doelen tonen, tenzij het een context slot is
            if (!hasGoals && slot.status === 'passed') return null;
            
            return (
              <View key={slot.time} style={styles.timeSlot}>
                <View style={styles.timeColumn}>
                  <Text style={styles.timeText}>{slot.time}</Text>
                  {getStatusIcon(slot.status)}
                </View>
                
                <View style={styles.contentColumn}>
                  <View style={[styles.slotContent, { backgroundColor: getStatusColor(slot.status) }]}>
                    {slot.goals.length === 0 ? (
                      showEmptySlots && (
                        <Text style={styles.emptySlotText}>Vrije tijd</Text>
                      )
                    ) : (
                      <View style={styles.goalsContainer}>
                        {slot.goals.map((goal) => (
                          <View key={goal.id}>
                            {missGoalId === goal.id ? (
                              <MissGoalModal
                                visible={true}
                                goalTitle={goal.title}
                                onConfirm={handleMissGoal}
                                onCancel={() => setMissGoalId(null)}
                              />
                            ) : (
                              <View style={styles.goalItem}>
                                <TouchableOpacity
                                  style={styles.goalHeader}
                                  onPress={() => onToggleGoal?.(goal.id)}
                                >
                                  <View style={[
                                    styles.checkbox,
                                    goal.completed && styles.checkboxCompleted,
                                    goal.missed && styles.checkboxMissed
                                  ]}>
                                    {goal.completed && (
                                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                                    )}
                                    {goal.missed && (
                                      <Ionicons name="close" size={12} color="#FFFFFF" />
                                    )}
                                  </View>
                                  
                                  <View style={styles.goalContent}>
                                    <Text style={[
                                      styles.goalTitle,
                                      goal.completed && styles.goalTitleCompleted,
                                      goal.missed && styles.goalTitleMissed
                                    ]}>
                                      {goal.title}
                                    </Text>
                                    
                                    {goal.description && (
                                      <Text style={styles.goalDescription}>
                                        {goal.description}
                                      </Text>
                                    )}
                                    
                                    <View style={styles.goalMeta}>
                                      <View style={[
                                        styles.categoryBadge,
                                        { backgroundColor: getCategoryColor(goal.category) + '20' }
                                      ]}>
                                        <Text style={[
                                          styles.categoryText,
                                          { color: getCategoryColor(goal.category) }
                                        ]}>
                                          {getCategoryLabel(goal.category)}
                                        </Text>
                                      </View>
                                      <Text style={styles.timeSlotText}>
                                        {goal.timeSlot}
                                      </Text>
                                    </View>
                                  </View>
                                </TouchableOpacity>
                                
                                {!goal.completed && !goal.missed && (
                                  <View style={styles.goalActions}>
                                    <TouchableOpacity
                                      style={styles.actionButton}
                                      onPress={() => onEditGoal?.(goal)}
                                    >
                                      <Ionicons name="pencil" size={16} color="#6B7280" />
                                    </TouchableOpacity>
                                    
                                    {isToday && (
                                      <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => setMissGoalId(goal.id)}
                                      >
                                        <Ionicons name="close" size={16} color="#EF4444" />
                                      </TouchableOpacity>
                                    )}
                                  </View>
                                )}
                              </View>
                            )}
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>
      
      {/* Unscheduled Goals */}
      {unscheduledGoals.length > 0 && (
        <Card style={styles.unscheduledSection}>
          <View style={styles.unscheduledHeader}>
            <Ionicons name="list" size={20} color="#6B7280" />
            <Text style={styles.unscheduledTitle}>Doelen zonder specifieke tijd ({unscheduledGoals.length})</Text>
          </View>
          
          <View style={styles.unscheduledGoals}>
            {unscheduledGoals.map((goal) => (
              <View key={goal.id} style={styles.unscheduledGoal}>
                <TouchableOpacity
                  style={styles.goalHeader}
                  onPress={() => onToggleGoal?.(goal.id)}
                >
                  <View style={[
                    styles.checkbox,
                    goal.completed && styles.checkboxCompleted,
                    goal.missed && styles.checkboxMissed
                  ]}>
                    {goal.completed && (
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    )}
                    {goal.missed && (
                      <Ionicons name="close" size={12} color="#FFFFFF" />
                    )}
                  </View>
                  
                  <View style={styles.goalContent}>
                    <Text style={[
                      styles.goalTitle,
                      goal.completed && styles.goalTitleCompleted,
                      goal.missed && styles.goalTitleMissed
                    ]}>
                      {goal.title}
                    </Text>
                    
                    {goal.description && (
                      <Text style={styles.goalDescription}>
                        {goal.description}
                      </Text>
                    )}
                    
                    <View style={styles.goalMeta}>
                      <View style={[
                        styles.categoryBadge,
                        { backgroundColor: getCategoryColor(goal.category) + '20' }
                      ]}>
                        <Text style={[
                          styles.categoryText,
                          { color: getCategoryColor(goal.category) }
                        ]}>
                          {getCategoryLabel(goal.category)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
                
                {!goal.completed && !goal.missed && (
                  <View style={styles.goalActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => onEditGoal?.(goal)}
                    >
                      <Ionicons name="pencil" size={16} color="#6B7280" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => setMissGoalId(goal.id)}
                    >
                      <Ionicons name="close" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    marginBottom: 16,
    backgroundColor: '#F0F9FF',
    borderColor: '#3B82F6',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  currentTimeContainer: {
    alignItems: 'flex-end',
  },
  currentTimeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  currentTimeValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3B82F6',
  },
  emptyTimelineCard: {
    marginVertical: 32,
  },
  emptyTimelineContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTimelineTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 4,
  },
  emptyTimelineMessage: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  timeline: {
    paddingVertical: 16,
  },
  timeSlot: {
    flexDirection: 'row',
    marginBottom: 12,
    minHeight: 60,
  },
  timeColumn: {
    width: 80,
    alignItems: 'center',
    paddingTop: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  contentColumn: {
    flex: 1,
    marginLeft: 16,
  },
  slotContent: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    minHeight: 50,
    padding: 16,
  },
  emptySlotText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
  goalsContainer: {
    gap: 8,
  },
  goalItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkboxMissed: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  goalTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  goalTitleMissed: {
    color: '#EF4444',
  },
  goalDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  goalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  timeSlotText: {
    fontSize: 12,
    color: '#6B7280',
  },
  goalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    padding: 4,
  },
  unscheduledSection: {
    margin: 16,
    marginTop: 8,
  },
  unscheduledHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  unscheduledTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 8,
  },
  unscheduledGoals: {
    gap: 8,
  },
  unscheduledGoal: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
});
