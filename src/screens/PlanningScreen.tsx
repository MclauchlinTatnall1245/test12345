import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Goal, Suggestion, GoalCategory } from '../types';
import { CategorySystemHelper } from '../lib/category-system';
import TimeService from '../lib/time-service';
import { DataService, SuggestionEngine } from '../lib/data-service';
import { Timeline } from '../components/shared/Timeline';
import { GoalForm } from '../components/shared/GoalForm';
import { GoalItem } from '../components/shared/GoalItem';

export default function PlanningScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showTimeline, setShowTimeline] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Handmatige refresh functie voor pull-to-refresh
  const handleManualRefresh = useCallback(async () => {
    console.log('Manual refresh triggered on planning screen...');
    setIsRefreshing(true);
    
    try {
      // Herlaad de planning data
      await loadPlan();
      
      // Korte delay voor betere UX (zodat gebruiker ziet dat er iets gebeurt)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log('Manual refresh completed successfully');
    } catch (error) {
      console.error('Error during manual refresh:', error);
      Alert.alert(
        'Refresh Fout',
        'Er ging iets mis tijdens het verversen. Probeer het opnieuw.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsRefreshing(false);
    }
  }, [planningDate]);

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
    // Direct verwijderen - GoalItem component heeft al zijn eigen confirmatie
    const updatedGoals = goals.filter(goal => goal.id !== goalId);
    setGoals(updatedGoals);
    DataService.deleteGoal(planningDate, goalId);
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
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleManualRefresh}
            colors={['#667eea', '#764ba2']} // Android gradient colors
            tintColor="#667eea" // iOS spinner color
            title="Planning verversen..." // iOS text
            titleColor="#6B7280" // iOS text color
            progressBackgroundColor="#FFFFFF" // Android background
          />
        }
      >
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

        {/* Modern Subtiele Hero */}
        <View style={styles.heroContainer}>
          <View style={styles.heroHeader}>
            <View style={styles.heroIconContainer}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.iconGradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
              >
                <Ionicons name="moon-outline" size={24} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>{getPlanningTitle()}</Text>
              <Text style={styles.heroSubtitle}>{getPlanningDescription()}</Text>
            </View>
          </View>
        </View>

        {/* Subtiele Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(37, 99, 235, 0.15)', 'rgba(37, 99, 235, 0.05)']}
              style={styles.statGradientBg}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
            />
            <View style={styles.statContent}>
              <View style={[styles.statIconContainer, { backgroundColor: '#DBEAFE' }]}> 
                <Ionicons name="list-outline" size={14} color="#2563EB" />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>Doelen</Text>
                <Text style={[styles.statValue, { color: '#2563EB' }]}>{goals.length}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.15)', 'rgba(16, 185, 129, 0.05)']}
              style={styles.statGradientBg}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
            />
            <View style={styles.statContent}>
              <View style={[styles.statIconContainer, { backgroundColor: '#DCFCE7' }]}> 
                <Ionicons name="time-outline" size={14} color="#10B981" />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>Met tijd</Text>
                <Text style={[styles.statValue, { color: '#10B981' }]}>{goals.filter(g => g.timeSlot).length}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.15)', 'rgba(139, 92, 246, 0.05)']}
              style={styles.statGradientBg}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
            />
            <View style={styles.statContent}>
              <View style={[styles.statIconContainer, { backgroundColor: '#EDE9FE' }]}> 
                <Ionicons name="bulb-outline" size={14} color="#8B5CF6" />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>Suggesties</Text>
                <Text style={[styles.statValue, { color: '#8B5CF6' }]}>{suggestions.length}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Futuristic View Toggle */}
        {goals.length > 0 && (
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                !showTimeline && styles.toggleButtonActive
              ]}
              onPress={() => setShowTimeline(false)}
            >
              {!showTimeline ? (
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.toggleGradient}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                >
                  <Ionicons 
                    name="grid-outline" 
                    size={20} 
                    color="#FFFFFF"
                  />
                  <Text style={styles.toggleTextActive}>
                    Lijst
                  </Text>
                </LinearGradient>
              ) : (
                <View style={styles.toggleGradient}>
                  <Ionicons 
                    name="grid-outline" 
                    size={20} 
                    color="#64748B"
                  />
                  <Text style={styles.toggleText}>
                    Lijst
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                showTimeline && styles.toggleButtonActive
              ]}
              onPress={() => setShowTimeline(true)}
            >
              {showTimeline ? (
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.toggleGradient}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                >
                  <Ionicons 
                    name="time-outline" 
                    size={20} 
                    color="#FFFFFF"
                  />
                  <Text style={styles.toggleTextActive}>
                    Tijdlijn
                  </Text>
                </LinearGradient>
              ) : (
                <View style={styles.toggleGradient}>
                  <Ionicons 
                    name="time-outline" 
                    size={20} 
                    color="#64748B"
                  />
                  <Text style={styles.toggleText}>
                    Tijdlijn
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Content based on view mode */}
        {showTimeline ? (
          /* Timeline View */
          <View style={styles.section}>
            <View style={styles.sectionHeaderCompact}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="time-outline" size={24} color="#1e293b" />
                <Text style={styles.sectionTitle}>Tijdlijn voor morgen</Text>
              </View>
            </View>
            <Timeline 
              goals={goals} 
              targetDate={planningDate}
              showEmptySlots={false}
              onEditGoal={handleEditGoal}
            />
          </View>
        ) : (
          /* Cards View */
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="clipboard-outline" size={24} color="#1e293b" />
                <Text style={styles.sectionTitle}>
                  Je doelen voor morgen ({goals.length})
                </Text>
              </View>
            </View>
            
            {goals.length === 0 ? (
              <View style={styles.emptySection}>
                <Ionicons name="list-outline" size={20} color="#8B5CF6" />
                <Text style={styles.emptySectionText}>
                  Nog geen doelen voor morgen
                </Text>
              </View>
            ) : (
              <View style={styles.goalsList}>
                {goals.map((goal) => (
                  <GoalItem
                    key={goal.id}
                    goal={goal}
                    // onToggleComplete niet meegegeven - planning doelen kunnen niet afgevinkt worden
                    onEdit={handleEditGoal}
                    onDelete={handleDeleteGoal} // Delete button wel behouden
                    // onMarkAsMissed niet meegegeven - planning doelen kunnen niet gemist worden
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Add Goal Button - altijd zichtbaar */}
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => setShowAddGoal(true)}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.buttonGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
          >
            <Ionicons name="add-outline" size={24} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>
              {goals.length === 0 ? 'Eerste doel toevoegen' : 'Voeg doel toe'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Smart Suggestions */}
        {suggestions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderCompact}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="bulb-outline" size={24} color="#1e293b" />
                <Text style={styles.sectionTitle}>Slimme suggesties</Text>
              </View>
            </View>
            <Text style={styles.sectionSubtitle}>Gebaseerd op je huidige planning</Text>
            
            <View style={styles.suggestionsList}>
              {suggestions.map((suggestion) => (
                <Card key={suggestion.id} style={styles.suggestionCard}>
                  <View style={styles.suggestionContent}>
                    <View style={styles.suggestionMain}>
                      <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                      <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.addSuggestionButton}
                      onPress={() => handleAddSuggestion(suggestion)}
                    >
                      <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        style={styles.suggestionButtonGradient}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 1}}
                      >
                        <Ionicons name="add" size={16} color="#FFFFFF" />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        )}

        {/* Planning Complete */}
        {goals.length > 0 && (
          <Card style={styles.completeCard}>
            <CardContent style={styles.completeContent}>
              <View style={styles.completeIcon}>
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.completeIconGradient}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                >
                  <Ionicons name="checkmark-circle" size={32} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <Text style={styles.completeTitle}>Je planning is klaar! ✨</Text>
              <Text style={styles.completeText}>
                Je hebt {goals.length} doel{goals.length !== 1 ? 'en' : ''} gepland voor morgen.
              </Text>
              <Text style={styles.completeTip}>
                💡 Tip: Bekijk je planning morgenochtend in de Timeline
              </Text>
            </CardContent>
          </Card>
        )}

        {/* Bottom padding for better scrolling */}
        <View style={styles.bottomPadding} />
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
    backgroundColor: '#F8FAFC', // Moderne neutrale achtergrond
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 120,
  },
  debugContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
    marginHorizontal: 24,
    marginTop: 12,
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
    marginHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
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

  // Ultra Modern Hero Section
  heroContainer: {
    marginHorizontal: 24,
    marginTop: 12,
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 18,
    shadowColor: 'rgba(99, 102, 241, 0.2)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  heroIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    marginRight: 16,
    shadowColor: 'rgba(59, 130, 246, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },
  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(102, 126, 234, 0.4)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '600',
    opacity: 0.9,
  },

  // Premium Glass Morphism Stats Cards
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 28,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    shadowColor: 'rgba(99, 102, 241, 0.15)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    minHeight: 65,
    position: 'relative',
    overflow: 'hidden',
  },
  statGradientBg: {
    position: 'absolute',
    top: -25,
    right: -25,
    width: 80,
    height: 80,
    borderRadius: 40,
    zIndex: 0,
  },
  statContent: {
    alignItems: 'center',
    width: '100%',
    position: 'relative',
    zIndex: 1,
  },
  statTextContainer: {
    alignItems: 'center',
    width: '100%',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -1,
    textAlign: 'center',
  },
  statIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },

  // Modern Glass Toggle
  viewToggle: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: 'rgba(99, 102, 241, 0.2)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
  },
  toggleButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  toggleGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
    borderRadius: 10,
  },
  toggleGradientActive: {
    shadowColor: 'rgba(102, 126, 234, 0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  toggleButtonActive: {
    transform: [{ scale: 1.02 }],
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.2,
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },

  // Premium Gradient Button
  primaryButton: {
    marginHorizontal: 24,
    marginBottom: 32,
    borderRadius: 20,
    shadowColor: 'rgba(102, 126, 234, 0.4)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 12,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },

  // Modern Sections
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
  sectionHeaderCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
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
  sectionSubtitle: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  smallAddButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(102, 126, 234, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  emptySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    gap: 8,
  },
  emptySectionText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },

  // Goals List
  goalsList: {
    gap: 12,
  },

  // Suggestions
  suggestionsList: {
    gap: 12,
  },
  suggestionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: 'rgba(99, 102, 241, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  suggestionMain: {
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
    width: 40,
    height: 40,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: 'rgba(102, 126, 234, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },
  suggestionButtonGradient: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },

  // Complete Card
  completeCard: {
    marginHorizontal: 24,
    marginBottom: 32,
    borderRadius: 24,
    shadowColor: 'rgba(99, 102, 241, 0.15)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  completeContent: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  completeIcon: {
    marginBottom: 16,
    shadowColor: 'rgba(16, 185, 129, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },
  completeIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  completeText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  completeTip: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.8,
  },

  bottomPadding: {
    height: 120,
  },
});
