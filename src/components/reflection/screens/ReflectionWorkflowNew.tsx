import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Goal, GoalReflection } from '../../../types';
import { Card, CardContent } from '../../ui/Card';

// Reason types for missed goals - exact match with original
const MISSED_GOAL_REASONS = {
  no_time: 'Geen tijd gehad',
  forgot: 'Vergeten',
  other_priorities: 'Andere prioriteiten',
  too_difficult: 'Te moeilijk/uitdagend',
  not_motivated: 'Niet gemotiveerd',
  external_factors: 'Externe factoren',
  other: 'Anders',
} as const;

type MissedGoalReason = keyof typeof MISSED_GOAL_REASONS;

interface ReflectionWorkflowProps {
  today: string;
  todayGoals: Goal[];
  goalReflections: Record<string, GoalReflection>;
  currentGoalIndex: number;
  onCurrentGoalIndexChange: (index: number) => void;
  onGoalReflectionUpdate: (goalId: string, reflection: GoalReflection) => void;
  onSaveReflection: () => Promise<void>;
  onBackToStart: () => void;
  // New props for overall feeling and notes
  overallFeeling?: 1 | 2 | 3 | 4 | 5;
  generalNotes?: string;
  onOverallFeelingChange?: (feeling: 1 | 2 | 3 | 4 | 5) => void;
  onGeneralNotesChange?: (notes: string) => void;
}

