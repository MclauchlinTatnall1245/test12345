import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../ui/Card';
import TimeService from '../../lib/time-service';
import { DataService } from '../../lib/data-service';

interface EveningReflectionCTAProps {
  totalGoals: number;
  completedGoals: number;
  onStartReflection?: () => void;
  onViewReflection?: () => void;
  onPlanNextDay?: () => void;
  refreshTrigger?: number;
  position?: 'top' | 'bottom'; // Nieuw: positie van de component
}

export function EveningReflectionCTA({ 
  totalGoals, 
  completedGoals, 
  onStartReflection,
  onViewReflection,
  onPlanNextDay,
  refreshTrigger,
  position = 'top'
}: EveningReflectionCTAProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [hasReflection, setHasReflection] = useState<boolean>(false);
  const [smartDate, setSmartDate] = useState<string>('');
  const [timeMessage, setTimeMessage] = useState<string>('');

  // Functie om de smart date te bepalen
  const determineSmartDate = async () => {
    try {
      const smartToday = await DataService.getSmartTodayDateAsync();
      setSmartDate(smartToday);
      
      // Debug info
      console.log('🔍 EveningReflectionCTA Smart Date:', {
        smartToday,
        currentRealDate: TimeService.getCurrentDate(),
        currentHour: TimeService.getCurrentHour(),
        isNightMode: TimeService.isNightMode()
      });
      
      return smartToday;
    } catch (error) {
      console.log('Error determining smart date:', error);
      const fallback = TimeService.getCurrentDate();
      setSmartDate(fallback);
      return fallback;
    }
  };

  // Functie om reflectie status te checken
  const checkReflection = async () => {
    try {
      const dateToCheck = await determineSmartDate();
      const reflection = await DataService.getReflection(dateToCheck);
      setHasReflection(!!reflection);
    } catch (error) {
      console.log('Error checking reflection:', error);
      setHasReflection(false);
    }
  };

  // Functie om het tijd-message te bepalen
  const updateTimeMessage = async () => {
    // Als we de smart date nog niet hebben, gebruik fallback
    if (!smartDate) {
      setTimeMessage("Doelen aan het laden...");
      return;
    }

    if (hasReflection) {
      const completionPercentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
      setTimeMessage(`Je hebt al gereflecteerd op vandaag (${completionPercentage}% voltooid).`);
      return;
    }
    
    const completionPercentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
    
    // Early morning (0-6): subtiele boodschap
    const isEarlyMorning = timeCategory === 'night' && currentTime.getHours() >= 0 && currentTime.getHours() < 6;
    
    if (isEarlyMorning) {
      setTimeMessage("De nieuwe dag is begonnen. Vanavond kun je weer reflecteren.");
    } else if (timeCategory === 'night') {
      setTimeMessage(`Het is al laat! Reflecteer op je dag (${completionPercentage}% voltooid) voordat je gaat slapen.`);
    } else if (timeCategory === 'evening') {
      setTimeMessage(`Het wordt tijd om je dag af te sluiten. Je hebt ${completionPercentage}% van je doelen behaald.`);
    } else if (isReflectionTime) {
      setTimeMessage(`De avond is begonnen - reflecteer op je dag met ${completionPercentage}% voltooiing.`);
    } else if (isAlmostReflectionTime) {
      setTimeMessage(`De avond komt eraan - bereid je voor op reflectie (${completionPercentage}% voltooid).`);
    } else {
      setTimeMessage("Later vandaag kun je reflecteren op je dag.");
    }
  };

  useEffect(() => {
    // Update tijd elke minuut
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Check reflectie status en update message bij component mount
    checkReflection().then(() => {
      updateTimeMessage();
    });

    return () => clearInterval(interval);
  }, [totalGoals, completedGoals]);

  // Effect om reflectie status en message te vernieuwen als refreshTrigger verandert
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      checkReflection().then(() => {
        updateTimeMessage();
      });
    }
  }, [refreshTrigger]);

  // Effect om message te updaten als doelen of smartDate verandert
  useEffect(() => {
    if (smartDate) {
      updateTimeMessage();
    }
  }, [totalGoals, completedGoals, smartDate, hasReflection]);

  const isReflectionTime = TimeService.isReflectionTime();
  const isAlmostReflectionTime = TimeService.isAlmostReflectionTime();
  const timeCategory = TimeService.getTimeCategory();
  
  // Bepaal of we de prominente (avond) of subtiele (overdag) versie moeten tonen
  const isEarlyMorning = timeCategory === 'night' && currentTime.getHours() >= 0 && currentTime.getHours() < 6;
  
  // Als het early morning is (0-6), altijd subtiele versie tonen
  // Anders normale logica: prominent als het avond/nacht is EN er geen reflectie is
  const showProminentVersion = !isEarlyMorning && (isReflectionTime || isAlmostReflectionTime || timeCategory === 'evening' || timeCategory === 'night') && !hasReflection;
  
  const completionPercentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

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

  // Toon niet als er geen doelen zijn en het niet reflectie tijd is
  if (totalGoals === 0 && !showProminentVersion) {
    return null;
  }

  // Als position 'bottom' is en we willen prominent tonen, return null (wordt later in bottom gerenderd)
  if (position === 'bottom' && showProminentVersion) {
    return null;
  }

  // Als position 'top' is en we willen subtiel tonen, return null (wordt later in bottom gerenderd)  
  if (position === 'top' && !showProminentVersion) {
    return null;
  }

  // SUBTIELE VERSIE - Overdag (minder zichtbaar, onderaan)
  if (!showProminentVersion) {
    return (
      <View style={styles.subtleContainer}>
        <Card style={styles.subtleCard}>
          <View style={styles.subtleContent}>
            <View style={styles.subtleIconContainer}>
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.15)', 'rgba(139, 92, 246, 0.05)']}
                style={styles.subtleIconGradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
              >
                <Ionicons name="moon-outline" size={18} color="#8B5CF6" />
              </LinearGradient>
            </View>
            <View style={styles.subtleTextContainer}>
              <Text style={styles.subtleTitle}>Avond reflectie</Text>
              <Text style={styles.subtleMessage}>
                {hasReflection ? 'Reflectie opgeslagen' : timeMessage}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.subtleButton}
              onPress={hasReflection ? handleViewReflection : handleStartReflection}
            >
              <Text style={styles.subtleButtonText}>
                {hasReflection ? 'Bekijk' : 'Later'}
              </Text>
              <Ionicons name="chevron-forward" size={14} color="#8B5CF6" />
            </TouchableOpacity>
          </View>
        </Card>
      </View>
    );
  }

  // PROMINENTE VERSIE - Avond (meer zichtbaar, boven aan)
  return (
    <View style={styles.prominentContainer}>
      <Card style={StyleSheet.flatten([
        styles.prominentCard,
        styles.eveningCard
      ])}>
        {/* Decoratieve gradient achtergrond */}
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.05)', 'rgba(168, 85, 247, 0.02)']}
          style={styles.prominentGradientBg}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
        />
        
        {/* Decoratieve cirkels */}
        <View style={[
          styles.decorativeCircle, 
          styles.decorativeCircleTop,
          { backgroundColor: 'rgba(139, 92, 246, 0.1)' }
        ]} />
        <View style={[
          styles.decorativeCircle, 
          styles.decorativeCircleBottom,
          { backgroundColor: 'rgba(168, 85, 247, 0.08)' }
        ]} />

        <View style={styles.prominentContent}>
          {/* Header met icoon */}
          <View style={styles.prominentHeader}>
            <View style={[
              styles.prominentIconContainer,
              styles.eveningIconContainer
            ]}>
              <LinearGradient
                colors={['#8B5CF6', '#A855F7']}
                style={styles.prominentIconGradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
              >
                <Ionicons 
                  name={timeCategory === 'night' ? "moon" : "partly-sunny"} 
                  size={28} 
                  color="#FFFFFF" 
                />
              </LinearGradient>
            </View>
            <View style={styles.prominentTextHeader}>
              <Text style={[
                styles.prominentTitle,
                { color: '#1e293b' }
              ]}>
                {hasReflection 
                  ? 'Dag afgesloten' 
                  : (timeCategory === 'night' ? 'Tijd voor reflectie!' : 'Sluit je dag af')
                }
              </Text>
              <View style={styles.timeIndicator}>
                <Ionicons 
                  name="time-outline" 
                  size={14} 
                  color="#8B5CF6" 
                />
                <Text style={[
                  styles.timeText,
                  { color: '#8B5CF6' }
                ]}>
                  {currentTime.toLocaleTimeString('nl-NL', { 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            </View>
          </View>

          {/* Message */}
          <Text style={[
            styles.prominentMessage,
            { color: '#64748b' }
          ]}>
            {timeMessage}
          </Text>

          {/* Progress indicator */}
          {totalGoals > 0 && (
            <View style={[
              styles.progressContainer,
              styles.eveningProgressContainer
            ]}>
              <View style={styles.progressRow}>
                <View style={styles.progressItem}>
                  <Ionicons 
                    name="checkmark-circle" 
                    size={16} 
                    color="#059669" 
                  />
                  <Text style={[
                    styles.progressText,
                    { color: '#64748b' }
                  ]}>
                    {completedGoals} voltooid
                  </Text>
                </View>
                <View style={styles.progressItem}>
                  <Ionicons 
                    name="list-outline" 
                    size={16} 
                    color="#EA580C" 
                  />
                  <Text style={[
                    styles.progressText,
                    { color: '#64748b' }
                  ]}>
                    {totalGoals - completedGoals} te gaan
                  </Text>
                </View>
              </View>
              <Text style={[
                styles.progressPercentage,
                { color: '#1e293b' }
              ]}>
                {completionPercentage}% voltooid
              </Text>
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                styles.eveningPrimaryButton
              ]}
              onPress={hasReflection ? handleViewReflection : handleStartReflection}
            >
              <LinearGradient
                colors={['#8B5CF6', '#A855F7']}
                style={styles.primaryButtonGradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
              >
                <Ionicons 
                  name={hasReflection ? "eye-outline" : "create-outline"} 
                  size={20} 
                  color="#FFFFFF" 
                />
                <Text style={styles.primaryButtonText}>
                  {hasReflection 
                    ? 'Bekijk reflectie'
                    : (timeCategory === 'night' ? 'Nu reflecteren' : 'Start reflectie')
                  }
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                styles.eveningSecondaryButton
              ]}
              onPress={handlePlanNextDay}
            >
              <Ionicons 
                name="calendar-outline" 
                size={18} 
                color="#8B5CF6" 
              />
              <Text style={[
                styles.secondaryButtonText,
                { color: '#8B5CF6' }
              ]}>
                {currentTime.getHours() >= 0 && currentTime.getHours() < 6 ? 'Plan vandaag' : 'Plan morgen'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Extra motivatie voor late uren */}
          {timeCategory === 'night' && !hasReflection && (
            <View style={styles.motivationContainer}>
              <Text style={styles.motivationText}>
                Een goede reflectie helpt je beter te slapen en morgen sterker te starten!
              </Text>
            </View>
          )}
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  // SUBTIELE VERSIE - Overdag
  subtleContainer: {
    marginBottom: 12,
  },
  subtleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderStyle: 'solid',
    shadowColor: 'rgba(139, 92, 246, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  subtleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  subtleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
  },
  subtleIconGradient: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtleTextContainer: {
    flex: 1,
  },
  subtleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  subtleMessage: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  subtleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    gap: 4,
  },
  subtleButtonText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },

  // PROMINENTE VERSIE - Avond  
  prominentContainer: {
    marginBottom: 24,
  },
  prominentCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: 'rgba(139, 92, 246, 0.2)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  eveningCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  nightCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderColor: 'rgba(51, 65, 85, 0.8)',
  },
  prominentGradientBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 100,
  },
  decorativeCircleTop: {
    width: 120,
    height: 120,
    top: -60,
    right: -60,
  },
  decorativeCircleBottom: {
    width: 80,
    height: 80,
    bottom: -40,
    left: -40,
  },
  prominentContent: {
    position: 'relative',
    zIndex: 1,
    padding: 28,
  },
  prominentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  prominentIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },
  eveningIconContainer: {
    // Extra shadow for evening version
  },
  nightIconContainer: {
    shadowColor: 'rgba(252, 211, 77, 0.4)',
  },
  prominentIconGradient: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prominentTextHeader: {
    flex: 1,
  },
  prominentTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  timeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  prominentMessage: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    marginBottom: 20,
    maxWidth: '95%',
  },
  progressContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  eveningProgressContainer: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  nightProgressContainer: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderColor: 'rgba(71, 85, 105, 0.8)',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  eveningPrimaryButton: {
    shadowColor: 'rgba(139, 92, 246, 0.4)',
  },
  nightPrimaryButton: {
    shadowColor: 'rgba(252, 211, 77, 0.4)',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 10,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  eveningSecondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  nightSecondaryButton: {
    backgroundColor: 'rgba(55, 65, 81, 0.8)',
    borderColor: 'rgba(75, 85, 99, 0.8)',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  motivationContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  motivationText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
  },
});
