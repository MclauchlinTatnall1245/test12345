import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { GoalItem } from '../components/shared/GoalItem';
import { GoalForm } from '../components/shared/GoalForm';
import { Timeline } from '../components/shared/Timeline';
import { EveningReflectionCTA } from '../components/shared/EveningReflectionCTA';
import { useTodayGoals } from '../hooks/useTodayGoals';
import { Goal, MissedReason } from '../types';

export default function TodayScreen() {
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

  const completedGoals = goals.filter(goal => goal.completed);
  const pendingGoals = goals.filter(goal => !goal.completed && !goal.missed);
  const missedGoals = goals.filter(goal => goal.missed);

  const completionPercentage = goals.length > 0 
    ? Math.round((completedGoals.length / goals.length) * 100) 
    : 0;

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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Stats */}
        <Card style={styles.statsCard}>
          <CardContent style={styles.statsContent}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{goals.length}</Text>
              <Text style={styles.statLabel}>Doelen</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{completedGoals.length}</Text>
              <Text style={styles.statLabel}>Voltooid</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{completionPercentage}%</Text>
              <Text style={styles.statLabel}>Progress</Text>
            </View>
          </CardContent>
        </Card>

        {/* View Toggle */}
        <View style={styles.viewToggleContainer}>
          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              viewMode === 'cards' && styles.viewToggleButtonActive
            ]}
            onPress={() => setViewMode('cards')}
          >
            <Ionicons 
              name="grid" 
              size={20} 
              color={viewMode === 'cards' ? '#3B82F6' : '#6B7280'} 
            />
            <Text style={[
              styles.viewToggleText,
              viewMode === 'cards' && styles.viewToggleTextActive
            ]}>
              Kaarten
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              viewMode === 'timeline' && styles.viewToggleButtonActive
            ]}
            onPress={() => setViewMode('timeline')}
          >
            <Ionicons 
              name="time" 
              size={20} 
              color={viewMode === 'timeline' ? '#3B82F6' : '#6B7280'} 
            />
            <Text style={[
              styles.viewToggleText,
              viewMode === 'timeline' && styles.viewToggleTextActive
            ]}>
              Timeline
            </Text>
          </TouchableOpacity>
        </View>

        {/* Add Goal Button */}
        <Button
          title="📝 Nieuw doel toevoegen"
          onPress={handleAddGoalPress}
          style={styles.addButton}
        />

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
                <Text style={styles.sectionTitle}>
                  📋 Te doen ({pendingGoals.length})
                </Text>
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

            {completedGoals.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  ✅ Voltooid ({completedGoals.length})
                </Text>
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
                <Text style={styles.sectionTitle}>
                  ❌ Gemist ({missedGoals.length})
                </Text>
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
              <Button
                title="🎯 Eerste doel toevoegen"
                onPress={handleAddGoalPress}
                style={styles.emptyButton}
              />
            </CardContent>
          </Card>
        )}

        {/* Evening Reflection CTA */}
        <View style={styles.reflectionContainer}>
          <EveningReflectionCTA
            totalGoals={goals.length}
            completedGoals={completedGoals.length}
          />
        </View>

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
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
    padding: 16,
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
  statsCard: {
    marginBottom: 16,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  addButton: {
    marginBottom: 24,
  },
  viewToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  viewToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    gap: 8,
  },
  viewToggleButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  viewToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  viewToggleTextActive: {
    color: '#3B82F6',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  reflectionContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  emptyCard: {
    marginTop: 40,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyButton: {
    minWidth: 200,
  },
  bottomPadding: {
    height: 100,
  },
});
