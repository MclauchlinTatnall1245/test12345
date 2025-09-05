import React, { useRef } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  ScrollView,
  Keyboard,
  Platform,
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  scrollViewRef?: React.RefObject<ScrollView | null>;
}

export default function Input({
  label,
  error,
  containerStyle,
  labelStyle,
  errorStyle,
  style,
  scrollViewRef,
  ...props
}: InputProps) {
  const inputRef = useRef<TextInput>(null);
  const containerRef = useRef<View>(null);

  const handleFocus = (event: any) => {
    // Call original onFocus if provided
    if (props.onFocus) {
      props.onFocus(event);
    }

    // Auto-scroll naar de input wanneer deze focus krijgt
    if (scrollViewRef?.current && containerRef.current) {
      // Kleine delay om zeker te weten dat layout updates klaar zijn
      setTimeout(() => {
        containerRef.current?.measureLayout(
          scrollViewRef.current as any,
          (x, y, width, height) => {
            // Scroll naar de input met wat extra ruimte
            const extraSpace = Platform.OS === 'ios' ? 150 : 200;
            const targetY = Math.max(0, y - extraSpace);
            
            scrollViewRef.current?.scrollTo({
              y: targetY,
              animated: true,
            });
          },
          () => {
            // Fallback: scroll naar beneden als measureLayout faalt
            console.log('MeasureLayout failed, using fallback scroll');
            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }
        );
      }, 200); // Verhoogd naar 200ms voor modals
    }
  };

  const handleBlur = (event: any) => {
    // Call original onBlur if provided
    if (props.onBlur) {
      props.onBlur(event);
    }
  };

  return (
    <View ref={containerRef} style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor="#9CA3AF" // gray-400
        onFocus={handleFocus}
        onBlur={handleBlur}
        blurOnSubmit={!props.multiline} // Prevent keyboard from closing on submit for multiline
        returnKeyType={props.multiline ? 'default' : 'done'}
        {...props}
      />
      {error && <Text style={[styles.error, errorStyle]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151', // gray-700
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB', // gray-300
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937', // gray-800
    backgroundColor: '#FFFFFF',
    minHeight: 44,
    // Ensure input is always visible when focused
    zIndex: 1,
  },
  inputError: {
    borderColor: '#EF4444', // red-500
  },
  error: {
    fontSize: 12,
    color: '#EF4444', // red-500
    marginTop: 4,
  },
});
