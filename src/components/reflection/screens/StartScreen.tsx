import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, CardContent } from '../../ui/Card';
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
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Modern Subtiele Hero */}
      <View style={styles.heroContainer}>
        <View style={styles.heroHeader}>
          <View style={styles.heroIconContainer}>
            <LinearGradient
              colors={isCompleted ? ['#16A34A', '#22C55E'] : ['#667eea', '#764ba2']}
              style={styles.iconGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
            >
              <Ionicons 
                name={isCompleted ? "checkmark-circle-outline" : "moon-outline"} 
                size={24} 
                color="#FFFFFF" 
              />
            </LinearGradient>
          </View>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>
              {isCompleted ? 'Reflectie Voltooid' : (isToday ? 'Avond Reflectie' : 'Reflectie')}
            </Text>
            <Text style={styles.heroSubtitle}>
              {formattedDate.main} • {formattedDate.detail || new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })}
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
              <Text style={[styles.statValue, { color: '#2563EB' }]}>{todayGoals.length}</Text>
            </View>
          </View>
        </View>

        {isCompleted && (
          <>
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
                  <Text style={styles.statLabel}>Behaald</Text>
                  <Text style={[styles.statValue, { color: '#059669' }]}>{completedGoals}</Text>
                </View>
              </View>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['rgba(168, 85, 247, 0.15)', 'rgba(168, 85, 247, 0.05)']}
                style={styles.statGradientBg}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
              />
              <View style={styles.statContent}>
                <View style={[styles.statIconContainer, { backgroundColor: '#F3E8FF' }]}> 
                  <Ionicons name="trending-up" size={14} color="#A855F7" />
                </View>
                <View style={styles.statTextContainer}>
                  <Text style={styles.statLabel}>Succes</Text>
                  <Text style={[styles.statValue, { color: '#A855F7' }]}>{successRate}%</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </View>

      {/* Main Content Card */}
      <Card style={styles.mainCard}>
        <CardContent style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              {isCompleted 
                ? `Reflectie van ${formattedDate.main}` 
                : `Reflecteer op ${formattedDate.main}`
              }
            </Text>
            <Text style={styles.cardDescription}>
              {isCompleted
                ? `Je hebt succesvol gereflecteerd op je dag en ${successRate}% van je doelen behaald`
                : (isToday 
                  ? 'Tijd om je dag te reflecteren en van je ervaringen te leren'
                  : `Bekijk je reflectie en leer van deze dag`
                )
              }
            </Text>
          </View>

          {todayGoals.length > 0 && (
            <View style={styles.goalsList}>
              <View style={styles.goalsHeader}>
                <View style={styles.goalsHeaderTitle}>
                  <Ionicons name="list-outline" size={18} color="#1e293b" />
                  <Text style={styles.goalsHeaderText}>
                    Doelen voor reflectie ({todayGoals.length})
                  </Text>
                </View>
              </View>
              {todayGoals.slice(0, 3).map((goal, index) => (
                <View key={index} style={styles.goalItem}>
                  <View style={styles.goalIndicator}>
                    <Ionicons 
                      name={goal.completed ? "checkmark-circle" : "ellipse-outline"} 
                      size={16} 
                      color={goal.completed ? "#10B981" : "#6B7280"} 
                    />
                  </View>
                  <View style={styles.goalContent}>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    {goal.description && (
                      <Text style={styles.goalDescription}>{goal.description}</Text>
                    )}
                  </View>
                </View>
              ))}
              {todayGoals.length > 3 && (
                <Text style={styles.moreGoalsText}>
                  +{todayGoals.length - 3} meer {todayGoals.length - 3 === 1 ? 'doel' : 'doelen'}...
                </Text>
              )}
            </View>
          )}

          <View style={styles.buttonContainer}>
            {todayGoals.length > 0 ? (
              <TouchableOpacity style={styles.primaryButton} onPress={onStartReflection}>
                <LinearGradient
                  colors={isCompleted ? ['#16A34A', '#22C55E'] : ['#667eea', '#764ba2']}
                  style={styles.buttonGradient}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                >
                  <Ionicons 
                    name={isCompleted ? "eye-outline" : "play-outline"} 
                    size={20} 
                    color="#FFFFFF" 
                  />
                  <Text style={styles.primaryButtonText}>
                    {isCompleted ? 'Bekijk Reflectie' : (isToday ? 'Start Reflectie' : 'Bekijk Reflectie')}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.noGoalsContainer}>
                <Ionicons name="information-circle-outline" size={24} color="#6B7280" />
                <Text style={styles.noGoalsText}>
                  Geen doelen om te reflecteren
                </Text>
              </View>
            )}
            
            <TouchableOpacity style={styles.secondaryButton} onPress={onShowHistory}>
              <View style={styles.secondaryButtonContent}>
                <Ionicons name="time-outline" size={20} color="#667eea" />
                <Text style={styles.secondaryButtonText}>Bekijk Geschiedenis</Text>
              </View>
            </TouchableOpacity>
          </View>
        </CardContent>
      </Card>

      {/* Tip Container */}
      {isToday && !isCompleted && (
        <View style={styles.tipContainer}>
          <LinearGradient
            colors={['rgba(99, 102, 241, 0.1)', 'rgba(168, 85, 247, 0.05)']}
            style={styles.tipGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
          >
            <Ionicons name="bulb-outline" size={20} color="#8B5CF6" />
            <Text style={styles.tipText}>
              Neem de tijd om eerlijk te reflecteren op je dag. Het helpt je om te groeien en beter te worden.
            </Text>
          </LinearGradient>
        </View>
      )}
      
      {isCompleted && (
        <View style={styles.tipContainer}>
          <LinearGradient
            colors={['rgba(5, 150, 105, 0.1)', 'rgba(16, 185, 129, 0.05)']}
            style={styles.tipGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
            <Text style={styles.tipText}>
              Je reflectie is opgeslagen. Je kunt deze altijd bewerken of bekijken.
            </Text>
          </LinearGradient>
        </View>
      )}

      {/* Bottom padding for tab bar */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Moderne neutrale achtergrond
  },
  content: {
    paddingBottom: 32,
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

  // Main Card
  mainCard: {
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
  cardContent: {
    padding: 32,
  },
  cardHeader: {
    marginBottom: 28,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  cardDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },

  // Goals List
  goalsList: {
    marginBottom: 32,
  },
  goalsHeader: {
    marginBottom: 20,
  },
  goalsHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  goalsHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.3,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: 'rgba(99, 102, 241, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  goalIndicator: {
    marginRight: 12,
    marginTop: 2,
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
    lineHeight: 22,
  },
  goalDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  moreGoalsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },

  // Buttons
  buttonContainer: {
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
  noGoalsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(107, 114, 128, 0.2)',
    gap: 12,
  },
  noGoalsText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },

  // Tip Container
  tipContainer: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  tipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: 'rgba(99, 102, 241, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    fontWeight: '500',
  },

  bottomPadding: {
    height: 120,
  },
});
