import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Reflection } from '../../../types';
import { Card, CardContent } from '../../ui/Card';
import { HistoryView } from './HistoryView';
import TimeService from '../../../lib/time-service';

interface NoGoalsScreenProps {
  today: string;
  onBackToStart: () => void;
  // History props
  allReflections: Reflection[];
  selectedHistoryReflection: Reflection | null;
  onSelectHistoryReflection: (reflection: Reflection | null) => void;
}

export function NoGoalsScreen({
  today,
  onBackToStart,
  allReflections,
  selectedHistoryReflection,
  onSelectHistoryReflection,
}: NoGoalsScreenProps) {
  const [showHistory, setShowHistory] = useState(false);

  if (showHistory) {
    return (
      <View style={styles.container}>
        <HistoryView
          allReflections={allReflections}
          selectedHistoryReflection={selectedHistoryReflection}
          onSelectReflection={onSelectHistoryReflection}
        />
        <View style={styles.historyBackContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => setShowHistory(false)}>
            <Ionicons name="arrow-back" size={20} color="#667eea" />
            <Text style={styles.backButtonText}>Terug naar reflectie</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // No goals for today - show main screen with history button
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Modern Hero */}
      <View style={styles.heroContainer}>
        <View style={styles.heroHeader}>
          <View style={styles.heroIconContainer}>
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              style={styles.iconGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
            >
              <Ionicons name="calendar-outline" size={24} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>Geen Doelen</Text>
            <Text style={styles.heroSubtitle}>{TimeService.formatRelativeDate(today)}</Text>
          </View>
        </View>
      </View>

      {/* Main Message Card */}
      <Card style={styles.mainCard}>
        <CardContent style={styles.cardContent}>
          <View style={styles.messageHeader}>
            <Ionicons name="information-circle-outline" size={32} color="#F59E0B" />
            <Text style={styles.messageTitle}>
              Geen doelen gepland voor {TimeService.formatRelativeDate(today)}
            </Text>
          </View>
          
          <Text style={styles.messageDescription}>
            Er zijn geen doelen gepland voor vandaag. Plan eerst wat doelen om te kunnen reflecteren op je dag.
          </Text>

          <View style={styles.suggestionsContainer}>
            <View style={styles.suggestionItem}>
              <Ionicons name="bulb-outline" size={20} color="#8B5CF6" />
              <Text style={styles.suggestionText}>
                Ga naar de "Vandaag" tab om doelen toe te voegen
              </Text>
            </View>
            <View style={styles.suggestionItem}>
              <Ionicons name="calendar-outline" size={20} color="#8B5CF6" />
              <Text style={styles.suggestionText}>
                Of plan doelen voor morgen in de "Planning" tab
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={onBackToStart}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.buttonGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
          >
            <Ionicons name="home-outline" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Terug naar start</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        {allReflections && allReflections.length > 0 && (
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowHistory(true)}>
            <View style={styles.secondaryButtonContent}>
              <Ionicons name="time-outline" size={20} color="#667eea" />
              <Text style={styles.secondaryButtonText}>Bekijk eerdere reflecties</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Empty History State */}
      {(!allReflections || allReflections.length === 0) && (
        <Card style={styles.emptyCard}>
          <CardContent style={styles.emptyContent}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="library-outline" size={48} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>Nog geen reflecties</Text>
            <Text style={styles.emptyDescription}>
              Je hebt nog geen eerdere reflecties. Start met het plannen van doelen en kom terug voor je eerste reflectie.
            </Text>
          </CardContent>
        </Card>
      )}

      {/* Tips Card */}
      <Card style={styles.tipsCard}>
        <CardContent style={styles.tipsContent}>
          <LinearGradient
            colors={['rgba(99, 102, 241, 0.1)', 'rgba(168, 85, 247, 0.05)']}
            style={styles.tipsGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
          >
            <Ionicons name="bulb-outline" size={24} color="#8B5CF6" />
            <View style={styles.tipsTextContainer}>
              <Text style={styles.tipsTitle}>Tip voor morgen</Text>
              <Text style={styles.tipsText}>
                Plan 2-5 concrete doelen voor een productieve dag. Kleine doelen zijn beter dan geen doelen!
              </Text>
            </View>
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
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 18,
    shadowColor: 'rgba(245, 158, 11, 0.2)',
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
    shadowColor: 'rgba(245, 158, 11, 0.3)',
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
    shadowColor: 'rgba(245, 158, 11, 0.4)',
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

  // Main Card
  mainCard: {
    marginHorizontal: 24,
    marginBottom: 28,
    borderRadius: 24,
    shadowColor: 'rgba(245, 158, 11, 0.15)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  cardContent: {
    padding: 32,
  },
  messageHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  messageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginTop: 12,
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  messageDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
    fontWeight: '500',
  },
  suggestionsContainer: {
    gap: 16,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.5)',
    gap: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
    lineHeight: 22,
  },

  // Buttons
  buttonsContainer: {
    marginHorizontal: 24,
    marginBottom: 20,
    gap: 16,
  },
  primaryButton: {
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

  // Empty State
  emptyCard: {
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 20,
    shadowColor: 'rgba(156, 163, 175, 0.15)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  emptyContent: {
    padding: 32,
    alignItems: 'center',
  },
  emptyIconContainer: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },

  // Tips Card
  tipsCard: {
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 20,
    shadowColor: 'rgba(139, 92, 246, 0.2)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  tipsContent: {
    padding: 0,
  },
  tipsGradient: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 24,
    borderRadius: 20,
    gap: 16,
  },
  tipsTextContainer: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7C3AED',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  tipsText: {
    fontSize: 15,
    color: '#6B46C1',
    lineHeight: 22,
    fontWeight: '500',
  },

  // History Back
  historyBackContainer: {
    padding: 16,
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

  bottomPadding: {
    height: 120,
  },
});
