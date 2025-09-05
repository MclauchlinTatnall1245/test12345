import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Reflection } from '../../../types';
import { Card, CardContent } from '../../ui/Card';
import TimeService from '../../../lib/time-service';

interface CompletionScreenProps {
  today: string;
  savedReflection: Reflection;
  onBackToStart: () => void;
  onEditReflection: () => void;
  onPlanTomorrow?: () => void; // New prop for navigation to planning
}

export function CompletionScreen({
  today,
  savedReflection,
  onBackToStart,
  onEditReflection,
  onPlanTomorrow,
}: CompletionScreenProps) {
  const getMotivationalMessage = (completionRate: number) => {
    if (completionRate >= 90) {
      return {
        emoji: '🎉',
        title: 'Fantastisch!',
        message: 'Je hebt bijna al je doelen behaald. Dit is echt geweldig!',
        colors: ['#22C55E', '#16A34A'] as const
      };
    } else if (completionRate >= 70) {
      return {
        emoji: '🌟',
        title: 'Geweldig gedaan!',
        message: 'Je hebt de meeste van je doelen behaald. Blijf zo doorgaan!',
        colors: ['#8B5CF6', '#7C3AED'] as const
      };
    } else if (completionRate >= 50) {
      return {
        emoji: '👍',
        title: 'Goed bezig!',
        message: 'Je hebt meer dan de helft van je doelen behaald. Elke stap telt!',
        colors: ['#3B82F6', '#2563EB'] as const
      };
    } else if (completionRate >= 25) {
      return {
        emoji: '💪',
        title: 'Blijf volhouden!',
        message: 'Je hebt een aantal doelen behaald. Morgen kun je het nog beter doen!',
        colors: ['#F59E0B', '#D97706'] as const
      };
    } else {
      return {
        emoji: '🌱',
        title: 'Nieuwe kansen!',
        message: 'Elke dag is een nieuwe kans om te groeien. Je kunt dit!',
        colors: ['#10B981', '#059669'] as const
      };
    }
  };

  const motivation = getMotivationalMessage(savedReflection.completionPercentage);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Success Hero Banner */}
      <View style={styles.heroContainer}>
        <LinearGradient
          colors={motivation.colors}
          style={styles.heroGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroEmoji}>{motivation.emoji}</Text>
            <Text style={styles.heroTitle}>{motivation.title}</Text>
            <Text style={styles.heroMessage}>{motivation.message}</Text>
            
            <View style={styles.completionBadge}>
              <Text style={styles.completionLabel}>Reflectie voltooid voor {TimeService.formatRelativeDate(today)}</Text>
              <Text style={styles.completionPercentage}>{savedReflection.completionPercentage}% behaald</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <LinearGradient
            colors={['rgba(34, 197, 94, 0.15)', 'rgba(34, 197, 94, 0.05)']}
            style={styles.statGradientBg}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
          />
          <View style={styles.statContent}>
            <View style={[styles.statIconContainer, { backgroundColor: '#DCFCE7' }]}> 
              <Ionicons name="checkmark" size={18} color="#16A34A" />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statValue}>{savedReflection.completedGoals}</Text>
              <Text style={styles.statLabel}>Behaalde doelen</Text>
            </View>
          </View>
        </View>

        <View style={styles.statCard}>
          <LinearGradient
            colors={['rgba(239, 68, 68, 0.15)', 'rgba(239, 68, 68, 0.05)']}
            style={styles.statGradientBg}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
          />
          <View style={styles.statContent}>
            <View style={[styles.statIconContainer, { backgroundColor: '#FEE2E2' }]}> 
              <Ionicons name="close" size={18} color="#DC2626" />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statValue}>{savedReflection.totalGoals - savedReflection.completedGoals}</Text>
              <Text style={styles.statLabel}>Gemiste doelen</Text>
            </View>
          </View>
        </View>

        <View style={styles.statCard}>
          <LinearGradient
            colors={['rgba(59, 130, 246, 0.15)', 'rgba(59, 130, 246, 0.05)']}
            style={styles.statGradientBg}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
          />
          <View style={styles.statContent}>
            <View style={[styles.statIconContainer, { backgroundColor: '#DBEAFE' }]}> 
              <Ionicons name="list" size={18} color="#2563EB" />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statValue}>{savedReflection.totalGoals}</Text>
              <Text style={styles.statLabel}>Totaal doelen</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Progress Bar Card */}
      <Card style={styles.card}>
        <CardContent style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Ionicons name="analytics-outline" size={24} color="#8B5CF6" />
            <Text style={styles.cardTitle}>Voortgang van vandaag</Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={motivation.colors}
                style={[styles.progressFill, { width: `${savedReflection.completionPercentage}%` }]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
              />
            </View>
            <Text style={styles.progressText}>
              {savedReflection.completionPercentage}% van je doelen behaald
            </Text>
          </View>
        </CardContent>
      </Card>

      {/* Goal Feedback Summary */}
      {savedReflection.goalFeedback && Object.keys(savedReflection.goalFeedback).length > 0 && (
        <Card style={styles.card}>
          <CardContent style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Ionicons name="chatbubbles-outline" size={24} color="#8B5CF6" />
              <Text style={styles.cardTitle}>Je reflecties</Text>
            </View>
            
            <View style={styles.reflectionsContainer}>
              {Object.entries(savedReflection.goalFeedback).map(([goalId, feedback], index) => (
                <View key={goalId} style={styles.reflectionItem}>
                  <View style={[
                    styles.reflectionIndicator,
                    { backgroundColor: index < savedReflection.completedGoals ? '#22C55E' : '#EF4444' }
                  ]} />
                  <View style={styles.reflectionContent}>
                    <Text style={styles.reflectionTitle}>Doel {index + 1}</Text>
                    <Text style={styles.reflectionText}>"{feedback}"</Text>
                  </View>
                </View>
              ))}
            </View>
          </CardContent>
        </Card>
      )}

      {/* Missed Goals */}
      {savedReflection.missedGoals && Object.keys(savedReflection.missedGoals).length > 0 && (
        <Card style={styles.card}>
          <CardContent style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Ionicons name="alert-circle-outline" size={24} color="#EF4444" />
              <Text style={styles.cardTitle}>Redenen voor gemiste doelen</Text>
            </View>
            
            <View style={styles.missedGoalsContainer}>
              {Object.entries(savedReflection.missedGoals).map(([goalId, reason], index) => (
                <View key={goalId} style={styles.missedGoalItem}>
                  <Ionicons name="close-circle" size={16} color="#EF4444" />
                  <Text style={styles.missedGoalText}>{reason}</Text>
                </View>
              ))}
            </View>
          </CardContent>
        </Card>
      )}

      {/* Feeling */}
      {savedReflection.overallFeeling && (
        <Card style={styles.card}>
          <CardContent style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Ionicons name="happy-outline" size={24} color="#8B5CF6" />
              <Text style={styles.cardTitle}>Hoe voel je je?</Text>
            </View>
            
            <View style={styles.feelingContainer}>
              <Text style={styles.feelingEmoji}>
                {savedReflection.overallFeeling === 1 && '😢'}
                {savedReflection.overallFeeling === 2 && '😕'}
                {savedReflection.overallFeeling === 3 && '😐'}
                {savedReflection.overallFeeling === 4 && '😊'}
                {savedReflection.overallFeeling === 5 && '🤩'}
              </Text>
              <Text style={styles.feelingText}>
                {savedReflection.overallFeeling === 1 && 'Slecht'}
                {savedReflection.overallFeeling === 2 && 'Niet zo goed'}
                {savedReflection.overallFeeling === 3 && 'Oké'}
                {savedReflection.overallFeeling === 4 && 'Goed'}
                {savedReflection.overallFeeling === 5 && 'Fantastisch'}
              </Text>
            </View>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {savedReflection.notes && (
        <Card style={styles.card}>
          <CardContent style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Ionicons name="document-text-outline" size={24} color="#8B5CF6" />
              <Text style={styles.cardTitle}>Extra notities</Text>
            </View>
            <View style={styles.notesContainer}>
              <Text style={styles.notesText}>"{savedReflection.notes}"</Text>
            </View>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        {/* Plan Tomorrow Button - Prominent placement */}
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={onPlanTomorrow || (() => alert('Ga naar de "Planning" tab onderaan je scherm om morgen te plannen! 📋'))}
        >
          <LinearGradient
            colors={['#22C55E', '#16A34A']}
            style={styles.buttonGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
          >
            <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Plan morgen</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={onEditReflection}>
          <View style={styles.secondaryButtonContent}>
            <Ionicons name="create-outline" size={20} color="#667eea" />
            <Text style={styles.secondaryButtonText}>Bewerk reflectie</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.backButton} onPress={onBackToStart}>
          <Ionicons name="home-outline" size={20} color="#667eea" />
          <Text style={styles.backButtonText}>Terug naar start</Text>
        </TouchableOpacity>
      </View>

      {/* Motivational Quote */}
      <Card style={styles.quoteCard}>
        <CardContent style={styles.quoteContent}>
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.1)', 'rgba(5, 150, 105, 0.05)']}
            style={styles.quoteGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
          >
            <Ionicons name="chatbubble-outline" size={24} color="#10B981" />
            <Text style={styles.quoteText}>
              Elke dag is een nieuwe kans om beter te worden dan gisteren. 
              Je reflectie van vandaag helpt je morgen sterker te staan.
            </Text>
          </LinearGradient>
        </CardContent>
      </Card>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // Hero Section
  heroContainer: {
    marginHorizontal: 24,
    marginTop: 12,
    marginBottom: 28,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: 'rgba(99, 102, 241, 0.3)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 12,
  },
  heroGradient: {
    padding: 32,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heroMessage: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 26,
    fontWeight: '500',
  },
  completionBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  completionLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
    fontWeight: '600',
  },
  completionPercentage: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },

  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 28,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: 'rgba(99, 102, 241, 0.15)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    minHeight: 80,
    position: 'relative',
    overflow: 'hidden',
  },
  statGradientBg: {
    position: 'absolute',
    top: -25,
    right: -20,
    width: 70,
    height: 70,
    borderRadius: 35,
    zIndex: 0,
  },
  statContent: {
    alignItems: 'center',
    width: '100%',
    position: 'relative',
    zIndex: 1,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  statTextContainer: {
    alignItems: 'center',
    width: '100%',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
    letterSpacing: -1,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
  },

  // Cards
  card: {
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 20,
    shadowColor: 'rgba(99, 102, 241, 0.15)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  cardContent: {
    padding: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.3,
  },

  // Progress
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(203, 213, 225, 0.4)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Reflections
  reflectionsContainer: {
    gap: 16,
  },
  reflectionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.5)',
  },
  reflectionIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
    minHeight: 40,
  },
  reflectionContent: {
    flex: 1,
  },
  reflectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
  },
  reflectionText: {
    fontSize: 15,
    color: '#64748b',
    fontStyle: 'italic',
    lineHeight: 22,
  },

  // Missed Goals
  missedGoalsContainer: {
    gap: 12,
  },
  missedGoalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(254, 242, 242, 0.8)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    gap: 8,
  },
  missedGoalText: {
    fontSize: 14,
    color: '#DC2626',
    flex: 1,
    fontWeight: '500',
  },

  // Feeling
  feelingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(248, 250, 252, 0.6)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.5)',
    gap: 16,
  },
  feelingEmoji: {
    fontSize: 48,
  },
  feelingText: {
    fontSize: 18,
    color: '#1e293b',
    fontWeight: '600',
  },

  // Notes
  notesContainer: {
    backgroundColor: 'rgba(248, 250, 252, 0.6)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.5)',
  },
  notesText: {
    fontSize: 16,
    color: '#64748b',
    fontStyle: 'italic',
    lineHeight: 24,
    textAlign: 'center',
  },

  // Buttons
  buttonsContainer: {
    marginHorizontal: 24,
    marginBottom: 20,
    gap: 16,
  },
  primaryButton: {
    borderRadius: 20,
    shadowColor: 'rgba(34, 197, 94, 0.4)',
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
  secondaryButton: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.3)',
    shadowColor: 'rgba(102, 126, 234, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  secondaryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
    letterSpacing: 0.2,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.2)',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },

  // Quote Card
  quoteCard: {
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 20,
    shadowColor: 'rgba(16, 185, 129, 0.2)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  quoteContent: {
    padding: 0,
  },
  quoteGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    gap: 16,
  },
  quoteText: {
    flex: 1,
    fontSize: 16,
    color: '#047857',
    fontStyle: 'italic',
    lineHeight: 24,
    fontWeight: '500',
  },

  bottomPadding: {
    height: 120,
  },
});
