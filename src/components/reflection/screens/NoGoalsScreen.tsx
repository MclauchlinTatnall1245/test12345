import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Reflection } from '../../../types';
import { Card } from '../../ui/Card';
import Button from '../../ui/Button';
import { HistoryView } from './HistoryView';

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

  if (showHistory) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <HistoryView
          allReflections={allReflections}
          selectedHistoryReflection={selectedHistoryReflection}
          onSelectReflection={onSelectHistoryReflection}
        />
        <View style={{ padding: 16 }}>
          <Button
            title="← Terug naar reflectie"
            variant="outline"
            onPress={() => setShowHistory(false)}
          />
        </View>
      </View>
    );
  }

  // No goals for today - show main screen with history button
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <View style={{ padding: 20 }}>
        <Card style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
            Geen doelen voor {formatDate(today)}
          </Text>
          <Text style={{ fontSize: 16, color: '#666', marginBottom: 20 }}>
            Er zijn geen doelen gepland voor vandaag. Plan eerst wat doelen om te kunnen reflecteren.
          </Text>
          
          <View style={{ gap: 12 }}>
            <Button
              title="Terug naar start"
              onPress={onBackToStart}
              style={{ backgroundColor: '#3b82f6' }}
            />
            
            {allReflections && allReflections.length > 0 && (
              <Button
                title="Bekijk eerdere reflecties"
                variant="outline"
                onPress={() => setShowHistory(true)}
              />
            )}
          </View>
        </Card>

        {(!allReflections || allReflections.length === 0) && (
          <Card>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>
              Nog geen reflecties
            </Text>
            <Text style={{ fontSize: 14, color: '#666' }}>
              Je hebt nog geen eerdere reflecties. Start met het plannen van doelen en kom terug voor je eerste reflectie.
            </Text>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}
