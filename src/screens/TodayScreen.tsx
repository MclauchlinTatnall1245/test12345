import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { DebugPanel } from '../components/ui/DebugPanel';
import { GoalItem } from '../components/shared/GoalItem';
import { GoalForm } from '../components/shared/GoalForm';
import { Timeline } from '../components/shared/Timeline';
import { EveningReflectionCTA } from '../components/shared/EveningReflectionCTA';
import { useTodayGoals } from '../hooks/useTodayGoals';
import { Goal, MissedReason } from '../types';
import type { RootTabParamList } from '../navigation/AppNavigator';
import TimeService from '../lib/time-service';

type TodayScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Today'>;

export default function TodayScreen() {
  const navigation = useNavigation<TodayScreenNavigationProp>();
  const {
    goals,
    loading,
    error,
    todayDate,
    toggleGoal,
    addGoal,
    editGoal,
    deleteGoal,
    markGoalAsMissed,
    refreshGoals,
  } = useTodayGoals();

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'timeline'>('cards');
  const [reflectionRefreshTrigger, setReflectionRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refresh alle data wanneer de pagina focus krijgt
  useFocusEffect(
    useCallback(() => {
      console.log('Today screen focused - refreshing data...');
      refreshGoals();
      setReflectionRefreshTrigger(prev => prev + 1);
    }, [refreshGoals])
  );

  // Handmatige refresh functie voor pull-to-refresh
  const handleManualRefresh = useCallback(async () => {
    console.log('Manual refresh triggered...');
    setIsRefreshing(true);
    
    try {
      // Refresh goals
      await refreshGoals();
      
      // Refresh reflection status
      setReflectionRefreshTrigger(prev => prev + 1);
      
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
  }, [refreshGoals]);

  const completedGoals = goals
    .filter(goal => goal.completed)
    .sort((a, b) => {
      // Sorteer op completedAt datum, waarbij de meest recente bovenaan komt
      // Als completedAt niet bestaat, gebruik dan de createdAt als fallback
      const dateA = a.completedAt || a.createdAt;
      const dateB = b.completedAt || b.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  
  const pendingGoals = goals
    .filter(goal => !goal.completed && !goal.missed)
    .sort((a, b) => {
      // Helper functie om tijd uit timeSlot te extraheren
      const parseTime = (timeSlot: string | undefined): number => {
        if (!timeSlot) return 9999; // Doelen zonder tijd komen onderaan
        
        // Extract tijd uit verschillende formaten zoals "09:00", "voor 09:00", "09:00-10:00"
        const timeMatch = timeSlot.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
          const hours = parseInt(timeMatch[1]);
          const minutes = parseInt(timeMatch[2]);
          return hours * 60 + minutes; // Converteer naar minuten sinds middernacht
        }
        
        return 9999; // Als geen tijd gevonden, naar beneden
      };
      
      const timeA = parseTime(a.timeSlot);
      const timeB = parseTime(b.timeSlot);
      
      return timeA - timeB; // Sorteer van vroeg naar laat
    });
  
  const missedGoals = goals.filter(goal => goal.missed);

  const remainingGoals = pendingGoals.length;

  const handleAddGoalPress = () => {
    setShowAddGoal(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
  };

  const handleCloseModal = () => {
    setShowAddGoal(false);
    setEditingGoal(null);
  };

  const handleSaveGoal = async (goal: Goal) => {
    try {
      if (editingGoal) {
        await editGoal(goal);
      } else {
        await addGoal(goal);
      }
    } catch (error) {
      Alert.alert(
        'Fout',
        'Er is een fout opgetreden bij het opslaan van het doel.',
        [{ text: 'OK' }]
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Doelen laden...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Er ging iets mis</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Button 
            title="Opnieuw proberen" 
            onPress={refreshGoals}
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Debug Panel */}
      <DebugPanel todayDate={todayDate} />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleManualRefresh}
            colors={['#8B5CF6', '#A855F7']} // Android gradient colors
            tintColor="#8B5CF6" // iOS spinner color
            title="Doelen & reflecties verversen..." // iOS text
            titleColor="#6B7280" // iOS text color
            progressBackgroundColor="#FFFFFF" // Android background
          />
        }
      >
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
                <Ionicons name="today-outline" size={24} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>Vandaag</Text>
              <Text style={styles.heroSubtitle}>
                {TimeService.formatDate(todayDate)}
              </Text>
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
              colors={['rgba(5, 150, 105, 0.15)', 'rgba(5, 150, 105, 0.05)']}
              style={styles.statGradientBg}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
            />
            <View style={styles.statContent}>
              <View style={[styles.statIconContainer, { backgroundColor: '#DCFCE7' }]}> 
                <Ionicons name="checkmark" size={14} color="#059669" />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>Voltooid</Text>
                <Text style={[styles.statValue, { color: '#059669' }]}>{completedGoals.length}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(234, 88, 12, 0.15)', 'rgba(234, 88, 12, 0.05)']}
              style={styles.statGradientBg}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
            />
            <View style={styles.statContent}>
              <View style={[styles.statIconContainer, { backgroundColor: '#FED7AA' }]}> 
                <Ionicons name="time-outline" size={14} color="#EA580C" />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>Te gaan</Text>
                <Text style={[styles.statValue, { color: '#EA580C' }]}>{remainingGoals}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Evening Reflection CTA - Prominente versie (bovenaan) */}
        <EveningReflectionCTA
          totalGoals={goals.length}
          completedGoals={completedGoals.length}
          onStartReflection={() => navigation.navigate('Reflection')}
          onViewReflection={() => navigation.navigate('Reflection')}
          onPlanNextDay={() => navigation.navigate('Planning')}
          refreshTrigger={reflectionRefreshTrigger}
          position="top"
        />

        {/* Futuristic View Toggle */}
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'cards' && styles.toggleButtonActive
            ]}
            onPress={() => setViewMode('cards')}
          >
            {viewMode === 'cards' ? (
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
              viewMode === 'timeline' && styles.toggleButtonActive
            ]}
            onPress={() => setViewMode('timeline')}
          >
            {viewMode === 'timeline' ? (
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

        {/* Show full button only when all goals are completed */}
        {goals.length > 0 && completedGoals.length === goals.length && (
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleAddGoalPress}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.buttonGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
            >
              <Ionicons name="add-outline" size={24} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Nieuw doel toevoegen</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Content based on view mode */}
        {viewMode === 'timeline' ? (
          <Timeline
            goals={goals}
            onToggleGoal={toggleGoal}
            onEditGoal={handleEditGoal}
            onMissGoal={markGoalAsMissed}
            onDeleteGoal={deleteGoal}
            targetDate={todayDate}
            showEmptySlots={true}
          />
        ) : (
          /* Cards View */
          <>
            {/* Goals Sections */}
            {pendingGoals.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleContainer}>
                    <Ionicons name="clipboard-outline" size={24} color="#1e293b" />
                    <Text style={styles.sectionTitle}>
                      Te doen ({pendingGoals.length})
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.smallAddButton}
                    onPress={handleAddGoalPress}
                  >
                    <Ionicons name="add" size={26} color="#667eea" />
                  </TouchableOpacity>
                </View>
                {pendingGoals.map(goal => (
                  <GoalItem
                    key={goal.id}
                    goal={goal}
                    onToggleComplete={toggleGoal}
                    onEdit={handleEditGoal}
                    onDelete={deleteGoal}
                    onMarkAsMissed={markGoalAsMissed}
                  />
                ))}
              </View>
            )}

            {/* When no pending goals, show section with add button */}
            {pendingGoals.length === 0 && goals.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleContainer}>
                    <Ionicons name="clipboard-outline" size={24} color="#1e293b" />
                    <Text style={styles.sectionTitle}>
                      Te doen (0)
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.smallAddButton}
                    onPress={handleAddGoalPress}
                  >
                    <Ionicons name="add" size={26} color="#667eea" />
                  </TouchableOpacity>
                </View>
                <View style={styles.emptySection}>
                  <Ionicons name="trophy-outline" size={20} color="#10B981" />
                  <Text style={styles.emptySectionText}>
                    Alle doelen zijn voltooid!
                  </Text>
                </View>
              </View>
            )}

            {completedGoals.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderCompact}>
                  <View style={styles.sectionTitleContainer}>
                    <Ionicons name="checkmark-done-outline" size={24} color="#1e293b" />
                    <Text style={styles.sectionTitle}>
                      Voltooid ({completedGoals.length})
                    </Text>
                  </View>
                </View>
                {completedGoals.map(goal => (
                  <GoalItem
                    key={goal.id}
                    goal={goal}
                    onToggleComplete={toggleGoal}
                    onEdit={handleEditGoal}
                    onDelete={deleteGoal}
                    onMarkAsMissed={markGoalAsMissed}
                  />
                ))}
              </View>
            )}

            {missedGoals.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderCompact}>
                  <View style={styles.sectionTitleContainer}>
                    <Ionicons name="close-circle-outline" size={24} color="#1e293b" />
                    <Text style={styles.sectionTitle}>
                      Gemist ({missedGoals.length})
                    </Text>
                  </View>
                </View>
                {missedGoals.map(goal => (
                  <GoalItem
                    key={goal.id}
                    goal={goal}
                    onToggleComplete={toggleGoal}
                    onEdit={handleEditGoal}
                    onDelete={deleteGoal}
                    onMarkAsMissed={markGoalAsMissed}
                  />
                ))}
              </View>
            )}
          </>
        )}

        {/* Empty State */}
        {goals.length === 0 && (
          <Card style={styles.emptyCard}>
            <CardContent style={styles.emptyContent}>
              <Ionicons name="clipboard-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Geen doelen voor vandaag</Text>
              <Text style={styles.emptyMessage}>
                Voeg je eerste doel toe om te beginnen met het bouwen van je discipline!
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleAddGoalPress}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.buttonGradient}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                >
                  <Ionicons name="add-outline" size={24} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Eerste doel toevoegen</Text>
                </LinearGradient>
              </TouchableOpacity>
            </CardContent>
          </Card>
        )}

        {/* Evening Reflection CTA - Subtiele versie (onderaan) */}
        <EveningReflectionCTA
          totalGoals={goals.length}
          completedGoals={completedGoals.length}
          onStartReflection={() => navigation.navigate('Reflection')}
          onViewReflection={() => navigation.navigate('Reflection')}
          onPlanNextDay={() => navigation.navigate('Planning')}
          refreshTrigger={reflectionRefreshTrigger}
          position="bottom"
        />

        {/* Bottom padding for tab bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Goal Form Modal */}
      <GoalForm
        visible={showAddGoal || editingGoal !== null}
        onClose={handleCloseModal}
        onSave={handleSaveGoal}
        targetDate={todayDate}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    minWidth: 160,
  },

  // Elegant Header
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerGradient: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E8F2FF', // Subtiel blauwe rand
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A202C', // Warmer zwart
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#4A5568', // Warmer grijs
    fontWeight: '500',
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

  // Elegant Reflection Container
  reflectionContainer: {
    marginTop: 32,
    marginBottom: 32,
    marginHorizontal: 24,
  },

  // Premium Empty State
  emptyCard: {
    marginTop: 60,
    marginHorizontal: 24,
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
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
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
    fontSize: 17,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
    fontWeight: '500',
  },
  emptyButton: {
    minWidth: 200,
    borderRadius: 8,
  },
  bottomPadding: {
    height: 120,
  },
});
