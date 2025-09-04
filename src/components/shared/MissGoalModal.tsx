import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MissedReason } from '../../types';
import { CategorySystemHelper } from '../../lib/category-system';
import Button from '../ui/Button';
import Input from '../ui/Input';

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

  const reasonOptions: { value: MissedReason; label: string; description: string }[] = [
    { 
      value: 'no_time', 
      label: 'Geen tijd gehad', 
      description: 'Er was gewoon niet genoeg tijd voor dit doel' 
    },
    { 
      value: 'forgot', 
      label: 'Vergeten', 
      description: 'Het is me gewoon ontschoten vandaag' 
    },
    { 
      value: 'no_motivation', 
      label: 'Geen zin/motivatie', 
      description: 'Had er vandaag geen energie voor' 
    },
    { 
      value: 'too_difficult', 
      label: 'Te moeilijk/uitdagend', 
      description: 'Dit doel bleek moeilijker dan verwacht' 
    },
    { 
      value: 'too_tired', 
      label: 'Te moe', 
      description: 'Was te uitgeput om dit te doen' 
    },
    { 
      value: 'unexpected', 
      label: 'Onverwachte omstandigheden', 
      description: 'Externe factoren maakten het onmogelijk' 
    },
    { 
      value: 'distraction', 
      label: 'Afgeleid', 
      description: 'Andere zaken trokken mijn aandacht' 
    },
    { 
      value: 'other', 
      label: 'Anders', 
      description: 'Een andere reden (uitleg hieronder)' 
    },
    { 
      value: 'wrong_goal', 
      label: 'Verkeerd doel', 
      description: 'Dit doel hoort hier niet, verwijder het' 
    },
  ];

  if (showDeleteConfirm) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.deleteModal}>
            <View style={styles.deleteHeader}>
              <View style={styles.deleteIcon}>
                <Ionicons name="warning" size={24} color="#DC2626" />
              </View>
              <View style={styles.deleteHeaderText}>
                <Text style={styles.deleteTitle}>Doel definitief verwijderen?</Text>
                <Text style={styles.deleteSubtitle}>Dit kan niet ongedaan worden gemaakt</Text>
              </View>
            </View>
            
            <View style={styles.deleteContent}>
              <Text style={styles.deleteDescription}>
                Je staat op het punt om <Text style={styles.goalTitleBold}>"{goalTitle}"</Text> volledig te verwijderen.
              </Text>
              
              <View style={styles.warningBox}>
                <View style={styles.warningIcon}>
                  <Ionicons name="alert-circle" size={20} color="#F59E0B" />
                </View>
                <View style={styles.warningText}>
                  <Text style={styles.warningTextContent}>
                    <Text style={styles.warningBold}>Let op:</Text> Dit doel verdwijnt volledig uit je geschiedenis. 
                    Dit kan invloed hebben op je voortgangstracking en persoonlijke inzichten.
                  </Text>
                </View>
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

            <View style={styles.deleteActions}>
              <Button
                title="↩️ Terug"
                onPress={() => setShowDeleteConfirm(false)}
                variant="outline"
                style={styles.backButton}
              />
              <Button
                title="🗑️ Definitief verwijderen"
                onPress={handleConfirmDelete}
                style={StyleSheet.flatten([styles.deleteButton, { backgroundColor: '#DC2626' }])}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Ionicons name="sad-outline" size={24} color="#F59E0B" />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.title}>Doel niet gehaald</Text>
                <Text style={styles.subtitle}>"{goalTitle}"</Text>
              </View>
            </View>

            {/* Description */}
            <Text style={styles.description}>
              Waarom ben je er niet aan toegekomen? Deze informatie helpt je om patronen te herkennen en je planning te verbeteren.
            </Text>

            {/* Reason Selection */}
            <View style={styles.reasonsSection}>
              <Text style={styles.reasonsTitle}>Selecteer een reden:</Text>
              {reasonOptions.map((reason) => (
                <TouchableOpacity
                  key={reason.value}
                  style={[
                    styles.reasonOption,
                    selectedReason === reason.value && styles.reasonOptionSelected
                  ]}
                  onPress={() => setSelectedReason(reason.value)}
                >
                  <View style={styles.reasonContent}>
                    <View style={styles.reasonHeader}>
                      <View style={[
                        styles.radioButton,
                        selectedReason === reason.value && styles.radioButtonSelected
                      ]}>
                        {selectedReason === reason.value && (
                          <View style={styles.radioButtonInner} />
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

            {/* Notes Field - Only show for non-delete reasons */}
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

            {/* Actions */}
            <View style={styles.actions}>
              <Button
                title="❌ Annuleren"
                onPress={handleCancel}
                variant="outline"
                style={styles.cancelButton}
              />
              <Button
                title={selectedReason === 'wrong_goal' ? '🗑️ Verwijderen' : '📝 Vastleggen'}
                onPress={handleSubmit}
                disabled={!selectedReason}
                style={StyleSheet.flatten([
                  styles.confirmButton,
                  selectedReason === 'wrong_goal' && { backgroundColor: '#DC2626' }
                ])}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  scrollView: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 20,
  },
  reasonsSection: {
    marginBottom: 20,
  },
  reasonsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 12,
  },
  reasonOption: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  reasonOptionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  reasonContent: {
    flex: 1,
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioButtonSelected: {
    borderColor: '#3B82F6',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  reasonLabelSelected: {
    color: '#1D4ED8',
  },
  deleteReasonLabel: {
    color: '#DC2626',
  },
  reasonDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 32,
  },
  deleteReasonDescription: {
    color: '#B91C1C',
  },
  notesSection: {
    marginBottom: 20,
  },
  notesInput: {
    minHeight: 80,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
  // Delete confirmation styles
  deleteModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  deleteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#FEE2E2',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deleteHeaderText: {
    flex: 1,
  },
  deleteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  deleteSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  deleteContent: {
    marginBottom: 20,
  },
  deleteDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },
  goalTitleBold: {
    fontWeight: '600',
  },
  warningBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#F3E8FF',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    marginBottom: 16,
  },
  warningIcon: {
    marginRight: 8,
  },
  warningText: {
    flex: 1,
  },
  warningTextContent: {
    fontSize: 12,
    color: '#92400E',
  },
  warningBold: {
    fontWeight: '600',
  },
  deleteActions: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
  },
  deleteButton: {
    flex: 1,
  },
});
