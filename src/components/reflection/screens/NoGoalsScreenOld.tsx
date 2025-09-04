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

  const calculateCompletionRate = (reflection: Reflection) => {
    return reflection.completionPercentage || 0;
  };

  // Show individual reflection details
  if (selectedHistoryReflection) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <View style={{ padding: 20 }}>
          <Card style={{ marginBottom: 20 }}>
            <View style={{ marginBottom: 20 }}>
              <TouchableOpacity
                onPress={() => onSelectHistoryReflection(null)}
                style={{
                  padding: 10,
                  backgroundColor: '#f0f0f0',
                  borderRadius: 8,
                  alignSelf: 'flex-start',
                  marginBottom: 15,
                }}
              >
                <Text style={{ fontSize: 14, color: '#666' }}>← Terug naar overzicht</Text>
              </TouchableOpacity>
              
              <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 5 }}>
                Reflectie van {formatDate(selectedHistoryReflection.date)}
              </Text>
              
              <Text style={{ fontSize: 16, color: '#666', marginBottom: 15 }}>
                {calculateCompletionRate(selectedHistoryReflection)}% voltooid
              </Text>

              {selectedHistoryReflection.goalFeedback && Object.keys(selectedHistoryReflection.goalFeedback).length > 0 && (
                <View>
                  <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 15 }}>
                    Doelen
                  </Text>
                  
                  {Object.entries(selectedHistoryReflection.goalFeedback).map(([goalId, feedback], index) => (
                    <View key={goalId} style={{ marginBottom: 15 }}>
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 8,
                      }}>
                        <View style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          backgroundColor: selectedHistoryReflection.completedGoals >= selectedHistoryReflection.totalGoals ? '#22c55e' : '#ef4444',
                          marginRight: 10,
                        }} />
                        <Text style={{ 
                          fontSize: 16, 
                          fontWeight: '500',
                          flex: 1,
                        }}>
                          Doel {index + 1}
                        </Text>
                      </View>
                      
                      {feedback && (
                        <Text style={{ 
                          fontSize: 14, 
                          color: '#666',
                          marginLeft: 30,
                          fontStyle: 'italic',
                        }}>
                          "{feedback}"
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {selectedHistoryReflection.notes && (
                <View style={{ marginTop: 20 }}>
                  <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>
                    Notities
                  </Text>
                  <Text style={{ 
                    fontSize: 14, 
                    color: '#666',
                    fontStyle: 'italic',
                    lineHeight: 20,
                  }}>
                    "{selectedHistoryReflection.notes}"
                  </Text>
                </View>
              )}

              {selectedHistoryReflection.missedGoals && Object.keys(selectedHistoryReflection.missedGoals).length > 0 && (
                <View style={{ marginTop: 20 }}>
                  <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>
                    Gemiste doelen
                  </Text>
                  {Object.entries(selectedHistoryReflection.missedGoals).map(([goalId, reason], index) => (
                    <View key={goalId} style={{ marginBottom: 10 }}>
                      <Text style={{ fontSize: 14, color: '#ef4444' }}>
                        • {reason}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </Card>
        </View>
      </ScrollView>
    );
  }

  // No goals for today - show history overview
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ padding: 20 }}>
        <Card style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
            Geen doelen voor {formatDate(today)}
          </Text>
          <Text style={{ fontSize: 16, color: '#666', marginBottom: 20 }}>
            Er zijn geen doelen gepland voor vandaag. Bekijk je eerdere reflecties hieronder.
          </Text>
          
          <Button
            title="Terug naar start"
            onPress={onBackToStart}
            style={{ backgroundColor: '#3b82f6' }}
          />
        </Card>

        {allReflections && allReflections.length > 0 && (
          <Card>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15 }}>
              Eerdere reflecties
            </Text>
            
            <FlatList
              data={allReflections}
              scrollEnabled={false}
              keyExtractor={(item) => item.date}
              renderItem={({ item: reflection }) => (
                <TouchableOpacity
                  onPress={() => onSelectHistoryReflection(reflection)}
                  style={{
                    padding: 15,
                    borderRadius: 8,
                    backgroundColor: '#f8f9fa',
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: '#e9ecef',
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '500', marginBottom: 4 }}>
                        {formatDate(reflection.date)}
                      </Text>
                      
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 14, color: '#666' }}>
                          {calculateCompletionRate(reflection)}% voltooid
                        </Text>
                        
                        {reflection.goalFeedback && (
                          <Text style={{ fontSize: 14, color: '#666', marginLeft: 10 }}>
                            • {Object.keys(reflection.goalFeedback).length} doelen
                          </Text>
                        )}
                      </View>
                    </View>
                    
                    <Text style={{ fontSize: 20, color: '#666' }}>→</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </Card>
        )}

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
