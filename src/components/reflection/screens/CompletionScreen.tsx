import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Reflection } from '../../../types';
import { Card } from '../../ui/Card';
import Button from '../../ui/Button';

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

  const getMotivationalMessage = (completionRate: number) => {
    if (completionRate >= 90) {
      return {
        emoji: '🎉',
        title: 'Fantastisch!',
        message: 'Je hebt bijna al je doelen behaald. Dit is echt geweldig!'
      };
    } else if (completionRate >= 70) {
      return {
        emoji: '🌟',
        title: 'Geweldig gedaan!',
        message: 'Je hebt de meeste van je doelen behaald. Blijf zo doorgaan!'
      };
    } else if (completionRate >= 50) {
      return {
        emoji: '👍',
        title: 'Goed bezig!',
        message: 'Je hebt meer dan de helft van je doelen behaald. Elke stap telt!'
      };
    } else if (completionRate >= 25) {
      return {
        emoji: '💪',
        title: 'Blijf volhouden!',
        message: 'Je hebt een aantal doelen behaald. Morgen kun je het nog beter doen!'
      };
    } else {
      return {
        emoji: '🌱',
        title: 'Nieuwe kansen!',
        message: 'Elke dag is een nieuwe kans om te groeien. Je kunt dit!'
      };
    }
  };

  const motivation = getMotivationalMessage(savedReflection.completionPercentage);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ padding: 20 }}>
        {/* Success Banner */}
        <Card style={{ 
          marginBottom: 20,
          backgroundColor: '#f0f9ff',
          borderColor: '#3b82f6',
          borderWidth: 2,
        }}>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 48, marginBottom: 10 }}>
              {motivation.emoji}
            </Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' }}>
              {motivation.title}
            </Text>
            <Text style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>
              {motivation.message}
            </Text>
          </View>

          <View style={{
            backgroundColor: 'white',
            padding: 15,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#e5e7eb',
          }}>
            <Text style={{ fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 5 }}>
              Reflectie voltooid voor {formatDate(today)}
            </Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#3b82f6' }}>
              {savedReflection.completionPercentage}% behaald
            </Text>
          </View>
        </Card>

        {/* Stats Overview */}
        <Card style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15 }}>
            Overzicht
          </Text>

          <View style={{ flexDirection: 'row', marginBottom: 15 }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#22c55e' }}>
                {savedReflection.completedGoals}
              </Text>
              <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
                Behaalde doelen
              </Text>
            </View>
            
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ef4444' }}>
                {savedReflection.totalGoals - savedReflection.completedGoals}
              </Text>
              <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
                Gemiste doelen
              </Text>
            </View>
            
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#3b82f6' }}>
                {savedReflection.totalGoals}
              </Text>
              <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
                Totaal doelen
              </Text>
            </View>
          </View>

          {/* Completion Bar */}
          <View style={{
            height: 8,
            backgroundColor: '#e5e7eb',
            borderRadius: 4,
            overflow: 'hidden',
            marginBottom: 10,
          }}>
            <View style={{
              height: '100%',
              backgroundColor: '#22c55e',
              width: `${savedReflection.completionPercentage}%`,
            }} />
          </View>
          
          <Text style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>
            {savedReflection.completionPercentage}% van je doelen behaald
          </Text>
        </Card>

        {/* Goal Feedback Summary */}
        {savedReflection.goalFeedback && Object.keys(savedReflection.goalFeedback).length > 0 && (
          <Card style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15 }}>
              Je reflecties
            </Text>
            
            {Object.entries(savedReflection.goalFeedback).map(([goalId, feedback], index) => (
              <View key={goalId} style={{ 
                marginBottom: 15,
                padding: 12,
                backgroundColor: '#f8f9fa',
                borderRadius: 8,
                borderLeftWidth: 4,
                borderLeftColor: index < savedReflection.completedGoals ? '#22c55e' : '#ef4444',
              }}>
                <Text style={{ fontSize: 16, fontWeight: '500', marginBottom: 5 }}>
                  Doel {index + 1}
                </Text>
                <Text style={{ fontSize: 14, color: '#666', fontStyle: 'italic' }}>
                  "{feedback}"
                </Text>
              </View>
            ))}
          </Card>
        )}

        {/* Missed Goals */}
        {savedReflection.missedGoals && Object.keys(savedReflection.missedGoals).length > 0 && (
          <Card style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15 }}>
              Gemiste doelen
            </Text>
            
            {Object.entries(savedReflection.missedGoals).map(([goalId, reason], index) => (
              <View key={goalId} style={{ 
                marginBottom: 10,
                padding: 12,
                backgroundColor: '#fef2f2',
                borderRadius: 8,
                borderLeftWidth: 4,
                borderLeftColor: '#ef4444',
              }}>
                <Text style={{ fontSize: 14, color: '#ef4444' }}>
                  • {reason}
                </Text>
              </View>
            ))}
          </Card>
        )}

        {/* Notes */}
        {savedReflection.notes && (
          <Card style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15 }}>
              Extra notities
            </Text>
            <Text style={{ 
              fontSize: 14, 
              color: '#666',
              fontStyle: 'italic',
              lineHeight: 20,
            }}>
              "{savedReflection.notes}"
            </Text>
          </Card>
        )}

                {/* Feeling */}
        {savedReflection.overallFeeling && (
          <Card style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15 }}>
              Hoe voel je je?
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 36, marginRight: 10 }}>
                {savedReflection.overallFeeling === 1 && '😢'}
                {savedReflection.overallFeeling === 2 && '😕'}
                {savedReflection.overallFeeling === 3 && '😐'}
                {savedReflection.overallFeeling === 4 && '😊'}
                {savedReflection.overallFeeling === 5 && '🤩'}
              </Text>
              <Text style={{ fontSize: 16, color: '#666' }}>
                {savedReflection.overallFeeling === 1 && 'Slecht'}
                {savedReflection.overallFeeling === 2 && 'Niet zo goed'}
                {savedReflection.overallFeeling === 3 && 'Oké'}
                {savedReflection.overallFeeling === 4 && 'Goed'}
                {savedReflection.overallFeeling === 5 && 'Fantastisch'}
              </Text>
            </View>
          </Card>
        )}

        {/* Notes */}
        {savedReflection.notes && (
          <Card style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15 }}>
              Extra notities
            </Text>
            <Text style={{ 
              fontSize: 14, 
              color: '#666',
              fontStyle: 'italic',
              lineHeight: 20,
            }}>
              "{savedReflection.notes}"
            </Text>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={{ gap: 10, marginBottom: 20 }}>
          {/* Plan Tomorrow Button - Prominent placement */}
          <Button
            title="📋 Plan morgen"
            onPress={onPlanTomorrow || (() => alert('Ga naar de "Planning" tab onderaan je scherm om morgen te plannen! 📋'))}
            style={{ 
              backgroundColor: '#22c55e',
              paddingVertical: 16,
              borderRadius: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
            textStyle={{ 
              fontSize: 16, 
              fontWeight: '600' 
            }}
          />
          
          <Button
            title="✏️ Bewerk reflectie"
            onPress={onEditReflection}
            style={{ backgroundColor: '#3b82f6' }}
          />
          
          <Button
            title="↩️ Terug naar start"
            onPress={onBackToStart}
            variant="outline"
            style={{
              borderColor: '#d1d5db',
              backgroundColor: 'transparent',
            }}
            textStyle={{ color: '#6b7280' }}
          />
        </View>

        {/* Motivational Quote */}
        <Card style={{ 
          backgroundColor: '#f0fdf4',
          borderColor: '#22c55e',
          borderWidth: 1,
        }}>
          <Text style={{ 
            fontSize: 14, 
            fontStyle: 'italic', 
            textAlign: 'center',
            color: '#15803d',
            lineHeight: 20,
          }}>
            "Elke dag is een nieuwe kans om beter te worden dan gisteren. 
            Je reflectie van vandaag helpt je morgen sterker te staan."
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
}
