import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { EveningReflection } from '../components/reflection/EveningReflection';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../navigation/AppNavigator';

type Props = BottomTabScreenProps<RootTabParamList, 'Reflection'>;

export default function ReflectionScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <EveningReflection navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
