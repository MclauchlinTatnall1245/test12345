import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import TimeService from '../../lib/time-service';

interface EveningReflectionCTAProps {
  totalGoals: number;
  completedGoals: number;
  forceSubtleMode?: boolean; // Forceer de component om zich overdag te gedragen
  onStartReflection?: () => void;
  onViewReflection?: () => void;
  onPlanNextDay?: () => void;
}

export function EveningReflectionCTA({ 
  totalGoals, 
  completedGoals, 
  forceSubtleMode = false,
  onStartReflection,
  onViewReflection,
  onPlanNextDay
}: EveningReflectionCTAProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [hasReflection, setHasReflection] = useState<boolean>(false);

  useEffect(() => {
    // Update tijd elke minuut
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // TODO: Check of er al een reflectie is voor vandaag
    // Dit kan later geïmplementeerd worden met AsyncStorage
    setHasReflection(false);

    return () => clearInterval(interval);
  }, [totalGoals, completedGoals]);

  // Gebruik TimeService voor alle tijd-logica (zoals origineel)
  const isReflectionTime = () => {
    return !forceSubtleMode && TimeService.isReflectionTime();
  };

  const isAlmostReflectionTime = () => {
    return !forceSubtleMode && TimeService.isAlmostReflectionTime();
  };

  const timeCategory = TimeService.getTimeCategory();
  const isReflectionTimeNow = isReflectionTime();
  const isAlmostReflectionTimeNow = isAlmostReflectionTime();
  
  // Bepaal urgentie levels op basis van tijd en forceSubtleMode
  const isVeryLate = !forceSubtleMode && timeCategory === 'night';
  const isLateNight = !forceSubtleMode && (timeCategory === 'night' || timeCategory === 'evening');

  // Bepaal de stijl en grootte van de CTA
  const getCTAStyle = () => {
    if (isVeryLate) {
      return {
        size: 'prominent',
        variant: 'primary',
        urgent: true
      };
    } else if (isLateNight) {
      return {
        size: 'large',
        variant: 'primary',
        urgent: true
      };
    } else if (isReflectionTimeNow) {
      return {
        size: 'large',
        variant: 'primary',
        urgent: false
      };
    } else if (isAlmostReflectionTimeNow) {
      return {
        size: 'default',
        variant: 'secondary',
        urgent: false
      };
    } else {
      return {
        size: 'small',
        variant: 'secondary',
        urgent: false
      };
    }
  };

  const style = getCTAStyle();

  // Toon component alleen als er doelen zijn of als het reflectie tijd is
  if (totalGoals === 0 && !isReflectionTimeNow && !isAlmostReflectionTimeNow && !forceSubtleMode) {
    return null;
  }

  const getPlanningButtonText = () => {
    if (isVeryLate) {
      return 'Plan vandaag';
    } else {
      return 'Plan morgen';
    }
  };

  const getTimeMessage = () => {
    const completionPercentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
    
    if (hasReflection) {
      return `Je hebt al gereflecteerd op vandaag (${completionPercentage}% voltooid). Je kunt je reflectie bekijken of bewerken.`;
    }
    
    if (isVeryLate) {
      return `Het is al laat! Reflecteer op je dag (${completionPercentage}% voltooid) voordat je gaat slapen.`;
    } else if (isLateNight) {
      return `Het wordt tijd om je dag af te sluiten. Je hebt ${completionPercentage}% van je doelen behaald.`;
    } else if (isReflectionTimeNow) {
      return `De avond is begonnen - reflecteer op je dag met ${completionPercentage}% voltooiing.`;
    } else if (isAlmostReflectionTimeNow) {
      return `De avond komt eraan - bereid je voor op reflectie (${completionPercentage}% voltooid).`;
    } else {
      return "Later vandaag kun je reflecteren op je dag.";
    }
  };

  const handleStartReflection = () => {
    if (onStartReflection) {
      onStartReflection();
    } else {
      Alert.alert(
        'Reflectie',
        'Reflectie functionaliteit wordt nog geïmplementeerd.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleViewReflection = () => {
    if (onViewReflection) {
      onViewReflection();
    } else {
      Alert.alert(
        'Reflectie',
        'Reflectie bekijken functionaliteit wordt nog geïmplementeerd.',
        [{ text: 'OK' }]
      );
    }
  };

  const handlePlanNextDay = () => {
    if (onPlanNextDay) {
      onPlanNextDay();
    } else {
      Alert.alert(
        'Planning',
        'Planning functionaliteit wordt nog geïmplementeerd.',
        [{ text: 'OK' }]
      );
    }
  };

  // Kleine discrete versie voor overdag
  if (!isReflectionTimeNow && !isAlmostReflectionTimeNow) {
    return (
      <Card style={styles.subtleCard}>
        <View style={styles.subtleContent}>
          <View style={styles.subtleLeft}>
            <View style={styles.subtleIcon}>
              <Ionicons name="moon" size={16} color="#8B5CF6" />
            </View>
            <View>
              <Text style={styles.subtleTitle}>Avond reflectie</Text>
              <Text style={styles.subtleMessage}>
                {hasReflection ? '✅ Reflectie opgeslagen' : getTimeMessage()}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.subtleButton}
            onPress={hasReflection ? handleViewReflection : handleStartReflection}
          >
            <Text style={styles.subtleButtonText}>
              {hasReflection ? 'Bekijken' : 'Later'}
            </Text>
            <Ionicons name="chevron-forward" size={12} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </Card>
    );
  }

  // Prominente versie voor de avond
  return (
    <Card style={StyleSheet.flatten([
      styles.prominentCard,
      style.urgent ? styles.urgentCard : styles.normalCard
    ])}>
      {/* Decoratieve elementen */}
      <View style={[styles.decorativeCircle, styles.decorativeCircleTop]} />
      <View style={[styles.decorativeCircle, styles.decorativeCircleBottom]} />
      
      <View style={[
        styles.prominentContent,
        style.size === 'prominent' ? styles.prominentContentLarge : styles.prominentContentNormal
      ]}>
        {/* Icoon */}
        <View style={[
          styles.iconContainer,
          style.urgent ? styles.iconContainerUrgent : styles.iconContainerNormal,
          style.size === 'prominent' ? styles.iconContainerLarge : styles.iconContainerDefault
        ]}>
          <Ionicons 
            name="moon" 
            size={style.size === 'prominent' ? 40 : 32} 
            color={style.urgent ? "#FCD34D" : "#FFFFFF"} 
          />
        </View>

        {/* Titel */}
        <Text style={[
          styles.title,
          style.urgent ? styles.titleUrgent : styles.titleNormal,
          style.size === 'prominent' ? styles.titleLarge : styles.titleDefault
        ]}>
          {hasReflection 
            ? (style.urgent ? '🌙 Reflectie opgeslagen!' : '🌅 Dag afgerond') 
            : (style.urgent ? '🌙 Tijd voor reflectie!' : '🌅 Sluit je dag af')
          }
        </Text>

        {/* Bericht */}
        <Text style={[
          styles.message,
          style.urgent ? styles.messageUrgent : styles.messageNormal
        ]}>
          {getTimeMessage()}
        </Text>

        {/* Tijd indicator */}
        <View style={[
          styles.timeIndicator,
          style.urgent ? styles.timeIndicatorUrgent : styles.timeIndicatorNormal
        ]}>
          <Ionicons name="time" size={16} color={style.urgent ? "#CBD5E1" : "#8B5CF6"} />
          <Text style={[
            styles.timeText,
            style.urgent ? styles.timeTextUrgent : styles.timeTextNormal
          ]}>
            {currentTime.toLocaleTimeString('nl-NL', { 
              hour: '2-digit', 
              minute: '2-digit'
            })}
          </Text>
        </View>

        {/* CTA Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title={hasReflection 
              ? (style.urgent ? 'Reflectie bekijken' : 'Bekijk reflectie')
              : (style.urgent ? 'Nu reflecteren' : 'Start reflectie')
            }
            onPress={hasReflection ? handleViewReflection : handleStartReflection}
            style={StyleSheet.flatten([
              styles.primaryButton,
              style.urgent ? styles.primaryButtonUrgent : styles.primaryButtonNormal,
              style.size === 'prominent' ? styles.buttonLarge : styles.buttonDefault
            ])}
            textStyle={StyleSheet.flatten([
              styles.primaryButtonText,
              style.urgent ? styles.primaryButtonTextUrgent : styles.primaryButtonTextNormal
            ])}
          />
          
          <Button
            title={getPlanningButtonText()}
            onPress={handlePlanNextDay}
            style={StyleSheet.flatten([
              styles.secondaryButton,
              style.urgent ? styles.secondaryButtonUrgent : styles.secondaryButtonNormal,
              style.size === 'prominent' ? styles.buttonLarge : styles.buttonDefault
            ])}
            textStyle={StyleSheet.flatten([
              styles.secondaryButtonText,
              style.urgent ? styles.secondaryButtonTextUrgent : styles.secondaryButtonTextNormal
            ])}
          />
        </View>

        {/* Extra motivatie voor late uren */}
        {style.urgent && (
          <View style={styles.motivationContainer}>
            <Text style={styles.motivationText}>
              💤 Een goede reflectie helpt je beter te slapen en morgen sterker te starten!
            </Text>
          </View>
        )}

        {/* Progress indicator voor avond */}
        {(isReflectionTimeNow || isAlmostReflectionTimeNow) && totalGoals > 0 && (
          <View style={[
            styles.progressContainer,
            style.urgent ? styles.progressContainerUrgent : styles.progressContainerNormal
          ]}>
            <View style={styles.progressRow}>
              <View style={styles.progressItem}>
                <Ionicons 
                  name="checkmark-circle" 
                  size={16} 
                  color={style.urgent ? "#CBD5E1" : "#8B5CF6"} 
                />
                <Text style={[
                  styles.progressText,
                  style.urgent ? styles.progressTextUrgent : styles.progressTextNormal
                ]}>
                  {completedGoals} voltooid
                </Text>
              </View>
              <View style={styles.progressItem}>
                <Ionicons 
                  name="time" 
                  size={16} 
                  color={style.urgent ? "#CBD5E1" : "#8B5CF6"} 
                />
                <Text style={[
                  styles.progressText,
                  style.urgent ? styles.progressTextUrgent : styles.progressTextNormal
                ]}>
                  {totalGoals - completedGoals} te gaan
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  // Subtle card styles
  subtleCard: {
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderWidth: 1,
  },
  subtleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  subtleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subtleIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#F3E8FF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  subtleTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 2,
  },
  subtleMessage: {
    fontSize: 12,
    color: '#6B7280',
  },
  subtleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  subtleButtonText: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 4,
  },

  // Prominent card styles
  prominentCard: {
    position: 'relative',
    overflow: 'hidden',
  },
  urgentCard: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  normalCard: {
    backgroundColor: '#FEFCE8',
    borderColor: '#DDD6FE',
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorativeCircleTop: {
    width: 128,
    height: 128,
    top: -64,
    right: -64,
  },
  decorativeCircleBottom: {
    width: 96,
    height: 96,
    bottom: -48,
    left: -48,
  },
  prominentContent: {
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  prominentContentLarge: {
    padding: 32,
  },
  prominentContentNormal: {
    padding: 24,
  },

  // Icon styles
  iconContainer: {
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconContainerUrgent: {
    backgroundColor: 'rgba(252, 211, 77, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.3)',
  },
  iconContainerNormal: {
    backgroundColor: '#8B5CF6',
  },
  iconContainerLarge: {
    width: 80,
    height: 80,
  },
  iconContainerDefault: {
    width: 64,
    height: 64,
  },

  // Title styles
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  titleUrgent: {
    color: '#FFFFFF',
  },
  titleNormal: {
    color: '#8B5CF6',
  },
  titleLarge: {
    fontSize: 24,
  },
  titleDefault: {
    fontSize: 20,
  },

  // Message styles
  message: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    maxWidth: 300,
  },
  messageUrgent: {
    color: '#CBD5E1',
  },
  messageNormal: {
    color: '#6B7280',
  },

  // Time indicator styles
  timeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  timeIndicatorUrgent: {
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    borderWidth: 1,
    borderColor: '#475569',
  },
  timeIndicatorNormal: {
    backgroundColor: '#F3E8FF',
  },
  timeText: {
    fontSize: 14,
    marginLeft: 8,
  },
  timeTextUrgent: {
    color: '#CBD5E1',
  },
  timeTextNormal: {
    color: '#8B5CF6',
  },

  // Button styles
  buttonContainer: {
    gap: 12,
    width: '100%',
    maxWidth: 300,
  },
  primaryButton: {
    paddingVertical: 14,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButtonUrgent: {
    backgroundColor: '#FCD34D',
    borderWidth: 2,
    borderColor: '#FCD34D',
  },
  primaryButtonNormal: {
    backgroundColor: '#8B5CF6',
  },
  primaryButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  primaryButtonTextUrgent: {
    color: '#0F172A',
  },
  primaryButtonTextNormal: {
    color: '#FFFFFF',
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
  },
  secondaryButtonUrgent: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
  },
  secondaryButtonNormal: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDD6FE',
  },
  secondaryButtonText: {
    fontWeight: '500',
    fontSize: 16,
  },
  secondaryButtonTextUrgent: {
    color: '#CBD5E1',
  },
  secondaryButtonTextNormal: {
    color: '#8B5CF6',
  },
  buttonLarge: {
    paddingVertical: 16,
  },
  buttonDefault: {
    paddingVertical: 14,
  },

  // Motivation styles
  motivationContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
  },
  motivationText: {
    fontSize: 14,
    color: '#CBD5E1',
    textAlign: 'center',
  },

  // Progress styles
  progressContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  progressContainerUrgent: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderColor: '#475569',
  },
  progressContainerNormal: {
    backgroundColor: '#F8FAFC',
    borderColor: '#DDD6FE',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    marginLeft: 4,
  },
  progressTextUrgent: {
    color: '#CBD5E1',
  },
  progressTextNormal: {
    color: '#8B5CF6',
  },
});
