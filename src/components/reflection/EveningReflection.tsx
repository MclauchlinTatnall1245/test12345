import React, { useState, useEffect } from 'react';
import { useReflectionData } from '../../hooks/useReflectionData';
import { StartScreen } from './screens/StartScreen';
import { CompletionScreen } from './screens/CompletionScreen';
import { NoGoalsScreen } from './screens/NoGoalsScreen';
import { ReflectionWorkflow } from './screens/ReflectionWorkflow';
import { HistoryView } from './screens/HistoryView';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../../navigation/AppNavigator';

interface EveningReflectionProps {
  navigation?: BottomTabNavigationProp<RootTabParamList, 'Reflection'>;
}

export function EveningReflection({ navigation }: EveningReflectionProps) {
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [hasStartedReflection, setHasStartedReflection] = useState(false);
  
  const {
    // State
    todayGoals,
    goalReflections,
    currentGoalIndex,
    isCompleted,
    savedReflection,
    isEditing,
    showHistory,
    allReflections,
    selectedHistoryReflection,
    today,
    overallFeeling,
    generalNotes,
    
    // Actions
    setCurrentGoalIndex,
    setIsEditing,
    setShowHistory,
    setSelectedHistoryReflection,
    updateGoalReflection,
    handleSaveReflection,
    setOverallFeeling,
    setGeneralNotes,
  } = useReflectionData();

  // Listen for tab press to reset to start screen
  useEffect(() => {
    if (!navigation) return;

    const unsubscribe = navigation.addListener('tabPress', (e) => {
      // Only reset if we're not already on the start screen
      if (!showStartScreen || hasStartedReflection || showHistory || isEditing) {
        setShowStartScreen(true);
        setHasStartedReflection(false);
        setIsEditing(false);
        setShowHistory(false);
        setSelectedHistoryReflection(null);
      }
    });

    return unsubscribe;
  }, [navigation, showStartScreen, hasStartedReflection, showHistory, isEditing, setIsEditing, setShowHistory, setSelectedHistoryReflection]);

  // Reset to start screen
  const handleBackToStart = () => {
    setShowStartScreen(true);
    setHasStartedReflection(false);
    setIsEditing(false);
    setShowHistory(false);
    setSelectedHistoryReflection(null);
  };

  // Start reflection workflow
  const handleStartReflection = () => {
    setShowStartScreen(false);
    setHasStartedReflection(true);
    setIsEditing(false);
  };

  // Show history
  const handleShowHistory = () => {
    setShowHistory(true);
    setShowStartScreen(false);
  };

  // Edit existing reflection
  const handleEditReflection = () => {
    setIsEditing(true);
    setHasStartedReflection(true);
    setShowStartScreen(false);
  };

  // Plan tomorrow - navigate to Planning tab
  const handlePlanTomorrow = () => {
    if (navigation) {
      navigation.navigate('Planning');
    } else {
      alert('Ga naar de "Planning" tab onderaan je scherm om morgen te plannen! 📋');
    }
  };

  // Determine current goal after data is loaded
  const currentGoal = todayGoals[currentGoalIndex];

  // History view (can be accessed from both NoGoalsScreen and normal flow)
  if (showHistory) {
    return (
      <HistoryView
        allReflections={allReflections}
        selectedHistoryReflection={selectedHistoryReflection}
        onSelectReflection={setSelectedHistoryReflection}
        onBackToStart={handleBackToStart}
      />
    );
  }

  // No goals for today - show no goals screen
  if (todayGoals.length === 0) {
    return (
      <NoGoalsScreen
        today={today}
        onBackToStart={handleBackToStart}
        allReflections={allReflections}
        selectedHistoryReflection={selectedHistoryReflection}
        onSelectHistoryReflection={setSelectedHistoryReflection}
      />
    );
  }

  // Completed reflection - show completion screen
  if (isCompleted && savedReflection && !isEditing && !hasStartedReflection) {
    return (
      <CompletionScreen
        today={today}
        savedReflection={savedReflection}
        onBackToStart={handleBackToStart}
        onEditReflection={handleEditReflection}
        onPlanTomorrow={handlePlanTomorrow}
      />
    );
  }

  // Reflection workflow in progress
  if (hasStartedReflection || isEditing) {
    return (
      <ReflectionWorkflow
        today={today}
        todayGoals={todayGoals}
        goalReflections={goalReflections}
        currentGoalIndex={currentGoalIndex}
        onCurrentGoalIndexChange={setCurrentGoalIndex}
        onGoalReflectionUpdate={updateGoalReflection}
        onSaveReflection={async () => {
          await handleSaveReflection();
          setHasStartedReflection(false);
          setIsEditing(false);
        }}
        onBackToStart={handleBackToStart}
        overallFeeling={overallFeeling}
        generalNotes={generalNotes}
        onOverallFeelingChange={setOverallFeeling}
        onGeneralNotesChange={setGeneralNotes}
      />
    );
  }

  // Start Screen (initial landing page)
  return (
    <StartScreen
      today={today}
      todayGoals={todayGoals}
      onStartReflection={handleStartReflection}
      onShowHistory={handleShowHistory}
      isCompleted={isCompleted}
      savedReflection={savedReflection}
    />
  );
}
