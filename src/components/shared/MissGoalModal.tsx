import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MissedReason } from '../../types';
import { CategorySystemHelper } from '../../lib/category-system';
import Button from '../ui/Button';
import Input from '../ui/Input';

const { height: screenHeight } = Dimensions.get('window');

interface MissGoalModalProps {
  visible: boolean;
  goalTitle: string;
  onConfirm: (reason: MissedReason, notes?: string) => void;
  onCancel: () => void;
}

export function MissGoalModal({ visible, goalTitle, onConfirm, onCancel }: MissGoalModalProps) {
  const [selectedReason, setSelectedReason] = useState<MissedReason | ''>('');
  const [notes, setNotes] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = () => {
    if (!selectedReason) return;
    
    // Als "wrong_goal" is geselecteerd, toon delete bevestiging
    if (selectedReason === 'wrong_goal') {
      setShowDeleteConfirm(true);
      return;
    }
    
    // Voor andere redenen, markeer als gemist
    onConfirm(selectedReason, notes.trim() || undefined);
    resetForm();
  };

  const handleConfirmDelete = () => {
    onConfirm('wrong_goal', notes.trim() || undefined);
    resetForm();
  };

  const resetForm = () => {
    setSelectedReason('');
    setNotes('');
    setShowDeleteConfirm(false);
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  // Beschrijvingen voor elke reden
  const reasonDescriptions: Record<MissedReason, string> = {
    no_time: 'Er was gewoon niet genoeg tijd voor dit doel',
    no_energy: 'Had er vandaag geen energie of zin voor',
    forgot: 'Het is me gewoon ontschoten vandaag',
    planning_changed: 'Mijn planning of agenda werd omgegooid',
    circumstances: 'Externe factoren maakten het onmogelijk',
    too_difficult: 'Dit doel bleek moeilijker dan verwacht',
    wrong_goal: 'Dit doel hoort hier niet, verwijder het',
    other: 'Een andere reden (uitleg hieronder)'
  };

  // Gebruik de centrale definitie voor consistent gedrag
  const reasonOptions: { value: MissedReason; label: string; description: string }[] = 
    CategorySystemHelper.getAllMissedReasons().map(([value, label]) => ({
      value,
      label,
      description: reasonDescriptions[value]
    }));

  if (showDeleteConfirm) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <LinearGradient
          colors={['rgba(15, 23, 42, 0.8)', 'rgba(15, 23, 42, 0.9)']}
          style={styles.overlay}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.deleteModalContainer}>
              {/* Premium Delete Modal - exact app styling */}
              <View style={styles.deleteModal}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
                  style={styles.deleteModalGradient}
                />
                
                {/* Premium Header met exact app styling */}
                <View style={styles.deleteHeader}>
                  <View style={styles.deleteIconContainer}>
                    <LinearGradient
                      colors={['#667eea', '#764ba2']}
                      style={styles.deleteIconGradient}
                    >
                      <Ionicons name="warning" size={28} color="#FFFFFF" />
                    </LinearGradient>
                  </View>
                  <View style={styles.deleteHeaderText}>
                    <Text style={styles.deleteTitle}>Doel verwijderen?</Text>
                    <Text style={styles.deleteSubtitle}>Deze actie kan niet ongedaan worden</Text>
                  </View>
                </View>
                
                {/* Content met app card styling */}
                <View style={styles.deleteContent}>
                  <View style={styles.goalHighlight}>
                    <Text style={styles.deleteDescription}>
                      Je staat op het punt om dit doel volledig te verwijderen:
                    </Text>
                    <View style={styles.goalTitleContainer}>
                      <Text style={styles.goalTitleBold}>"{goalTitle}"</Text>
                    </View>
                  </View>
                  
                  <View style={styles.warningBox}>
                    <View style={styles.warningHeader}>
                      <Ionicons name="information-circle" size={20} color="#667eea" />
                      <Text style={styles.warningTitle}>Let op</Text>
                    </View>
                    <Text style={styles.warningText}>
                      Dit doel verdwijnt volledig uit je geschiedenis en kan invloed hebben op je voortgangstracking.
                    </Text>
                  </View>

                  <Input
                    label="Reden voor verwijdering (optioneel)"
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Waarom verwijder je dit doel?"
                    multiline
                    style={styles.notesInput}
                  />
                </View>

                {/* Premium Action Buttons - exact app button styling */}
                <View style={styles.deleteActions}>
                  <Button
                    title="Annuleren"
                    onPress={() => setShowDeleteConfirm(false)}
                    variant="outline"
                    style={styles.cancelButton}
                  />
                  
                  <Button
                    title="Verwijderen"
                    onPress={handleConfirmDelete}
                    style={styles.deleteConfirmButton}
                  />
                </View>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <LinearGradient
        colors={['rgba(15, 23, 42, 0.6)', 'rgba(15, 23, 42, 0.8)']}
        style={styles.overlay}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.modalContainer}>
            {/* Premium Modal Card - exact app styling */}
            <View style={styles.modal}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
                style={styles.modalGradient}
              />
              
              {/* Premium Sticky Header - exact zoals GoalForm */}
              <View style={styles.header}>
                <View style={styles.headerIconContainer}>
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.headerIconGradient}
                  >
                    <Ionicons name="sad-outline" size={28} color="#FFFFFF" />
                  </LinearGradient>
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.title}>Doel niet gehaald</Text>
                  <Text style={styles.subtitle}>"{goalTitle}"</Text>
                </View>
              </View>
              
              <ScrollView 
                style={styles.scrollView} 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >

                {/* Description card - exact app styling */}
                <View style={styles.descriptionContainer}>
                  <View style={styles.descriptionCard}>
                    <LinearGradient
                      colors={['rgba(102, 126, 234, 0.05)', 'rgba(102, 126, 234, 0.02)']}
                      style={styles.descriptionCardGradient}
                    />
                    <Text style={styles.description}>
                      Waarom ben je er niet aan toegekomen? Deze informatie helpt je om patronen te herkennen en je planning te verbeteren.
                    </Text>
                  </View>
                </View>

                {/* Premium Reason Selection - exact app card styling */}
                <View style={styles.reasonsSection}>
                  <Text style={styles.reasonsTitle}>Kies een reden:</Text>
                  <View style={styles.reasonsList}>
                    {reasonOptions.map((reason) => (
                      <TouchableOpacity
                        key={reason.value}
                        style={[
                          styles.reasonOption,
                          selectedReason === reason.value && styles.reasonOptionSelected,
                          reason.value === 'wrong_goal' && styles.deleteReasonOption
                        ]}
                        onPress={() => setSelectedReason(selectedReason === reason.value ? '' : reason.value)}
                      >
                        <LinearGradient
                          colors={
                            selectedReason === reason.value 
                              ? reason.value === 'wrong_goal'
                                ? ['rgba(239, 68, 68, 0.1)', 'rgba(239, 68, 68, 0.05)']
                                : ['rgba(102, 126, 234, 0.1)', 'rgba(102, 126, 234, 0.05)']
                              : ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.8)']
                          }
                          style={styles.reasonOptionGradient}
                        />
                        <View style={styles.reasonContent}>
                          <View style={styles.reasonHeader}>
                            <View style={[
                              styles.radioButton,
                              selectedReason === reason.value && styles.radioButtonSelected,
                              reason.value === 'wrong_goal' && selectedReason === reason.value && styles.radioButtonDelete
                            ]}>
                              {selectedReason === reason.value && (
                                <View style={[
                                  styles.radioButtonInner,
                                  reason.value === 'wrong_goal' && styles.radioButtonInnerDelete
                                ]} />
                              )}
                            </View>
                            <Text style={[
                              styles.reasonLabel,
                              selectedReason === reason.value && styles.reasonLabelSelected,
                              reason.value === 'wrong_goal' && styles.deleteReasonLabel
                            ]}>
                              {reason.label}
                            </Text>
                          </View>
                          <Text style={[
                            styles.reasonDescription,
                            reason.value === 'wrong_goal' && styles.deleteReasonDescription
                          ]}>
                            {reason.description}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Notes Field - app card styling */}
                {selectedReason && selectedReason !== 'wrong_goal' && (
                  <View style={styles.notesSection}>
                    <Input
                      label="Extra toelichting (optioneel)"
                      value={notes}
                      onChangeText={setNotes}
                      placeholder="Bijv. specifieke omstandigheden, wat je volgende keer anders zou doen..."
                      multiline
                      style={styles.notesInput}
                    />
                  </View>
                )}
              </ScrollView>

              {/* Premium Action Buttons - exact app button styling */}
              <View style={styles.actions}>
                <Button
                  title="Annuleren"
                  onPress={handleCancel}
                  variant="outline"
                  style={styles.cancelButton}
                />
                
                <Button
                  title={selectedReason === 'wrong_goal' ? 'Verwijderen' : 'Vastleggen'}
                  onPress={handleSubmit}
                  disabled={!selectedReason}
                  style={selectedReason === 'wrong_goal' ? styles.deleteConfirmButton : styles.confirmButton}
                />
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Premium Overlay - exact zoals app
  overlay: {
    flex: 1,
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 8,
  },
  
  // Premium Modal Card - exact zoals app cards
  modal: {
    backgroundColor: 'transparent',
    borderRadius: 32,
    height: screenHeight * 0.85,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: 'rgba(99, 102, 241, 0.25)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  modalGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollView: {
    position: 'relative',
    zIndex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
    paddingTop: 24,
  },

  // Premium Sticky Header - exact zoals GoalForm
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.8)',
    position: 'relative',
    zIndex: 2,
    backgroundColor: 'transparent',
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: 'rgba(102, 126, 234, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  headerIconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },

  // Description Card - exact app styling
  descriptionContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  descriptionCard: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: 'rgba(99, 102, 241, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  descriptionCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  description: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    padding: 20,
    position: 'relative',
    zIndex: 1,
    fontWeight: '500',
  },

  // Premium Reasons Section - exact app styling
  reasonsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  reasonsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 20,
    letterSpacing: -0.2,
  },
  reasonsList: {
    gap: 12,
  },
  reasonOption: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: 'rgba(99, 102, 241, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  reasonOptionSelected: {
    borderColor: '#667eea',
    shadowColor: 'rgba(102, 126, 234, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
    transform: [{ scale: 1.02 }],
  },
  deleteReasonOption: {
    borderColor: '#ef4444',
    shadowColor: 'rgba(239, 68, 68, 0.3)',
  },
  reasonOptionGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  reasonContent: {
    padding: 20,
    position: 'relative',
    zIndex: 1,
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioButtonSelected: {
    borderColor: '#667eea',
  },
  radioButtonDelete: {
    borderColor: '#ef4444',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#667eea',
  },
  radioButtonInnerDelete: {
    backgroundColor: '#ef4444',
  },
  reasonLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  reasonLabelSelected: {
    color: '#667eea',
  },
  deleteReasonLabel: {
    color: '#ef4444',
  },
  reasonDescription: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 32,
    lineHeight: 18,
    fontWeight: '500',
  },
  deleteReasonDescription: {
    color: '#dc2626',
  },

  // Notes Section - app styling
  notesSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  notesInput: {
    minHeight: 80,
  },

  // Premium Action Buttons - exact app button styling
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 40,
    gap: 12,
    position: 'relative',
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.8)',
  },
  cancelButtonContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: 'rgba(102, 126, 234, 0.2)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  cancelButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#667eea',
    letterSpacing: 0.2,
    position: 'relative',
    zIndex: 1,
  },
  confirmButtonContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: 'rgba(102, 126, 234, 0.4)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0.2,
  },
  confirmButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
    position: 'relative',
    zIndex: 1,
  },

  // Delete Modal Styles - premium styling
  deleteModalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 24,
  },
  deleteModal: {
    backgroundColor: 'transparent',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: 'rgba(99, 102, 241, 0.15)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  deleteModalGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  deleteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    position: 'relative',
    zIndex: 1,
  },
  deleteIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: 'rgba(102, 126, 234, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  deleteIconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteHeaderText: {
    flex: 1,
  },
  deleteTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  deleteSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  deleteContent: {
    paddingHorizontal: 24,
    marginBottom: 32,
    position: 'relative',
    zIndex: 1,
  },
  goalHighlight: {
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  deleteDescription: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 12,
    fontWeight: '500',
  },
  goalTitleContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  goalTitleBold: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  warningBox: {
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.2)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#667eea',
    marginLeft: 8,
    letterSpacing: 0.2,
  },
  warningText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    fontWeight: '500',
  },
  deleteActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 32,
    gap: 12,
    position: 'relative',
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.8)',
  },
  deleteButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: 'rgba(239, 68, 68, 0.4)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  deleteButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
    position: 'relative',
    zIndex: 1,
  },

  // Button styles - consistent with GoalForm
  cancelButton: {
    flex: 1,
    marginRight: 6,
  },
  confirmButton: {
    flex: 1,
    marginLeft: 6,
  },
  deleteConfirmButton: {
    flex: 1,
    marginLeft: 6,
    backgroundColor: '#dc2626',
  },
});
