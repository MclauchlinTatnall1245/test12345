import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Goal, MissedReason } from '../../types';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { MissGoalModal } from './MissGoalModal';

interface GoalItemProps {
  goal: Goal;
  onToggleComplete: (goalId: string) => void;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onMarkAsMissed: (goalId: string, reason: MissedReason, notes?: string) => void;
}

// Helper function om category kleur te krijgen
const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    health: '#10B981', // green-500
    productivity: '#3B82F6', // blue-500
    household: '#F59E0B', // amber-500
    practical: '#8B5CF6', // violet-500
    personal_development: '#EF4444', // red-500
    entertainment: '#06B6D4', // cyan-500
    social: '#EC4899', // pink-500
    finance: '#84CC16', // lime-500
    shopping: '#F97316', // orange-500
    other: '#6B7280', // gray-500
  };
  return colors[category] || colors.other;
};

export function GoalItem({ 
  goal, 
  onToggleComplete, 
  onEdit, 
  onDelete, 
  onMarkAsMissed 
}: GoalItemProps) {
  const [showMissModal, setShowMissModal] = useState(false);
  const categoryColor = getCategoryColor(goal.category);
  const isCompleted = goal.completed;
  const isMissed = !!goal.missed;

  const handleDelete = () => {
    Alert.alert(
      'Doel verwijderen',
      'Weet je zeker dat je dit doel wilt verwijderen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        { 
          text: 'Verwijderen', 
          style: 'destructive',
          onPress: () => onDelete(goal.id) 
        },
      ]
    );
  };

  const handleMarkAsMissed = () => {
    setShowMissModal(true);
  };

  const handleMissConfirm = (reason: MissedReason, notes?: string) => {
    onMarkAsMissed(goal.id, reason, notes);
    setShowMissModal(false);
  };

  return (
    <Card style={StyleSheet.flatten([
      styles.goalCard,
      isCompleted && styles.completedCard,
      isMissed && styles.missedCard,
    ])}>
      <CardContent style={styles.cardContent}>
        {/* Left side - Checkbox and content */}
        <View style={styles.leftSide}>
          <TouchableOpacity 
            style={[
              styles.checkbox,
              isCompleted && styles.checkedBox,
              isMissed && styles.missedBox,
            ]}
            onPress={() => !isMissed && onToggleComplete(goal.id)}
            disabled={isMissed}
          >
            {isCompleted && (
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            )}
            {isMissed && (
              <Ionicons name="close" size={16} color="#FFFFFF" />
            )}
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={styles.titleRow}>
              <Text style={[
                styles.title,
                isCompleted && styles.completedTitle,
                isMissed && styles.missedTitle,
              ]}>
                {goal.title}
              </Text>
              
              {/* Category indicator */}
              <View 
                style={[
                  styles.categoryIndicator, 
                  { backgroundColor: categoryColor }
                ]} 
              />
            </View>

            {goal.description && (
              <Text style={[
                styles.description,
                isCompleted && styles.completedText,
                isMissed && styles.missedText,
              ]}>
                {goal.description}
              </Text>
            )}

            {goal.timeSlot && (
              <Text style={[
                styles.timeSlot,
                isCompleted && styles.completedText,
                isMissed && styles.missedText,
              ]}>
                ⏰ {goal.timeSlot}
              </Text>
            )}

            {isMissed && goal.missed && (
              <Text style={styles.missedReason}>
                Gemist: {goal.missed.reason}
              </Text>
            )}
          </View>
        </View>

        {/* Right side - Action buttons */}
        <View style={styles.rightSide}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onEdit(goal)}
          >
            <Ionicons name="pencil" size={16} color="#6B7280" />
          </TouchableOpacity>

          {!isCompleted && !isMissed && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleMarkAsMissed}
            >
              <Ionicons name="close-circle" size={16} color="#EF4444" />
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleDelete}
          >
            <Ionicons name="trash" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </CardContent>

      <MissGoalModal
        visible={showMissModal}
        goalTitle={goal.title}
        onConfirm={handleMissConfirm}
        onCancel={() => setShowMissModal(false)}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  goalCard: {
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#E5E7EB',
  },
  completedCard: {
    borderLeftColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  missedCard: {
    borderLeftColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  cardContent: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  leftSide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  missedBox: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  missedTitle: {
    color: '#6B7280',
  },
  categoryIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  timeSlot: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  completedText: {
    color: '#9CA3AF',
  },
  missedText: {
    color: '#B91C1C',
  },
  missedReason: {
    fontSize: 12,
    color: '#EF4444',
    fontStyle: 'italic',
    marginTop: 4,
  },
  rightSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F9FAFB',
  },
});
