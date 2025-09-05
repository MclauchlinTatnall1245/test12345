import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  scrollable?: boolean;
}

const { height: screenHeight } = Dimensions.get('window');

export function BaseModal({ visible, onClose, title, children, scrollable = true }: BaseModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={['#f8fafc', '#e2e8f0']}
        style={styles.backgroundGradient}
      >
        <SafeAreaView style={styles.container}>
          <KeyboardAvoidingView 
            style={styles.keyboardAvoid}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            {/* Premium Glass Header - exact match met app styling */}
            <View style={styles.header}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
                style={styles.headerGradient}
              />
              <View style={styles.headerContent}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <View style={styles.closeButtonContainer}>
                    <LinearGradient
                      colors={['rgba(102, 126, 234, 0.15)', 'rgba(102, 126, 234, 0.05)']}
                      style={styles.closeButtonGradient}
                    >
                      <Ionicons name="close" size={20} color="#64748b" />
                    </LinearGradient>
                  </View>
                </TouchableOpacity>
                
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>{title}</Text>
                </View>
                
                <View style={styles.headerSpacer} />
              </View>
            </View>

            {/* Content met premium styling - exact zoals app cards */}
            {scrollable ? (
              <ScrollView 
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.contentCard}>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
                    style={styles.contentCardGradient}
                  />
                  <View style={styles.contentWrapper}>
                    {children}
                  </View>
                </View>
              </ScrollView>
            ) : (
              <View style={styles.content}>
                <View style={styles.contentCard}>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
                    style={styles.contentCardGradient}
                  />
                  <View style={styles.contentWrapper}>
                    {children}
                  </View>
                </View>
              </View>
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Background gradient - exact zoals app
  backgroundGradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  
  // Premium Glass Header - exact match met app styling
  header: {
    position: 'relative',
    paddingTop: Platform.OS === 'ios' ? 4 : 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: 'rgba(99, 102, 241, 0.15)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    position: 'relative',
    zIndex: 1,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: 'rgba(102, 126, 234, 0.3)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  closeButtonGradient: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  
  // Content styling - exact zoals app cards
  content: {
    flex: 1,
    paddingTop: 32,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  contentCard: {
    marginHorizontal: 24,
    borderRadius: 24,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: 'rgba(99, 102, 241, 0.15)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'transparent',
  },
  contentCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentWrapper: {
    padding: 32,
    position: 'relative',
    zIndex: 1,
  },
});
