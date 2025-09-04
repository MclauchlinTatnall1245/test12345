import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  interactive?: boolean;
  onPress?: () => void;
}

interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface CardTitleProps {
  children: React.ReactNode;
  style?: TextStyle;
}

interface CardDescriptionProps {
  children: React.ReactNode;
  style?: TextStyle;
}

interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style, interactive, onPress }: CardProps) {
  const Component = interactive || onPress ? TouchableOpacity : View;
  
  return (
    <Component
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={interactive ? 0.7 : 1}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ children, style }: CardHeaderProps) {
  return <View style={[styles.header, style]}>{children}</View>;
}

export function CardTitle({ children, style }: CardTitleProps) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export function CardDescription({ children, style }: CardDescriptionProps) {
  return <Text style={[styles.description, style]}>{children}</Text>;
}

export function CardContent({ children, style }: CardContentProps) {
  return <View style={[styles.content, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6', // gray-100
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937', // gray-800
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6B7280', // gray-500
    lineHeight: 20,
  },
  content: {
    // No default styles for content
  },
});