export function ReflectionWorkflow({
  today,
  todayGoals,
  goalReflections,
  currentGoalIndex,
  onCurrentGoalIndexChange,
  onGoalReflectionUpdate,
  onSaveReflection,
  onBackToStart,
  overallFeeling,
  generalNotes,
  onOverallFeelingChange,
  onGeneralNotesChange,
}: ReflectionWorkflowProps) {
  const [feedback, setFeedback] = useState('');
  const [selectedReason, setSelectedReason] = useState<MissedGoalReason | null>(null);
  const [customReason, setCustomReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showOverallReflection, setShowOverallReflection] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Vandaag';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Gisteren';
    } else {
      return date.toLocaleDateString('nl-NL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    }
  };

  const currentGoal = todayGoals[currentGoalIndex];
  const currentReflection = goalReflections[currentGoal?.id];

  const handleCompletionChange = (completed: boolean) => {
    if (!currentGoal) return;

    const updatedReflection: GoalReflection = {
      goalId: currentGoal.id,
      completed,
      feedback: currentReflection?.feedback || '',
      reason: completed ? undefined : currentReflection?.reason,
    };

    onGoalReflectionUpdate(currentGoal.id, updatedReflection);
  };

  const handleFeedbackChange = (text: string) => {
    setFeedback(text);
    if (!currentGoal) return;

    const updatedReflection: GoalReflection = {
      goalId: currentGoal.id,
      completed: currentReflection?.completed || false,
      feedback: text,
      reason: currentReflection?.reason,
    };

    onGoalReflectionUpdate(currentGoal.id, updatedReflection);
  };

  const handleReasonChange = (reasonType: MissedGoalReason, customText?: string) => {
    setSelectedReason(reasonType);
    if (reasonType === 'other') {
      setCustomReason(customText || '');
    }
    
    if (!currentGoal) return;

    const finalReason = reasonType === 'other' ? customText || '' : MISSED_GOAL_REASONS[reasonType];
    const updatedReflection: GoalReflection = {
      goalId: currentGoal.id,
      completed: currentReflection?.completed || false,
      feedback: currentReflection?.feedback || '',
      reason: finalReason,
    };

    onGoalReflectionUpdate(currentGoal.id, updatedReflection);
  };

  const goToNextGoal = () => {
    if (currentGoalIndex < todayGoals.length - 1) {
      const nextIndex = currentGoalIndex + 1;
      onCurrentGoalIndexChange(nextIndex);
      const nextReflection = goalReflections[todayGoals[nextIndex]?.id];
      setFeedback(nextReflection?.feedback || '');
      
      // Set reason state based on reflection
      if (nextReflection?.reason) {
        const reasonKey = Object.entries(MISSED_GOAL_REASONS).find(([_, value]) => value === nextReflection.reason)?.[0] as MissedGoalReason;
        if (reasonKey) {
          setSelectedReason(reasonKey);
          if (reasonKey === 'other') {
            setCustomReason(nextReflection.reason);
          }
        }
      } else {
        setSelectedReason(null);
        setCustomReason('');
      }
    } else {
      // Show overall reflection at the end
      setShowOverallReflection(true);
    }
  };

  const goToPreviousGoal = () => {
    if (showOverallReflection) {
      setShowOverallReflection(false);
      return;
    }
    
    if (currentGoalIndex > 0) {
      const prevIndex = currentGoalIndex - 1;
      onCurrentGoalIndexChange(prevIndex);
      const prevReflection = goalReflections[todayGoals[prevIndex]?.id];
      setFeedback(prevReflection?.feedback || '');
      
      // Set reason state based on reflection
      if (prevReflection?.reason) {
        const reasonKey = Object.entries(MISSED_GOAL_REASONS).find(([_, value]) => value === prevReflection.reason)?.[0] as MissedGoalReason;
        if (reasonKey) {
          setSelectedReason(reasonKey);
          if (reasonKey === 'other') {
            setCustomReason(prevReflection.reason);
          }
        }
      } else {
        setSelectedReason(null);
        setCustomReason('');
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveReflection();
    } finally {
      setIsSaving(false);
    }
  };

  const isLastGoal = currentGoalIndex === todayGoals.length - 1;
  const isFirstGoal = currentGoalIndex === 0;

  const getCategoryInfo = (category: string) => {
    const categoryMap = {
      health: { icon: '🏃‍♂️', label: 'Gezondheid & Fitness', color: '#059669' },
      productivity: { icon: '💼', label: 'Werk & Productiviteit', color: '#2563EB' },
      personal_development: { icon: '🌱', label: 'Persoonlijke Ontwikkeling', color: '#8B5CF6' },
      social: { icon: '👥', label: 'Sociaal & Relaties', color: '#EC4899' },
      household: { icon: '🏠', label: 'Huishouden & Wonen', color: '#F59E0B' },
      practical: { icon: '📋', label: 'Praktisch & Regelen', color: '#6B7280' },
      entertainment: { icon: '🎮', label: 'Ontspanning & Hobby\'s', color: '#10B981' },
      finance: { icon: '💰', label: 'Financieel', color: '#DC2626' },
      shopping: { icon: '🛒', label: 'Shopping & Aankopen', color: '#7C3AED' },
      other: { icon: '📝', label: 'Anders', color: '#64748B' }
    };
    return categoryMap[category as keyof typeof categoryMap] || categoryMap.other;
  };

  // Overall Reflection Screen (after all goals)
  if (showOverallReflection) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Modern Hero */}
        <View style={styles.heroContainer}>
          <View style={styles.heroHeader}>
            <View style={styles.heroIconContainer}>
              <LinearGradient
                colors={['#8B5CF6', '#A855F7']}
                style={styles.iconGradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
              >
                <Ionicons name="heart-outline" size={24} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>Laatste Stap</Text>
              <Text style={styles.heroSubtitle}>Algemene reflectie op je dag</Text>
            </View>
          </View>
        </View>

        {/* Overall Feeling Card */}
        <Card style={styles.card}>
          <CardContent style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Ionicons name="happy-outline" size={24} color="#8B5CF6" />
              <Text style={styles.cardTitle}>Hoe voel je je vandaag?</Text>
            </View>
            
            <View style={styles.feelingContainer}>
              {[1, 2, 3, 4, 5].map((feeling) => (
                <TouchableOpacity
                  key={feeling}
                  onPress={() => onOverallFeelingChange?.(feeling as 1 | 2 | 3 | 4 | 5)}
                  style={[
                    styles.feelingButton,
                    overallFeeling === feeling && styles.feelingButtonActive
                  ]}
                >
                  <Text style={styles.feelingEmoji}>
                    {feeling === 1 && '😢'}
                    {feeling === 2 && '😕'}
                    {feeling === 3 && '😐'}
                    {feeling === 4 && '😊'}
                    {feeling === 5 && '🤩'}
                  </Text>
                  <Text style={[
                    styles.feelingLabel,
                    overallFeeling === feeling && styles.feelingLabelActive
                  ]}>
                    {feeling === 1 && 'Slecht'}
                    {feeling === 2 && 'Niet goed'}
                    {feeling === 3 && 'Oké'}
                    {feeling === 4 && 'Goed'}
                    {feeling === 5 && 'Geweldig'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </CardContent>
        </Card>

        {/* General Notes Card */}
        <Card style={styles.card}>
          <CardContent style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Ionicons name="create-outline" size={24} color="#8B5CF6" />
              <Text style={styles.cardTitle}>Extra gedachten of notities</Text>
            </View>
            <Text style={styles.cardDescription}>
              Is er nog iets wat je wilt noteren over je dag?
            </Text>
            
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="Bijv. wat je hebt geleerd, plannen voor morgen, bijzondere gebeurtenissen..."
              value={generalNotes || ''}
              onChangeText={(text) => onGeneralNotesChange?.(text)}
              placeholderTextColor="#9CA3AF"
            />
          </CardContent>
        </Card>

        {/* Navigation */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity style={styles.secondaryButton} onPress={goToPreviousGoal}>
            <View style={styles.secondaryButtonContent}>
              <Ionicons name="arrow-back" size={20} color="#667eea" />
              <Text style={styles.secondaryButtonText}>Terug naar doelen</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.primaryButton, isSaving && styles.primaryButtonDisabled]} 
            onPress={handleSave}
            disabled={isSaving}
          >
            <LinearGradient
              colors={isSaving ? ['#9CA3AF', '#6B7280'] : ['#22C55E', '#16A34A']}
              style={styles.buttonGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
            >
              {isSaving ? (
                <Ionicons name="hourglass-outline" size={20} color="#FFFFFF" />
              ) : (
                <Ionicons name="checkmark-outline" size={20} color="#FFFFFF" />
              )}
              <Text style={styles.primaryButtonText}>
                {isSaving ? 'Opslaan...' : 'Reflectie opslaan'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Back to start */}
        <TouchableOpacity style={styles.backButton} onPress={onBackToStart}>
          <Ionicons name="home-outline" size={20} color="#667eea" />
          <Text style={styles.backButtonText}>Terug naar start</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    );
  }

  if (!currentGoal) {
    return (
      <View style={styles.container}>
        <Card style={styles.errorCard}>
          <CardContent style={styles.cardContent}>
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
            <Text style={styles.errorTitle}>Geen doelen gevonden</Text>
            <Text style={styles.errorMessage}>
              Er zijn geen doelen om te reflecteren.
            </Text>
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
          </CardContent>
        </Card>
      </View>
    );
  }

  const categoryInfo = getCategoryInfo(currentGoal.category);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Progress */}
      <View style={styles.heroContainer}>
        <View style={styles.heroHeader}>
          <View style={styles.heroIconContainer}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.iconGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
            >
              <Ionicons name="chatbubble-outline" size={24} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>Reflectie {formatDate(today)}</Text>
            <Text style={styles.heroSubtitle}>
              Doel {currentGoalIndex + 1} van {todayGoals.length}
            </Text>
          </View>
        </View>
        
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={[styles.progressFill, { width: `${((currentGoalIndex + 1) / todayGoals.length) * 100}%` }]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
            />
          </View>
        </View>
      </View>

      {/* Current Goal Card */}
      <Card style={styles.card}>
        <CardContent style={styles.cardContent}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle}>{currentGoal.title}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryEmoji}>{categoryInfo.icon}</Text>
              <Text style={[styles.categoryLabel, { color: categoryInfo.color }]}>
                {categoryInfo.label}
              </Text>
            </View>
          </View>
          
          {currentGoal.description && (
            <Text style={styles.goalDescription}>{currentGoal.description}</Text>
          )}
        </CardContent>
      </Card>

      {/* Completion Status */}
      <Card style={styles.card}>
        <CardContent style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#059669" />
            <Text style={styles.cardTitle}>Heb je dit doel behaald?</Text>
          </View>

          <View style={styles.completionButtons}>
            <TouchableOpacity
              onPress={() => handleCompletionChange(true)}
              style={[
                styles.completionButton,
                currentReflection?.completed && styles.completionButtonSuccess
              ]}
            >
              <Ionicons 
                name="checkmark-circle" 
                size={24} 
                color={currentReflection?.completed ? '#FFFFFF' : '#059669'} 
              />
              <Text style={[
                styles.completionButtonText,
                currentReflection?.completed && styles.completionButtonTextActive
              ]}>
                Ja, behaald
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleCompletionChange(false)}
              style={[
                styles.completionButton,
                currentReflection?.completed === false && styles.completionButtonError
              ]}
            >
              <Ionicons 
                name="close-circle" 
                size={24} 
                color={currentReflection?.completed === false ? '#FFFFFF' : '#EF4444'} 
              />
              <Text style={[
                styles.completionButtonText,
                currentReflection?.completed === false && styles.completionButtonTextActive
              ]}>
                Nee, niet behaald
              </Text>
            </TouchableOpacity>
          </View>
        </CardContent>
      </Card>

      {/* Feedback */}
      <Card style={styles.card}>
        <CardContent style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Ionicons name="chatbubbles-outline" size={24} color="#8B5CF6" />
            <Text style={styles.cardTitle}>
              {currentReflection?.completed ? 'Hoe ging het?' : 'Wat ging er goed/minder goed?'}
            </Text>
          </View>
          <Text style={styles.cardDescription}>
            Deel je ervaringen, wat je hebt geleerd, of hoe je je voelde.
          </Text>
          
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Typ hier je reflectie..."
            value={currentReflection?.feedback || ''}
            onChangeText={handleFeedbackChange}
            placeholderTextColor="#9CA3AF"
          />
        </CardContent>
      </Card>

      {/* Reason for not completing (only if not completed) */}
      {currentReflection?.completed === false && (
        <Card style={styles.card}>
          <CardContent style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Ionicons name="help-circle-outline" size={24} color="#F59E0B" />
              <Text style={styles.cardTitle}>Waarom werd dit doel niet behaald?</Text>
            </View>
            <Text style={styles.cardDescription}>
              Selecteer de reden die het beste past:
            </Text>
            
            <View style={styles.reasonsContainer}>
              {Object.entries(MISSED_GOAL_REASONS).map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => handleReasonChange(key as MissedGoalReason)}
                  style={[
                    styles.reasonButton,
                    selectedReason === key && styles.reasonButtonActive
                  ]}
                >
                  <View style={[
                    styles.radioButton,
                    selectedReason === key && styles.radioButtonActive
                  ]}>
                    {selectedReason === key && <View style={styles.radioButtonInner} />}
                  </View>
                  <Text style={[
                    styles.reasonText,
                    selectedReason === key && styles.reasonTextActive
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom reason input if "Anders" is selected */}
            {selectedReason === 'other' && (
              <TextInput
                style={[styles.textInput, { marginTop: 16 }]}
                multiline
                placeholder="Beschrijf de reden..."
                value={customReason}
                onChangeText={(text) => {
                  setCustomReason(text);
                  handleReasonChange('other', text);
                }}
                placeholderTextColor="#9CA3AF"
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={[styles.secondaryButton, isFirstGoal && styles.buttonDisabled]} 
          onPress={goToPreviousGoal}
          disabled={isFirstGoal}
        >
          <View style={styles.secondaryButtonContent}>
            <Ionicons name="arrow-back" size={20} color={isFirstGoal ? "#9CA3AF" : "#667eea"} />
            <Text style={[styles.secondaryButtonText, isFirstGoal && styles.buttonTextDisabled]}>
              Vorige
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.progressIndicator}>
          <Text style={styles.progressText}>{currentGoalIndex + 1} / {todayGoals.length}</Text>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={goToNextGoal}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.buttonGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
          >
            <Text style={styles.primaryButtonText}>
              {!isLastGoal ? 'Volgende' : 'Algemene reflectie'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Back to start */}
      <TouchableOpacity style={styles.backButton} onPress={onBackToStart}>
        <Ionicons name="home-outline" size={20} color="#667eea" />
        <Text style={styles.backButtonText}>Terug naar start</Text>
      </TouchableOpacity>

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

  // Progress Bar
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(203, 213, 225, 0.5)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
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
    marginBottom: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.3,
  },
  cardDescription: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 20,
    fontWeight: '500',
  },

  // Goal Header
  goalHeader: {
    marginBottom: 16,
  },
  goalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  goalDescription: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
    marginTop: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.5)',
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Completion Buttons
  completionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  completionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    borderWidth: 2,
    borderColor: 'rgba(203, 213, 225, 0.5)',
    gap: 8,
  },
  completionButtonSuccess: {
    backgroundColor: '#059669',
    borderColor: '#047857',
  },
  completionButtonError: {
    backgroundColor: '#EF4444',
    borderColor: '#DC2626',
  },
  completionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  completionButtonTextActive: {
    color: '#FFFFFF',
  },

  // Text Input
  textInput: {
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.8)',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: 'rgba(248, 250, 252, 0.5)',
    color: '#1e293b',
    lineHeight: 24,
  },

  // Feeling Container
  feelingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  feelingButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'transparent',
    minWidth: 60,
  },
  feelingButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  feelingEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  feelingLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
  feelingLabelActive: {
    color: '#8B5CF6',
    fontWeight: '700',
  },

  // Reasons
  reasonsContainer: {
    gap: 12,
  },
  reasonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.5)',
  },
  reasonButtonActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderColor: '#2563EB',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonActive: {
    borderColor: '#2563EB',
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  reasonText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
    flex: 1,
  },
  reasonTextActive: {
    color: '#2563EB',
    fontWeight: '600',
  },

  // Navigation
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 24,
    marginBottom: 20,
    gap: 16,
  },
  progressIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.5)',
  },
  progressText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },

  // Buttons
  primaryButton: {
    borderRadius: 16,
    shadowColor: 'rgba(102, 126, 234, 0.4)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
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
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonTextDisabled: {
    color: '#9CA3AF',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    marginBottom: 16,
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

  // Error state
  errorCard: {
    margin: 24,
    marginTop: 100,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },

  bottomPadding: {
    height: 120,
  },
});
