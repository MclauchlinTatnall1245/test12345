import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Goal, GoalReflection } from '../../../types';
import { Card } from '../../ui/Card';
import Button from '../../ui/Button';

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

  // Overall Reflection Screen (after all goals)
  if (showOverallReflection) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <View style={{ padding: 20 }}>
          {/* Header */}
          <Card style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 5 }}>
              Laatste stap: Algemene reflectie
            </Text>
            <Text style={{ fontSize: 16, color: '#666' }}>
              Hoe voel je je over je dag in het algemeen?
            </Text>
          </Card>

          {/* Overall Feeling */}
          <Card style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 15 }}>
              Hoe voel je je vandaag?
            </Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              {[1, 2, 3, 4, 5].map((feeling) => (
                <TouchableOpacity
                  key={feeling}
                  onPress={() => onOverallFeelingChange?.(feeling as 1 | 2 | 3 | 4 | 5)}
                  style={{
                    alignItems: 'center',
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: overallFeeling === feeling ? '#e0f2fe' : 'transparent',
                    minWidth: 60,
                  }}
                >
                  <Text style={{ fontSize: 32, marginBottom: 5 }}>
                    {feeling === 1 && '😢'}
                    {feeling === 2 && '😕'}
                    {feeling === 3 && '😐'}
                    {feeling === 4 && '😊'}
                    {feeling === 5 && '🤩'}
                  </Text>
                  <Text style={{ 
                    fontSize: 12, 
                    color: overallFeeling === feeling ? '#0284c7' : '#666',
                    fontWeight: overallFeeling === feeling ? '600' : '400',
                    textAlign: 'center',
                  }}>
                    {feeling === 1 && 'Slecht'}
                    {feeling === 2 && 'Niet goed'}
                    {feeling === 3 && 'Oké'}
                    {feeling === 4 && 'Goed'}
                    {feeling === 5 && 'Geweldig'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* General Notes */}
          <Card style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>
              Extra gedachten of notities
            </Text>
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 15 }}>
              Is er nog iets wat je wilt noteren over je dag?
            </Text>
            
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                minHeight: 100,
                textAlignVertical: 'top',
                backgroundColor: '#fafafa',
              }}
              multiline
              placeholder="Bijv. wat je hebt geleerd, plannen voor morgen, bijzondere gebeurtenissen..."
              value={generalNotes || ''}
              onChangeText={(text) => onGeneralNotesChange?.(text)}
            />
          </Card>

          {/* Navigation */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}>
            <Button
              title="← Terug naar doelen"
              onPress={goToPreviousGoal}
              style={{ backgroundColor: '#6b7280' }}
            />

            <Button
              title="Reflectie opslaan"
              onPress={handleSave}
              loading={isSaving}
              style={{ backgroundColor: '#22c55e' }}
            />
          </View>

          {/* Back to start */}
          <Button
            title="Terug naar start"
            onPress={onBackToStart}
            variant="outline"
            style={{
              borderColor: '#d1d5db',
              backgroundColor: 'transparent',
            }}
            textStyle={{ color: '#6b7280' }}
          />
        </View>
      </ScrollView>
    );
  }

  if (!currentGoal) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f5f5f5', padding: 20 }}>
        <Card>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>
            Geen doelen gevonden
          </Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>
            Er zijn geen doelen om te reflecteren.
          </Text>
          <Button
            title="Terug naar start"
            onPress={onBackToStart}
            style={{ backgroundColor: '#6b7280' }}
          />
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ padding: 20 }}>
        {/* Header */}
        <Card style={{ marginBottom: 20 }}>
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 5 }}>
              Reflectie {formatDate(today)}
            </Text>
            <Text style={{ fontSize: 16, color: '#666' }}>
              Doel {currentGoalIndex + 1} van {todayGoals.length}
            </Text>
          </View>

          {/* Progress bar */}
          <View style={{
            height: 6,
            backgroundColor: '#e5e7eb',
            borderRadius: 3,
            overflow: 'hidden',
          }}>
            <View style={{
              height: '100%',
              backgroundColor: '#3b82f6',
              width: `${((currentGoalIndex + 1) / todayGoals.length) * 100}%`,
            }} />
          </View>
        </Card>

        {/* Current Goal */}
        <Card style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
            {currentGoal.title}
          </Text>
          
          {currentGoal.description && (
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 15 }}>
              {currentGoal.description}
            </Text>
          )}

          <View style={{
            backgroundColor: '#f8f9fa',
            padding: 12,
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: '#3b82f6',
          }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>
              {currentGoal.category === 'health' && '🏃‍♂️ Gezondheid & Fitness'}
              {currentGoal.category === 'productivity' && '💼 Werk & Productiviteit'}
              {currentGoal.category === 'personal_development' && '🌱 Persoonlijke Ontwikkeling'}
              {currentGoal.category === 'social' && '👥 Sociaal & Relaties'}
              {currentGoal.category === 'household' && '🏠 Huishouden & Wonen'}
              {currentGoal.category === 'practical' && '📋 Praktisch & Regelen'}
              {currentGoal.category === 'entertainment' && '🎮 Ontspanning & Hobby\'s'}
              {currentGoal.category === 'finance' && '💰 Financieel'}
              {currentGoal.category === 'shopping' && '🛒 Shopping & Aankopen'}
              {currentGoal.category === 'other' && '📝 Anders'}
            </Text>
          </View>
        </Card>

        {/* Completion Status */}
        <Card style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 15 }}>
            Heb je dit doel behaald?
          </Text>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={() => handleCompletionChange(true)}
              style={{
                flex: 1,
                padding: 15,
                borderRadius: 8,
                backgroundColor: currentReflection?.completed ? '#22c55e' : '#f3f4f6',
                borderWidth: 2,
                borderColor: currentReflection?.completed ? '#16a34a' : '#e5e7eb',
              }}
            >
              <Text style={{
                textAlign: 'center',
                fontWeight: '600',
                color: currentReflection?.completed ? 'white' : '#374151',
              }}>
                ✅ Ja, behaald
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleCompletionChange(false)}
              style={{
                flex: 1,
                padding: 15,
                borderRadius: 8,
                backgroundColor: currentReflection?.completed === false ? '#ef4444' : '#f3f4f6',
                borderWidth: 2,
                borderColor: currentReflection?.completed === false ? '#dc2626' : '#e5e7eb',
              }}
            >
              <Text style={{
                textAlign: 'center',
                fontWeight: '600',
                color: currentReflection?.completed === false ? 'white' : '#374151',
              }}>
                ❌ Nee, niet behaald
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Feedback */}
        <Card style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>
            {currentReflection?.completed ? 'Hoe ging het?' : 'Wat ging er goed/minder goed?'}
          </Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 15 }}>
            Deel je ervaringen, wat je hebt geleerd, of hoe je je voelde.
          </Text>
          
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#d1d5db',
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
              minHeight: 100,
              textAlignVertical: 'top',
              backgroundColor: '#fafafa',
            }}
            multiline
            placeholder="Typ hier je reflectie..."
            value={currentReflection?.feedback || ''}
            onChangeText={handleFeedbackChange}
          />
        </Card>

        {/* Reason for not completing (only if not completed) */}
        {currentReflection?.completed === false && (
          <Card style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>
              Waarom werd dit doel niet behaald?
            </Text>
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 15 }}>
              Selecteer de reden die het beste past:
            </Text>
            
            <View style={{ marginBottom: 15 }}>
              {Object.entries(MISSED_GOAL_REASONS).map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => handleReasonChange(key as MissedGoalReason)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 12,
                    marginBottom: 8,
                    borderRadius: 8,
                    backgroundColor: selectedReason === key ? '#e0f2fe' : '#f8f9fa',
                    borderWidth: 1,
                    borderColor: selectedReason === key ? '#0284c7' : '#e5e7eb',
                  }}
                >
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: selectedReason === key ? '#0284c7' : '#d1d5db',
                    backgroundColor: selectedReason === key ? '#0284c7' : 'transparent',
                    marginRight: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {selectedReason === key && (
                      <View style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'white',
                      }} />
                    )}
                  </View>
                  <Text style={{
                    fontSize: 16,
                    color: selectedReason === key ? '#0284c7' : '#374151',
                    fontWeight: selectedReason === key ? '500' : '400',
                  }}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom reason input if "Anders" is selected */}
            {selectedReason === 'other' && (
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  minHeight: 80,
                  textAlignVertical: 'top',
                  backgroundColor: '#fafafa',
                }}
                multiline
                placeholder="Beschrijf de reden..."
                value={customReason}
                onChangeText={(text) => {
                  setCustomReason(text);
                  handleReasonChange('other', text);
                }}
              />
            )}
          </Card>
        )}

        {/* Navigation */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}>
          <Button
            title="← Vorige"
            onPress={goToPreviousGoal}
            disabled={isFirstGoal}
            style={{
              backgroundColor: isFirstGoal ? '#e5e7eb' : '#6b7280',
              opacity: isFirstGoal ? 0.5 : 1,
            }}
          />

          <Text style={{ fontSize: 14, color: '#666' }}>
            {currentGoalIndex + 1} / {todayGoals.length}
          </Text>

          {!isLastGoal ? (
            <Button
              title="Volgende →"
              onPress={goToNextGoal}
              style={{ backgroundColor: '#3b82f6' }}
            />
          ) : (
            <Button
              title="Algemene reflectie →"
              onPress={goToNextGoal}
              style={{ backgroundColor: '#3b82f6' }}
            />
          )}
        </View>

        {/* Back to start */}
        <Button
          title="Terug naar start"
          onPress={onBackToStart}
          variant="outline"
          style={{
            borderColor: '#d1d5db',
            backgroundColor: 'transparent',
          }}
          textStyle={{ color: '#6b7280' }}
        />
      </View>
    </ScrollView>
  );
}
