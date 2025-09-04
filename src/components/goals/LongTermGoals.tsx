import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Input from '../ui/Input';
import { LongTermGoal, GOAL_CATEGORIES } from '../../types';
import { DataService } from '../../lib/data-service';

export default function LongTermGoalsComponent() {
  const [goals, setGoals] = useState<LongTermGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'health',
    targetDate: ''
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const savedGoals = await DataService.getLongTermGoals();
      // Parse date strings back to Date objects
      const parsedGoals = savedGoals.map(goal => ({
        ...goal,
        targetDate: new Date(goal.targetDate),
        createdAt: new Date(goal.createdAt),
        lastCheckIn: goal.lastCheckIn ? new Date(goal.lastCheckIn) : undefined
      }));
      setGoals(parsedGoals);
    } catch (error) {
      console.error('Error loading long term goals:', error);
      Alert.alert('Error', 'Kon doelen niet laden');
    } finally {
      setLoading(false);
    }
  };

  const saveGoals = async (updatedGoals: LongTermGoal[]) => {
    try {
      // Save each goal individually
      for (const goal of updatedGoals) {
        await DataService.saveLongTermGoal(goal);
      }
      setGoals(updatedGoals);
    } catch (error) {
      console.error('Error saving goals:', error);
      Alert.alert('Error', 'Kon doelen niet opslaan');
    }
  };

  const addGoal = async () => {
    if (!newGoal.title.trim()) {
      Alert.alert('Fout', 'Voer een titel in voor je doel');
      return;
    }

    const goal: LongTermGoal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category,
      targetDate: newGoal.targetDate ? new Date(newGoal.targetDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default: 30 dagen
      progress: 0,
      relatedDailyActions: [],
      createdAt: new Date(),
      completed: false
    };

    try {
      await DataService.saveLongTermGoal(goal);
      setGoals([...goals, goal]);
      setNewGoal({ title: '', description: '', category: 'health', targetDate: '' });
      setShowForm(false);
      Alert.alert('Succes', 'Doel toegevoegd!');
    } catch (error) {
      console.error('Error adding goal:', error);
      Alert.alert('Error', 'Kon doel niet toevoegen');
    }
  };

  const updateGoalProgress = async (goalId: string, newProgress: number) => {
    const updatedGoals = goals.map(goal =>
      goal.id === goalId 
        ? { ...goal, progress: Math.max(0, Math.min(100, newProgress)), lastCheckIn: new Date() }
        : goal
    );
    await saveGoals(updatedGoals);
  };

  const deleteGoal = async (goalId: string) => {
    Alert.alert(
      'Doel verwijderen',
      'Weet je zeker dat je dit doel wilt verwijderen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Verwijderen',
          style: 'destructive',
          onPress: async () => {
            try {
              await DataService.deleteLongTermGoal(goalId);
              const updatedGoals = goals.filter(goal => goal.id !== goalId);
              setGoals(updatedGoals);
            } catch (error) {
              console.error('Error deleting goal:', error);
              Alert.alert('Error', 'Kon doel niet verwijderen');
            }
          }
        }
      ]
    );
  };

  const toggleGoalCompletion = async (goalId: string) => {
    const updatedGoals = goals.map(goal =>
      goal.id === goalId ? { 
        ...goal, 
        completed: !goal.completed, 
        progress: goal.completed ? goal.progress : 100,
        lastCheckIn: new Date()
      } : goal
    );
    await saveGoals(updatedGoals);
  };

  const completedGoals = goals.filter(goal => goal.completed);
  const inProgressGoals = goals.filter(goal => !goal.completed);

  const getCategoryInfo = (categoryValue: string) => {
    return GOAL_CATEGORIES.find(cat => cat.value === categoryValue) || GOAL_CATEGORIES[0];
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#10B981'; // green
    if (progress >= 50) return '#F59E0B'; // yellow  
    return '#EF4444'; // red
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Langetermijn Doelen</Text>
          <Text style={styles.subtitle}>Plan en volg je grote doelen voor de toekomst</Text>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <CardContent style={styles.statContent}>
              <View style={styles.statLeft}>
                <Text style={styles.statLabel}>Totaal Doelen</Text>
                <Text style={styles.statValue}>{goals.length}</Text>
              </View>
              <View style={[styles.statIcon, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="list" size={24} color="#3B82F6" />
              </View>
            </CardContent>
          </Card>

          <Card style={styles.statCard}>
            <CardContent style={styles.statContent}>
              <View style={styles.statLeft}>
                <Text style={styles.statLabel}>Afgerond</Text>
                <Text style={[styles.statValue, { color: '#10B981' }]}>{completedGoals.length}</Text>
              </View>
              <View style={[styles.statIcon, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              </View>
            </CardContent>
          </Card>

          <Card style={styles.statCard}>
            <CardContent style={styles.statContent}>
              <View style={styles.statLeft}>
                <Text style={styles.statLabel}>Gem. Voortgang</Text>
                <Text style={[styles.statValue, { color: '#8B5CF6' }]}>
                  {goals.length > 0 ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length) : 0}%
                </Text>
              </View>
              <View style={[styles.statIcon, { backgroundColor: '#FAF5FF' }]}>
                <Ionicons name="trending-up" size={24} color="#8B5CF6" />
              </View>
            </CardContent>
          </Card>
        </View>

        {/* Add Goal Form */}
        {showForm && (
          <Card style={styles.formCard}>
            <CardHeader>
              <CardTitle>Nieuw Langetermijn Doel</CardTitle>
              <CardDescription>Voeg een nieuw doel toe aan je lijst</CardDescription>
            </CardHeader>
            <CardContent>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Doel Titel</Text>
                <Input
                  placeholder="Bijv. 10kg afvallen"
                  value={newGoal.title}
                  onChangeText={(text) => setNewGoal({ ...newGoal, title: text })}
                  style={styles.formInput}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Categorie</Text>
                <Select
                  value={newGoal.category}
                  onSelect={(value) => setNewGoal({ ...newGoal, category: value })}
                  options={GOAL_CATEGORIES.map(cat => ({
                    label: `${cat.icon} ${cat.label}`,
                    value: cat.value
                  }))}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Deadline (optioneel)</Text>
                <Input
                  placeholder="YYYY-MM-DD"
                  value={newGoal.targetDate}
                  onChangeText={(text) => setNewGoal({ ...newGoal, targetDate: text })}
                  style={styles.formInput}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Beschrijving</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Beschrijf je doel in detail..."
                  value={newGoal.description}
                  onChangeText={(text) => setNewGoal({ ...newGoal, description: text })}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.formButtons}>
                <Button
                  title="Doel Toevoegen"
                  onPress={addGoal}
                  disabled={!newGoal.title.trim()}
                  style={styles.addButton}
                />
                <Button
                  title="Annuleren"
                  variant="outline"
                  onPress={() => {
                    setShowForm(false);
                    setNewGoal({ title: '', description: '', category: 'health', targetDate: '' });
                  }}
                  style={styles.cancelButton}
                />
              </View>
            </CardContent>
          </Card>
        )}

        {/* Goals List */}
        {goals.length === 0 ? (
          <Card style={styles.emptyCard}>
            <CardContent style={styles.emptyContent}>
              <Ionicons name="clipboard-outline" size={48} color="#9CA3AF" style={styles.emptyIcon} />
              <Text style={styles.emptyTitle}>Nog geen lange termijn doelen</Text>
              <Text style={styles.emptyText}>Begin met het toevoegen van je eerste grote doel!</Text>
              <Button
                title="Eerste doel toevoegen"
                onPress={() => setShowForm(true)}
                style={styles.emptyButton}
              />
            </CardContent>
          </Card>
        ) : (
          <>
            {!showForm && (
              <View style={styles.addButtonContainer}>
                <Button
                  title="+ Nieuw Doel Toevoegen"
                  onPress={() => setShowForm(true)}
                  style={styles.mainAddButton}
                />
              </View>
            )}

            {/* In Progress Goals */}
            {inProgressGoals.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>In Uitvoering</Text>
                <View style={styles.goalsGrid}>
                  {inProgressGoals.map((goal) => {
                    const categoryInfo = getCategoryInfo(goal.category);
                    return (
                      <GoalCard
                        key={goal.id}
                        goal={goal}
                        categoryInfo={categoryInfo}
                        onUpdateProgress={updateGoalProgress}
                        onDelete={deleteGoal}
                        onToggleCompletion={toggleGoalCompletion}
                        getProgressColor={getProgressColor}
                      />
                    );
                  })}
                </View>
              </View>
            )}

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Afgerond</Text>
                <View style={styles.goalsGrid}>
                  {completedGoals.map((goal) => {
                    const categoryInfo = getCategoryInfo(goal.category);
                    return (
                      <GoalCard
                        key={goal.id}
                        goal={goal}
                        categoryInfo={categoryInfo}
                        onUpdateProgress={updateGoalProgress}
                        onDelete={deleteGoal}
                        onToggleCompletion={toggleGoalCompletion}
                        getProgressColor={getProgressColor}
                        isCompleted={true}
                      />
                    );
                  })}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Goal Card Component
interface GoalCardProps {
  goal: LongTermGoal;
  categoryInfo: any;
  onUpdateProgress: (goalId: string, progress: number) => void;
  onDelete: (goalId: string) => void;
  onToggleCompletion: (goalId: string) => void;
  getProgressColor: (progress: number) => string;
  isCompleted?: boolean;
}

function GoalCard({ 
  goal, 
  categoryInfo, 
  onUpdateProgress, 
  onDelete, 
  onToggleCompletion, 
  getProgressColor,
  isCompleted = false 
}: GoalCardProps) {
  const cardStyle = isCompleted 
    ? { ...styles.goalCard, ...styles.completedGoalCard }
    : styles.goalCard;
    
  const titleStyle = isCompleted
    ? { ...styles.goalTitle, ...styles.completedTitle }
    : styles.goalTitle;

  return (
    <Card style={cardStyle}>
      <CardHeader>
        <View style={styles.goalHeader}>
          <View style={styles.goalHeaderLeft}>
            <View style={styles.categoryBadgeContainer}>
              <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color + '20' }]}>
                <Text style={styles.categoryEmoji}>{categoryInfo.icon}</Text>
                <Text style={[styles.categoryText, { color: categoryInfo.color }]}>
                  {categoryInfo.label}
                </Text>
              </View>
              {isCompleted && (
                <View style={styles.completedBadge}>
                  <Text style={styles.completedText}>✅ Voltooid</Text>
                </View>
              )}
            </View>
            <CardTitle style={titleStyle}>
              {goal.title}
            </CardTitle>
            {goal.description && (
              <CardDescription style={styles.goalDescription}>
                {goal.description}
              </CardDescription>
            )}
          </View>
          <TouchableOpacity
            onPress={() => onDelete(goal.id)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </CardHeader>
      <CardContent>
        <View style={styles.goalContent}>
          {goal.targetDate && (
            <View style={styles.deadlineContainer}>
              <Text style={styles.deadlineLabel}>Deadline:</Text>
              <Text style={styles.deadlineText}>
                {goal.targetDate.toLocaleDateString('nl-NL')}
              </Text>
            </View>
          )}

          {!isCompleted && (
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Voortgang</Text>
                <Text style={styles.progressText}>{goal.progress}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${goal.progress}%`,
                      backgroundColor: getProgressColor(goal.progress)
                    }
                  ]} 
                />
              </View>
            </View>
          )}

          <View style={styles.goalActions}>
            {!isCompleted && (
              <>
                <Button
                  title="-10%"
                  variant="outline"
                  size="sm"
                  onPress={() => onUpdateProgress(goal.id, goal.progress - 10)}
                  disabled={goal.progress <= 0}
                  style={styles.progressButton}
                />
                <Button
                  title="+10%"
                  variant="outline"
                  size="sm"
                  onPress={() => onUpdateProgress(goal.id, goal.progress + 10)}
                  disabled={goal.progress >= 100}
                  style={styles.progressButton}
                />
              </>
            )}
            <Button
              title={isCompleted ? "Markeer als Niet Voltooid" : "Markeer als Voltooid"}
              size="sm"
              onPress={() => onToggleCompletion(goal.id)}
              style={{ ...styles.completionButton, flex: 1 }}
            />
          </View>
        </View>
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  statsContainer: {
    marginBottom: 24,
  },
  statCard: {
    marginBottom: 12,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  statLeft: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formCard: {
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
  },
  formInput: {
    marginBottom: 0,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  addButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
  emptyCard: {
    marginTop: 40,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    minWidth: 200,
  },
  addButtonContainer: {
    marginBottom: 24,
  },
  mainAddButton: {
    backgroundColor: '#3B82F6',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  goalCard: {
    width: '48%', // Twee cards naast elkaar met ruimte voor gap
    marginBottom: 16,
  },
  completedGoalCard: {
    opacity: 0.8,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  goalHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  categoryBadgeContainer: {
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  categoryEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  completedBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  completedText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#16A34A',
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
  },
  goalDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  deleteButton: {
    padding: 4,
  },
  goalContent: {
    gap: 16,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadlineLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginRight: 8,
  },
  deadlineText: {
    fontSize: 14,
    color: '#1F2937',
  },
  progressContainer: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  progressButton: {
    minWidth: 60,
  },
  completionButton: {
    backgroundColor: '#3B82F6',
  },
});
