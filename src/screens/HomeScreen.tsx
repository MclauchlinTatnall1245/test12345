import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { addTestGoals, clearAllTestData } from '../lib/testData';
import { DataService } from '../lib/data-service';
import TimeService from '../lib/time-service';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../navigation/AppNavigator';

type Props = BottomTabScreenProps<RootTabParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [stats, setStats] = useState({
    todayGoals: 0,
    completedToday: 0,
    completionRate: 0,
    totalGoalsThisWeek: 0,
    weeklyCompletionRate: 0,
    currentStreak: 0,
    totalLongTermGoals: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const today = TimeService.getCurrentDate();
      const todayPlan = await DataService.getDayPlan(today);
      
      // Today's stats
      const todayGoals = todayPlan?.goals || [];
      const completedToday = todayGoals.filter(g => g.completed).length;
      const completionRate = todayGoals.length > 0 ? Math.round((completedToday / todayGoals.length) * 100) : 0;

      // Weekly stats
      const weekStats = await calculateWeeklyStats();
      
      // Long term goals
      const longTermGoals = await DataService.getLongTermGoals();
      
      setStats({
        todayGoals: todayGoals.length,
        completedToday,
        completionRate,
        totalGoalsThisWeek: weekStats.total,
        weeklyCompletionRate: weekStats.completionRate,
        currentStreak: await calculateStreak(),
        totalLongTermGoals: longTermGoals.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const calculateWeeklyStats = async () => {
    const today = TimeService.getCurrentDate();
    let totalGoals = 0;
    let completedGoals = 0;

    // Check last 7 days
    for (let i = 0; i < 7; i++) {
      const date = TimeService.getDateMinusDays(today, i);
      const dayPlan = await DataService.getDayPlan(date);
      if (dayPlan?.goals) {
        totalGoals += dayPlan.goals.length;
        completedGoals += dayPlan.goals.filter(g => g.completed).length;
      }
    }

    return {
      total: totalGoals,
      completionRate: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0,
    };
  };

  const calculateStreak = async (): Promise<number> => {
    const today = TimeService.getCurrentDate();
    let streak = 0;
    
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const date = TimeService.getDateMinusDays(today, i);
      const dayPlan = await DataService.getDayPlan(date);
      
      if (dayPlan?.goals && dayPlan.goals.length > 0) {
        const completionRate = dayPlan.goals.filter(g => g.completed).length / dayPlan.goals.length;
        if (completionRate >= 0.5) { // At least 50% completion counts as success
          streak++;
        } else {
          break;
        }
      } else {
        break;
      }
    }
    
    return streak;
  };

  const handleNavigateToTab = (tabName: keyof RootTabParamList) => {
    navigation.navigate(tabName);
  };
  const handleAddTestData = async () => {
    try {
      await addTestGoals();
      Alert.alert('Succes!', 'Test doelen zijn toegevoegd. Ga naar "Vandaag" om ze te zien.');
    } catch (error) {
      Alert.alert('Error', 'Er ging iets mis bij het toevoegen van test data');
    }
  };

  const handleClearData = async () => {
    Alert.alert(
      'Data wissen',
      'Weet je zeker dat je alle data wilt verwijderen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        { 
          text: 'Wissen', 
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllTestData();
              Alert.alert('Succes!', 'Alle data is gewist.');
            } catch (error) {
              Alert.alert('Error', 'Er ging iets mis bij het wissen van data');
            }
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Discipline Yourself</Text>
          <Text style={styles.heroSubtitle}>
            Transform je dromen in realiteit met de krachtigste discipline app. 
            Plan dagelijks, volg je voortgang en bereik elk doel dat je voor ogen hebt.
          </Text>
          
          {/* Today's Progress Summary */}
          <View style={styles.todaysSummary}>
            <Text style={styles.summaryTitle}>Vandaag</Text>
            <Text style={styles.summaryStats}>
              {stats.completedToday} van {stats.todayGoals} doelen voltooid ({stats.completionRate}%)
            </Text>
          </View>

          <View style={styles.heroButtons}>
            <Button
              title="🚀 Start vandaag"
              onPress={() => handleNavigateToTab('Today')}
              size="lg"
              style={styles.primaryButton}
            />
            <Button
              title="📊 Bekijk doelen"
              onPress={() => handleNavigateToTab('Goals')}
              variant="outline"
              size="lg"
              style={styles.secondaryButton}
            />
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <TouchableOpacity 
            style={styles.statCardTouchable}
            onPress={() => handleNavigateToTab('Today')}
            activeOpacity={0.7}
          >
            <View style={[styles.statCard, styles.greenCard]}>
              <View style={styles.statContent}>
                <Text style={styles.statEmoji}>🎯</Text>
                <Text style={styles.statNumber}>{stats.completionRate}%</Text>
                <Text style={styles.statLabel}>Vandaag voltooid</Text>
              </View>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.statCardTouchable}
            onPress={() => handleNavigateToTab('Reflection')}
            activeOpacity={0.7}
          >
            <View style={[styles.statCard, styles.blueCard]}>
              <View style={styles.statContent}>
                <Text style={styles.statEmoji}>🔥</Text>
                <Text style={styles.statNumber}>{stats.currentStreak}</Text>
                <Text style={styles.statLabel}>Dagen streak</Text>
              </View>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.statCardTouchable}
            onPress={() => handleNavigateToTab('Goals')}
            activeOpacity={0.7}
          >
            <View style={[styles.statCard, styles.purpleCard]}>
              <View style={styles.statContent}>
                <Text style={styles.statEmoji}>⚡</Text>
                <Text style={styles.statNumber}>{stats.totalLongTermGoals}</Text>
                <Text style={styles.statLabel}>LT doelen</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Action Cards */}
        <View style={styles.actionGrid}>
          <TouchableOpacity onPress={() => handleNavigateToTab('Today')}>
            <Card interactive style={styles.actionCard}>
              <CardHeader>
                <CardTitle style={styles.actionTitle}>
                  📋 Vandaag
                </CardTitle>
                <CardDescription>Volg je voortgang</CardDescription>
              </CardHeader>
              <CardContent>
                <Text style={styles.cardText}>
                  Bekijk je doelen voor vandaag, vink af wat je hebt gedaan en voeg nieuwe doelen toe.
                </Text>
                <Button
                  title="📊 Naar Dashboard"
                  onPress={() => handleNavigateToTab('Today')}
                  style={styles.cardButton}
                />
              </CardContent>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleNavigateToTab('Planning')}>
            <Card interactive style={styles.actionCard}>
              <CardHeader>
                <CardTitle style={styles.actionTitle}>
                  🌙 Avondplanning
                </CardTitle>
                <CardDescription>Plan je doelen voor morgen</CardDescription>
              </CardHeader>
              <CardContent>
                <Text style={styles.cardText}>
                  Plan elke avond je doelen voor de volgende dag. Klein beginnen is de sleutel tot succes.
                </Text>
                <Button
                  title="🎯 Start Planning"
                  onPress={() => handleNavigateToTab('Planning')}
                  style={styles.cardButton}
                />
              </CardContent>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleNavigateToTab('Goals')}>
            <Card interactive style={styles.actionCard}>
              <CardHeader>
                <CardTitle style={styles.actionTitle}>
                  🏆 Lange Termijn
                </CardTitle>
                <CardDescription>Grote dromen realiseren</CardDescription>
              </CardHeader>
              <CardContent>
                <Text style={styles.cardText}>
                  Stel grote doelen en werk er elke dag naartoe. Van fitness tot carrière.
                </Text>
                <Button
                  title="🚀 Mijn Doelen"
                  onPress={() => handleNavigateToTab('Goals')}
                  variant="outline"
                  style={styles.cardButton}
                />
              </CardContent>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Debug Buttons */}
        <View style={styles.debugSection}>
          <Text style={styles.debugTitle}>🛠️ Test & Debug</Text>
          <View style={styles.debugButtons}>
            <Button
              title="➕ Test doelen toevoegen"
              onPress={handleAddTestData}
              variant="outline"
              style={styles.debugButton}
            />
            <Button
              title="🗑️ Alle data wissen"
              onPress={handleClearData}
              variant="outline"
              style={styles.debugButton}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // slate-50
  },
  scrollView: {
    flex: 1,
  },
  hero: {
    padding: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1E40AF', // blue-700
    textAlign: 'center',
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#6B7280', // gray-500
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  todaysSummary: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    minWidth: 280,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D4ED8',
    marginBottom: 4,
  },
  summaryStats: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
  },
  heroButtons: {
    gap: 12,
    width: '100%',
    maxWidth: 280,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  secondaryButton: {
    borderColor: '#3B82F6',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 6, // Nog kleinere gap voor meer ruimte
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  statCard: {
    padding: 12, // Nog kleinere padding
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    minHeight: 75, // Wat kleiner
    minWidth: 90, // Minimum breedte
  },
  statCardTouchable: {
    flex: 1,
    maxWidth: '32%', // Begrens de maximale breedte
  },
  greenCard: {
    backgroundColor: '#ECFDF5', // green-50
    borderColor: '#BBF7D0', // green-200
  },
  blueCard: {
    backgroundColor: '#EFF6FF', // blue-50
    borderColor: '#BFDBFE', // blue-200
  },
  purpleCard: {
    backgroundColor: '#F5F3FF', // purple-50
    borderColor: '#C4B5FD', // purple-200
  },
  statContent: {
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 18, // Nog kleiner emoji
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 18, // Kleiner nummer
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10, // Nog kleinere label
    fontWeight: '500',
    textAlign: 'center',
    color: '#6B7280',
    lineHeight: 12,
    flexWrap: 'wrap', // Zorgt ervoor dat tekst kan wrappen
  },
  actionGrid: {
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 24,
  },
  actionCard: {
    marginBottom: 0,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardButton: {
    marginTop: 8,
  },
  debugSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  debugTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  debugButtons: {
    gap: 12,
  },
  debugButton: {
    borderColor: '#9CA3AF',
  },
});
