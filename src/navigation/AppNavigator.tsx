import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screens (we maken deze binnenkort)
import HomeScreen from '../screens/HomeScreen';
import TodayScreen from '../screens/TodayScreen';
import PlanningScreen from '../screens/PlanningScreen';
import ReflectionScreen from '../screens/ReflectionScreen';
import GoalsScreen from '../screens/GoalsScreen';

export type RootTabParamList = {
  Home: undefined;
  Today: undefined;
  Planning: undefined;
  Reflection: undefined;
  Goals: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

// Icon mapping voor consistency met je Next.js app
const getTabBarIcon = (routeName: string, focused: boolean, color: string, size: number) => {
  let iconName: string;

  switch (routeName) {
    case 'Home':
      iconName = focused ? 'home' : 'home-outline';
      break;
    case 'Today':
      iconName = focused ? 'time' : 'time-outline';
      break;
    case 'Planning':
      iconName = focused ? 'clipboard' : 'clipboard-outline';
      break;
    case 'Reflection':
      iconName = focused ? 'bulb' : 'bulb-outline';
      break;
    case 'Goals':
      iconName = focused ? 'flash' : 'flash-outline';
      break;
    default:
      iconName = 'help-outline';
  }

  return <Ionicons name={iconName as any} size={size} color={color} />;
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) =>
            getTabBarIcon(route.name, focused, color, size),
          tabBarActiveTintColor: '#3B82F6', // blue-500 equivalent
          tabBarInactiveTintColor: '#9CA3AF', // gray-400 equivalent
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB', // gray-200 equivalent
            paddingBottom: 8,
            paddingTop: 8,
            height: 88,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: 4,
          },
          headerStyle: {
            backgroundColor: '#FFFFFF',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
            color: '#1F2937', // gray-800 equivalent
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Home',
            headerTitle: 'Discipline Yourself',
          }}
        />
        <Tab.Screen
          name="Today"
          component={TodayScreen}
          options={{
            title: 'Vandaag',
            headerTitle: 'Vandaag',
          }}
        />
        <Tab.Screen
          name="Planning"
          component={PlanningScreen}
          options={{
            title: 'Planning',
            headerTitle: 'Avondplanning',
          }}
        />
        <Tab.Screen
          name="Reflection"
          component={ReflectionScreen}
          options={{
            title: 'Reflectie',
            headerTitle: 'Avondreflectie',
          }}
        />
        <Tab.Screen
          name="Goals"
          component={GoalsScreen}
          options={{
            title: 'Doelen',
            headerTitle: 'Lange Termijn Doelen',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
