import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, CardContent } from '../../ui/Card';
import Button from '../../ui/Button';
import { Goal, Reflection } from '../../../types';

interface StartScreenProps {
  today: string;
  todayGoals: Goal[];
  onStartReflection: () => void;
  onShowHistory: () => void;
  isCompleted?: boolean;
  savedReflection?: Reflection | null;
}

export function StartScreen({ 
  today, 
  todayGoals, 
  onStartReflection, 
  onShowHistory,
  isCompleted = false,
  savedReflection
}: StartScreenProps) {
  // Format de datum voor weergave
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const currentDate = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check of het vandaag is
    if (date.toDateString() === currentDate.toDateString()) {
      return {
        main: 'Vandaag',
        detail: date.toLocaleDateString('nl-NL', {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        })
      };
    }
    
    // Check of het gisteren is
    if (date.toDateString() === yesterday.toDateString()) {
      return {
        main: 'Gisteren',
        detail: date.toLocaleDateString('nl-NL', {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        })
      };
    }
    
    // Anders toon de datum
    const fullDate = date.toLocaleDateString('nl-NL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return {
      main: fullDate,
      detail: null
    };
  };

  const formattedDate = formatDate(today);
  const isToday = formattedDate.main === 'Vandaag';
  
  // Calculate stats for completed reflection
  const completedGoals = savedReflection ? 
    Object.keys(savedReflection.goalFeedback || {}).length - Object.keys(savedReflection.missedGoals || {}).length : 0;
  const successRate = savedReflection && todayGoals.length > 0 ? 
    Math.round((completedGoals / todayGoals.length) * 100) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isCompleted ? 'Reflectie Overzicht' : (isToday ? 'Avond Reflectie' : 'Reflectie')}
        </Text>
        <Text style={styles.subtitle}>
          {isCompleted
            ? `Je hebt je reflectie voor ${formattedDate.main.toLowerCase()}${formattedDate.detail ? ` (${formattedDate.detail})` : ''} al voltooid`
            : (isToday 
              ? 'Tijd om je dag te reflecteren en van je ervaringen te leren'
              : `Bekijk je reflectie van ${formattedDate.main.toLowerCase()}${formattedDate.detail ? ` (${formattedDate.detail})` : ''}`
            )
          }
        </Text>
      </View>

      <Card style={styles.mainCard}>
        <CardContent style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <View style={[
              styles.iconCircle,
              { backgroundColor: isCompleted ? '#F0FDF4' : '#EFF6FF' }
            ]}>
              <Ionicons 
                name={isCompleted ? "checkmark-circle" : "checkmark-circle"} 
                size={32} 
                color={isCompleted ? '#16A34A' : '#2563EB'} 
              />
            </View>
          </View>

          <Text style={styles.cardTitle}>
            Reflectie voor {formattedDate.main}
          </Text>
          {formattedDate.detail && (
            <Text style={styles.cardSubtitle}>
              {formattedDate.detail}
            </Text>
          )}

          <Text style={styles.statsText}>
            {isCompleted ? (
              `${completedGoals} van ${todayGoals.length} doelen behaald (${successRate}% success rate)`
            ) : (
              todayGoals.length > 0 
                ? `Je hebt ${todayGoals.length} doel${todayGoals.length === 1 ? '' : 'en'} om te reflecteren`
                : 'Er zijn geen doelen voor deze dag'
            )}
          </Text>

          {todayGoals.length > 0 && (
            <View style={styles.goalsList}>
              <Text style={styles.goalsHeader}>Doelen voor reflectie:</Text>
              {todayGoals.map((goal, index) => (
                <View key={index} style={styles.goalItem}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  {goal.description && (
                    <Text style={styles.goalDescription}>{goal.description}</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          <View style={styles.buttonContainer}>
            {todayGoals.length > 0 ? (
              <Button
                title={isCompleted ? 'Bekijk Reflectie' : (isToday ? 'Start Reflectie' : 'Bekijk Reflectie')}
                onPress={onStartReflection}
                style={styles.primaryButton}
              />
            ) : (
              <Text style={styles.noGoalsText}>
                Geen doelen om te reflecteren
              </Text>
            )}
            
            <Button
              title="Bekijk Geschiedenis"
              variant="outline"
              onPress={onShowHistory}
              style={styles.secondaryButton}
            />
          </View>
        </CardContent>
      </Card>

      {isToday && !isCompleted && (
        <View style={styles.tipContainer}>
          <Text style={styles.tipText}>
            💡 Tip: Neem de tijd om eerlijk te reflecteren op je dag. Het helpt je om te groeien en beter te worden.
          </Text>
        </View>
      )}
      
      {isCompleted && (
        <View style={styles.tipContainer}>
          <Text style={styles.tipText}>
            ✨ Je reflectie is opgeslagen. Je kunt deze altijd bewerken of bekijken.
          </Text>
        </View>
      )}
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
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  mainCard: {
    marginBottom: 24,
  },
  cardContent: {
    padding: 32,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  goalsList: {
    width: '100%',
    marginBottom: 24,
  },
  goalsHeader: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  goalItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  noGoalsText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 16,
  },
  tipContainer: {
    alignItems: 'center',
  },
  tipText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
