import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardContent } from '../../ui/Card';
import { Reflection } from '../../../types';
import { DataService } from '../../../lib/data-service';

interface HistoryViewProps {
  allReflections: Reflection[];
  selectedHistoryReflection: Reflection | null;
  onSelectReflection: (reflection: Reflection | null) => void;
}

export function HistoryView({ 
  allReflections, 
  selectedHistoryReflection, 
  onSelectReflection 
}: HistoryViewProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Vandaag';
    }
    
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Gisteren';
    }
    
    return date.toLocaleDateString('nl-NL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const getSuccessColor = (percentage: number) => {
    if (percentage >= 80) return '#10B981'; // green
    if (percentage >= 50) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  if (allReflections.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Alle reflecties</Text>
          <Text style={styles.subtitle}>Bekijk al je reflecties en leer van je patronen</Text>
        </View>

        <Card style={styles.emptyCard}>
          <CardContent style={styles.emptyContent}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="clipboard-outline" size={48} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>Nog geen reflecties</Text>
            <Text style={styles.emptyText}>
              Je hebt nog geen reflecties gemaakt.
            </Text>
          </CardContent>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Alle reflecties</Text>
        <Text style={styles.subtitle}>Bekijk al je reflecties en leer van je patronen</Text>
      </View>

      <View style={styles.reflectionsList}>
        {allReflections.map((reflection) => (
          <TouchableOpacity
            key={reflection.id}
            onPress={() => onSelectReflection(
              selectedHistoryReflection?.id === reflection.id ? null : reflection
            )}
            style={styles.reflectionCard}
          >
            <Card style={
              selectedHistoryReflection?.id === reflection.id 
                ? { ...styles.card, ...styles.selectedCard }
                : styles.card
            }>
              <CardContent style={styles.cardContent}>
                <View style={styles.reflectionHeader}>
                  <View style={styles.reflectionHeaderLeft}>
                    <Text style={styles.reflectionDate}>
                      {formatDate(reflection.date)}
                    </Text>
                    <Text style={styles.reflectionStats}>
                      {reflection.totalGoals} doelen • {reflection.completedGoals} behaald
                    </Text>
                  </View>
                  <View style={styles.reflectionHeaderRight}>
                    <Text style={[
                      styles.successRate,
                      { color: getSuccessColor(reflection.completionPercentage) }
                    ]}>
                      {reflection.completionPercentage}%
                    </Text>
                    <Text style={styles.successLabel}>success rate</Text>
                  </View>
                </View>

                {selectedHistoryReflection?.id === reflection.id && (
                  <View style={styles.reflectionDetails}>
                    <View style={styles.detailsHeader}>
                      <Text style={styles.detailsTitle}>Doelen en feedback</Text>
                    </View>
                    
                    <View style={styles.goalsList}>
                      {Object.entries(reflection.goalFeedback).map(([goalId, feedback]) => {
                        const isCompleted = !reflection.missedGoals[goalId];
                        const missedReason = reflection.missedGoals[goalId];
                        
                        return (
                          <View 
                            key={goalId} 
                            style={[
                              styles.goalItem,
                              isCompleted ? styles.completedGoalItem : styles.missedGoalItem
                            ]}
                          >
                            <View style={styles.goalItemHeader}>
                              <View style={styles.goalStatusContainer}>
                                <View style={[
                                  styles.goalStatusDot,
                                  { backgroundColor: isCompleted ? '#10B981' : '#F97316' }
                                ]} />
                                <Text style={styles.goalIdText}>
                                  Doel {goalId.slice(-4)}
                                </Text>
                              </View>
                              {!isCompleted && missedReason && (
                                <Text style={styles.missedReasonText}>
                                  Reden: {missedReason}
                                </Text>
                              )}
                            </View>
                            {feedback && (
                              <Text style={styles.feedbackText}>
                                "{feedback}"
                              </Text>
                            )}
                          </View>
                        );
                      })}
                    </View>

                    {/* Overall feeling and notes */}
                    {(reflection.overallFeeling || reflection.notes) && (
                      <View style={styles.overallSection}>
                        {reflection.overallFeeling && (
                          <View style={styles.feelingContainer}>
                            <Text style={styles.feelingLabel}>Algemeen gevoel:</Text>
                            <Text style={styles.feelingValue}>
                              {reflection.overallFeeling}/5 ⭐
                            </Text>
                          </View>
                        )}
                        {reflection.notes && (
                          <View style={styles.notesContainer}>
                            <Text style={styles.notesLabel}>Notities:</Text>
                            <Text style={styles.notesText}>
                              {reflection.notes}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                    
                    <Text style={styles.collapseHint}>
                      Klik nogmaals om in te klappen
                    </Text>
                  </View>
                )}
              </CardContent>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
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
  emptyCard: {
    marginTop: 40,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#F3F4F6',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  reflectionsList: {
    gap: 16,
  },
  reflectionCard: {
    marginBottom: 0,
  },
  card: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedCard: {
    borderColor: '#8B5CF6',
    borderWidth: 2,
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContent: {
    padding: 20,
  },
  reflectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  reflectionHeaderLeft: {
    flex: 1,
  },
  reflectionDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  reflectionStats: {
    fontSize: 14,
    color: '#6B7280',
  },
  reflectionHeaderRight: {
    alignItems: 'flex-end',
  },
  successRate: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  successLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  reflectionDetails: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  detailsHeader: {
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  goalsList: {
    gap: 12,
    marginBottom: 16,
  },
  goalItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  completedGoalItem: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  missedGoalItem: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  goalItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalStatusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  goalIdText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  missedReasonText: {
    fontSize: 12,
    color: '#6B7280',
  },
  feedbackText: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
    marginLeft: 24,
  },
  overallSection: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  feelingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  feelingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginRight: 8,
  },
  feelingValue: {
    fontSize: 14,
    color: '#1F2937',
  },
  notesContainer: {
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  collapseHint: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
