import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Goal, Suggestion, GoalCategory } from '../types';
import { CategorySystemHelper } from '../lib/category-system';
import TimeService from '../lib/time-service';
import { DataService, SuggestionEngine } from '../lib/data-service';
import { Timeline } from '../components/shared/Timeline';
import { GoalForm } from '../components/shared/GoalForm';

export default function PlanningScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showTimeline, setShowTimeline] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);

  const planningDate = DataService.getSmartPlanningDate();

  useEffect(() => {
    loadPlan();
  }, [planningDate]);

  useEffect(() => {
    // Update suggesties gebaseerd op huidige doelen
    const newSuggestions = SuggestionEngine.getSmartSuggestions(goals);
    setSuggestions(newSuggestions);
  }, [goals]);

  const loadPlan = async () => {
    // Laad bestaande planning voor morgen
    const existingPlan = await DataService.getDayPlan(planningDate);
    if (existingPlan) {
      setGoals(existingPlan.goals || []);
      setSuggestions(existingPlan.suggestions || []);
    }
  };

  const handleGoalAdded = (newGoal: Goal) => {
    // Set the planning date for the goal
    const goalWithPlanDate = { ...newGoal, planDate: planningDate };
    
    // Add to local state
    setGoals(prevGoals => [...prevGoals, goalWithPlanDate]);
    
    // Save to DataService
    DataService.addGoalToDayPlan(planningDate, goalWithPlanDate);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
  };

  const handleCloseModal = () => {
    setShowAddGoal(false);
    setEditingGoal(null);
  };

  const handleSaveGoal = (goal: Goal) => {
    if (editingGoal) {
      // Update existing goal
      const updatedGoals = goals.map(g => 
        g.id === editingGoal.id ? goal : g
      );
      setGoals(updatedGoals);
      DataService.updateGoal(planningDate, editingGoal.id, goal);
    } else {
      // Add new goal
      handleGoalAdded(goal);
    }
  };

  const handleAddSuggestion = (suggestion: Suggestion) => {
    const newGoal: Goal = {
      id: DataService.generateId(),
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.category,
      completed: false,
      createdAt: new Date(),
      planDate: planningDate
    };

    DataService.addGoalToDayPlan(planningDate, newGoal);
    setGoals(prevGoals => [...prevGoals, newGoal]);
  };

  const handleDeleteGoal = (goalId: string) => {
    Alert.alert(
      'Doel verwijderen',
      'Weet je zeker dat je dit doel wilt verwijderen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        { 
          text: 'Verwijderen', 
          style: 'destructive',
          onPress: () => {
            const updatedGoals = goals.filter(goal => goal.id !== goalId);
            setGoals(updatedGoals);
            DataService.deleteGoal(planningDate, goalId);
          }
        }
      ]
    );
  };

  const getCategoryLabel = (category: string) => {
    return CategorySystemHelper.getCategoryLabel(category as GoalCategory) || 'Anders';
  };

  const getPlanningTitle = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const config = TimeService.getConfig();
    
    if (currentHour >= config.nightModeStartHour && currentHour < config.nightModeEndHour) {
      return 'Nachtplanning';
    } else {
      return 'Avondplanning';
    }
  };

  const getPlanningDescription = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const config = TimeService.getConfig();
    
    if (currentHour >= config.nightModeStartHour && currentHour < config.nightModeEndHour) {
      return `Plan je doelen voor vandaag - ${DataService.formatDate(planningDate)}`;
    } else {
      return `Plan je doelen voor morgen - ${DataService.formatDate(planningDate)}`;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Debug Panel */}
        <View style={styles.debugContainer}>
          <TouchableOpacity
            style={styles.debugButton}
            onPress={() => setShowDebug(!showDebug)}
          >
            <Text style={styles.debugButtonText}>🔧 Debug Info</Text>
          </TouchableOpacity>
        </View>

        {showDebug && (
          <Card style={styles.debugCard}>
            <Text style={styles.debugTitle}>🔧 Planning Datum Logica Debug</Text>
            {(() => {
              const info = DataService.getDateLogicInfo();
              return (
                <>
                  <Text style={styles.debugText}>Kalenderdag: {info.actualToday}</Text>
                  <Text style={styles.debugText}>Smart "Vandaag": {info.smartToday}</Text>
                  <Text style={styles.debugText}>Planning datum: {info.planningDate}</Text>
                  <Text style={styles.debugText}>Huidige tijd: {info.currentHour}:xx</Text>
                  <Text style={[styles.debugText, { marginTop: 8, padding: 8, backgroundColor: '#FCD34D', borderRadius: 4 }]}>
                    Uitleg: {info.explanation}
                  </Text>
                </>
              );
            })()}
          </Card>
        )}

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="moon" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>{getPlanningTitle()}</Text>
          <Text style={styles.subtitle}>{getPlanningDescription()}</Text>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <View style={styles.statLeft}>
                <Text style={styles.statLabel}>Doelen gepland</Text>
                <Text style={styles.statValue}>{goals.length}</Text>
              </View>
              <View style={styles.statIcon}>
                <Ionicons name="list" size={24} color="#3B82F6" />
              </View>
            </View>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <View style={styles.statLeft}>
                <Text style={styles.statLabel}>Met tijd</Text>
                <Text style={styles.statValue}>{goals.filter(g => g.timeSlot).length}</Text>
              </View>
              <View style={styles.statIcon}>
                <Ionicons name="time" size={24} color="#10B981" />
              </View>
            </View>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <View style={styles.statLeft}>
                <Text style={styles.statLabel}>Suggesties</Text>
                <Text style={styles.statValue}>{suggestions.length}</Text>
              </View>
              <View style={styles.statIcon}>
                <Ionicons name="bulb" size={24} color="#8B5CF6" />
              </View>
            </View>
          </Card>
        </View>

        {/* View Toggle */}
        {goals.length > 0 && (
          <View style={styles.viewToggleContainer}>
            <View style={styles.viewToggle}>
              <TouchableOpacity
                style={[
                  styles.viewToggleButton,
                  !showTimeline && styles.viewToggleButtonActive
                ]}
                onPress={() => setShowTimeline(false)}
              >
                <Ionicons 
                  name="list" 
                  size={16} 
                  color={!showTimeline ? '#FFFFFF' : '#6B7280'} 
                  style={styles.viewToggleIcon}
                />
                <Text style={[
                  styles.viewToggleText,
                  !showTimeline && styles.viewToggleTextActive
                ]}>
                  Lijst
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.viewToggleButton,
                  showTimeline && styles.viewToggleButtonActive
                ]}
                onPress={() => setShowTimeline(true)}
              >
                <Ionicons 
                  name="time" 
                  size={16} 
                  color={showTimeline ? '#FFFFFF' : '#6B7280'} 
                  style={styles.viewToggleIcon}
                />
                <Text style={[
                  styles.viewToggleText,
                  showTimeline && styles.viewToggleTextActive
                ]}>
                  Tijdlijn
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Timeline View */}
        {showTimeline && goals.length > 0 && (
          <Card style={styles.timelineCard}>
            <Text style={styles.timelineTitle}>⏰ Tijdlijn voor morgen</Text>
            <Text style={styles.timelineSubtitle}>Je doelen georganiseerd op tijd</Text>
            <Timeline 
              goals={goals} 
              targetDate={planningDate}
              showEmptySlots={false}
              onEditGoal={handleEditGoal}
            />
          </Card>
        )}

        {/* Goals List - alleen tonen als niet timeline view */}
        {!showTimeline && (
          <Card style={styles.goalsCard}>
            <Text style={styles.goalsTitle}>Je doelen voor morgen</Text>
            <Text style={styles.goalsSubtitle}>{goals.length} doelen gepland</Text>
            
            {goals.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="list-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>Nog geen doelen voor morgen</Text>
                <Text style={styles.emptyText}>Voeg je eerste doel toe om te beginnen!</Text>
              </View>
            ) : (
              <View style={styles.goalsList}>
                {goals.map((goal) => (
                  <Card key={goal.id} style={styles.goalCard}>
                    <View style={styles.goalContent}>
                      <View style={styles.goalMain}>
                        <Text style={styles.goalTitle}>{goal.title}</Text>
                        <Text style={styles.goalCategory}>
                          {getCategoryLabel(goal.category)}
                        </Text>
                        {goal.description && (
                          <Text style={styles.goalDescription}>{goal.description}</Text>
                        )}
                        {goal.timeSlot && (
                          <View style={styles.timeSlot}>
                            <Ionicons name="time" size={16} color="#6B7280" />
                            <Text style={styles.timeSlotText}>{goal.timeSlot}</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.goalActions}>
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() => handleEditGoal(goal)}
                        >
                          <Ionicons name="pencil" size={20} color="#6B7280" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeleteGoal(goal.id)}
                        >
                          <Ionicons name="trash" size={20} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            )}
          </Card>
        )}

        {/* Add Goal Button */}
        <TouchableOpacity 
          style={styles.addGoalButton}
          onPress={() => setShowAddGoal(true)}
        >
          <Text style={styles.addGoalButtonText}>+ Voeg Doel Toe</Text>
        </TouchableOpacity>

        {/* Smart Suggestions */}
        {suggestions.length > 0 && (
          <Card style={styles.suggestionsCard}>
            <Text style={styles.suggestionsTitle}>💡 Slimme suggesties</Text>
            <Text style={styles.suggestionsSubtitle}>Gebaseerd op je huidige planning</Text>
            
            <View style={styles.suggestionsList}>
              {suggestions.map((suggestion) => (
                <View key={suggestion.id} style={styles.suggestionItem}>
                  <View style={styles.suggestionContent}>
                    <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                    <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
                  </View>
                  <Button
                    title="+ Toevoegen"
                    onPress={() => handleAddSuggestion(suggestion)}
                    style={styles.addSuggestionButton}
                  />
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Planning Complete */}
        {goals.length > 0 && (
          <Card style={styles.completeCard}>
            <View style={styles.completeContent}>
              <View style={styles.completeIcon}>
                <Ionicons name="checkmark-circle" size={48} color="#10B981" />
              </View>
              <Text style={styles.completeTitle}>Je planning is klaar! ✨</Text>
              <Text style={styles.completeText}>
                Je hebt {goals.length} doel{goals.length !== 1 ? 'en' : ''} gepland voor morgen.
              </Text>
              <Text style={styles.completeTip}>
                💡 Tip: Bekijk je planning morgenochtend in de Timeline
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>
      
      {/* Goal Form Modal */}
      <GoalForm
        visible={showAddGoal || editingGoal !== null}
        onClose={handleCloseModal}
        onSave={handleSaveGoal}
        targetDate={planningDate}
        editingGoal={editingGoal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  debugContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  debugButton: {
    padding: 8,
  },
  debugButtonText: {
    fontSize: 12,
    color: '#6B7280',
  },
  debugCard: {
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    marginBottom: 16,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#92400E',
    marginBottom: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLeft: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalsCard: {
    padding: 16,
    marginBottom: 16,
  },
  goalsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  goalsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  goalsList: {
    gap: 12,
  },
  goalCard: {
    padding: 16,
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  goalMain: {
    flex: 1,
    marginRight: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  goalCategory: {
    fontSize: 12,
    color: '#3B82F6',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  goalDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  goalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  addGoalButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addGoalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  suggestionsCard: {
    padding: 16,
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  suggestionsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  suggestionsList: {
    gap: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  suggestionContent: {
    flex: 1,
    marginRight: 12,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  suggestionDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  addSuggestionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  completeCard: {
    padding: 24,
    marginBottom: 16,
  },
  completeContent: {
    alignItems: 'center',
  },
  completeIcon: {
    marginBottom: 16,
  },
  completeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  completeText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  completeTip: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  // View Toggle Styles
  viewToggleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  viewToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewToggleButtonActive: {
    backgroundColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  viewToggleIcon: {
    marginRight: 8,
  },
  viewToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  viewToggleTextActive: {
    color: '#FFFFFF',
  },
  // Timeline Styles
  timelineCard: {
    padding: 16,
    marginBottom: 16,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  timelineSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
});
