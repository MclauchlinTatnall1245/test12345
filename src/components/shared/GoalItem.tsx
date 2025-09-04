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
import { GOAL_CATEGORY_LABELS, SUBCATEGORY_LABELS } from '../../lib/category-system';
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

// Helper function om category label te krijgen
const getCategoryLabel = (category: string, subcategory?: string): string => {
  // Als er een subcategorie is, toon die
  if (subcategory && SUBCATEGORY_LABELS[subcategory]) {
    return SUBCATEGORY_LABELS[subcategory];
  }
  
  // Anders toon de hoofdcategorie
  return GOAL_CATEGORY_LABELS[category as keyof typeof GOAL_CATEGORY_LABELS] || 'Overig';
};

export function GoalItem({ 
  goal, 
  onToggleComplete, 
  onEdit, 
  onDelete, 
  onMarkAsMissed 
}: GoalItemProps) {
  const [showMissModal, setShowMissModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
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
    setShowMenu(false);
  };

  const handleMarkAsMissed = () => {
    setShowMissModal(true);
    setShowMenu(false);
  };

  const handleEdit = () => {
    onEdit(goal);
    setShowMenu(false);
  };

  const handleMissConfirm = (reason: MissedReason, notes?: string) => {
    onMarkAsMissed(goal.id, reason, notes);
    setShowMissModal(false);
  };

  return (
    <View style={[
      styles.goalContainer,
    ]}>
      {/* Modern Goal Card - Hele card is nu klikbaar */}
      <TouchableOpacity 
        style={[
          styles.goalCard,
          isCompleted && {
            backgroundColor: '#F0FDF4', // Licht groene achtergrond
            borderColor: '#BBF7D0', // Groene border
            shadowColor: '#10B981', // Groene gloed
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 4,
          },
          isMissed && {
            backgroundColor: '#FEF2F2', // Licht rode achtergrond
            borderColor: '#FECACA', // Rode border
            shadowColor: '#EF4444', // Rode gloed
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 4,
          }
        ]}
        onPress={() => !isMissed && onToggleComplete(goal.id)}
        disabled={isMissed}
        activeOpacity={0.7}
      >
        {/* Category Header Row */}
        <View style={styles.categoryRow}>
          <Text style={[styles.categoryText, { color: categoryColor }]}>
            {getCategoryLabel(goal.category, goal.subcategory).toUpperCase()}
          </Text>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={(e) => {
              e.stopPropagation(); // Voorkom dat de card toggle wordt getriggerd
              setShowMenu(!showMenu);
            }}
          >
            <Ionicons name="ellipsis-horizontal" size={18} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.contentRow}>
          {/* Checkbox - Nu alleen visueel, geen onPress meer */}
          <View 
            style={[
              styles.checkbox,
              isCompleted && styles.checkedBox,
              isMissed && styles.missedBox,
            ]}
          >
            {isCompleted && (
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            )}
            {isMissed && (
              <Ionicons name="close" size={14} color="#FFFFFF" />
            )}
          </View>

          {/* Content Section */}
          <View style={styles.contentSection}>
            <Text style={[
              styles.title,
              isCompleted && styles.completedTitle,
              isMissed && styles.missedTitle,
            ]}>
              {goal.title}
            </Text>

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
              <View style={styles.timeContainer}>
                <Ionicons 
                  name="time-outline" 
                  size={14} 
                  color={isCompleted || isMissed ? '#718096' : '#4A5568'} 
                />
                <Text style={[
                  styles.timeText,
                  isCompleted && styles.completedText,
                  isMissed && styles.missedText,
                ]}>
                  {goal.timeSlot}
                </Text>
              </View>
            )}

            {isMissed && goal.missed && (
              <View style={styles.missedInfoContainer}>
                <Ionicons name="information-circle-outline" size={12} color="#EF4444" />
                <Text style={styles.missedReason}>
                  {goal.missed.reason}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Menu */}
        {showMenu && (
          <View style={styles.actionMenu}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
            >
              <Ionicons name="pencil" size={16} color="#3B82F6" />
              <Text style={[styles.menuItemText, { color: '#3B82F6' }]}>
                Aanpassen
              </Text>
            </TouchableOpacity>

            {!isCompleted && !isMissed && (
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={(e) => {
                  e.stopPropagation();
                  handleMarkAsMissed();
                }}
              >
                <Ionicons name="close-circle" size={16} color="#EF4444" />
                <Text style={[styles.menuItemText, { color: '#EF4444' }]}>
                  Niet gehaald
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
            >
              <Ionicons name="trash" size={16} color="#EF4444" />
              <Text style={[styles.menuItemText, { color: '#EF4444' }]}>
                Verwijderen
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>

      <MissGoalModal
        visible={showMissModal}
        goalTitle={goal.title}
        onConfirm={handleMissConfirm}
        onCancel={() => setShowMissModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Modern Container
  goalContainer: {
    marginBottom: 12,
  },
  completedContainer: {
    // Geen opacity meer, we gebruiken gloed
  },
  missedContainer: {
    // Geen opacity meer, we gebruiken gloed
  },

  // Modern Goal Card
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F4F8', // Zachter dan grijs
  },

  // Category Header Row
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  menuButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7FAFC', // Warmer achtergrond
  },

  // Content Row
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  // Modern Checkbox
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    marginRight: 12,
    marginTop: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkedBox: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  missedBox: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },

  // Content Section
  contentSection: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C', // Warmer zwart
    lineHeight: 20,
    marginBottom: 4,
  },
  completedTitle: {
    color: '#4A5568', // Warmer grijs
  },
  missedTitle: {
    color: '#4A5568', // Warmer grijs
  },

  // Description
  description: {
    fontSize: 14,
    color: '#4A5568', // Warmer grijs
    marginBottom: 6,
    lineHeight: 18,
  },
  completedText: {
    color: '#718096', // Warmer grijs voor completed
  },
  missedText: {
    color: '#B91C1C',
  },

  // Time Container
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 13,
    color: '#4A5568', // Warmer grijs
    fontWeight: '500',
  },

  // Missed Info Container
  missedInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  missedReason: {
    fontSize: 12,
    color: '#EF4444',
    fontStyle: 'italic',
    marginLeft: 4,
  },

  // Action Menu
  actionMenu: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F7FAFC', // Warmer achtergrond
    gap: 8,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
