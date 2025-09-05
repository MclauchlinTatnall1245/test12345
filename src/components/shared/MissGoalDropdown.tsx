import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MissedReason } from '../../types';
import { CategorySystemHelper } from '../../lib/category-system';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface MissGoalDropdownProps {
  goalId: string;
  goalTitle: string;
  onConfirm: (reason: MissedReason, notes?: string) => void;
  onCancel: () => void;
}

export function MissGoalDropdown({ goalId, goalTitle, onConfirm, onCancel }: MissGoalDropdownProps) {
  const [selectedReason, setSelectedReason] = useState<MissedReason | ''>('');
  const [notes, setNotes] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
  const missedReasons: { value: MissedReason; label: string; description: string }[] = 
    CategorySystemHelper.getAllMissedReasons().map(([value, label]) => ({
      value,
      label,
      description: reasonDescriptions[value]
    }));

  const handleSubmit = () => {
    if (!selectedReason) return;
    
    if (selectedReason === 'wrong_goal') {
      setShowDeleteConfirm(true);
      return;
    }
    
    onConfirm(selectedReason, notes.trim() || undefined);
  };

  const handleConfirmDelete = () => {
    onConfirm('wrong_goal', notes.trim() || undefined);
  };

  if (showDeleteConfirm) {
    return (
      <View style={styles.deleteConfirmContainer}>
        <View style={styles.deleteConfirmHeader}>
          <View style={styles.deleteIcon}>
            <Text style={styles.deleteIconText}>⚠️</Text>
          </View>
          <View style={styles.deleteTextContainer}>
            <Text style={styles.deleteTitle}>Weet je het zeker?</Text>
            <Text style={styles.deleteSubtitle}>Dit kan niet ongedaan worden gemaakt</Text>
          </View>
        </View>
        
        <View style={styles.deleteGoalContainer}>
          <Text style={styles.deleteGoalText}>
            <Text style={styles.deleteGoalTitle}>"{goalTitle}"</Text> wordt permanent verwijderd.
          </Text>
        </View>

        <Input
          label="Reden (optioneel)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Waarom verwijder je dit doel?"
          multiline
          style={styles.notesInput}
        />

        <View style={styles.deleteActions}>
          <Button
            title="Annuleren"
            onPress={onCancel}
            variant="outline"
            style={styles.cancelButton}
          />
          <Button
            title="Ja, verwijderen"
            onPress={handleConfirmDelete}
            style={StyleSheet.flatten([styles.deleteButton, { backgroundColor: '#EF4444' }])}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="sad-outline" size={24} color="#F59E0B" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Doel niet gehaald</Text>
          <Text style={styles.subtitle}>Waarom lukte "{goalTitle}" niet?</Text>
        </View>
      </View>

      <View style={styles.reasonsList}>
        {missedReasons.map((reason) => (
          <TouchableOpacity
            key={reason.value}
            style={[
              styles.reasonItem,
              selectedReason === reason.value && styles.reasonItemSelected
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
                  selectedReason === reason.value && styles.reasonLabelSelected
                ]}>
                  {reason.label}
                </Text>
              </View>
              <Text style={styles.reasonDescription}>{reason.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {selectedReason && selectedReason !== 'wrong_goal' && (
        <Input
          label="Extra notities (optioneel)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Bijvoorbeeld: was ziek, moest overwerken..."
          multiline
          style={styles.notesInput}
        />
      )}

      <View style={styles.actions}>
        <Button
          title="Annuleren"
          onPress={onCancel}
          variant="outline"
          style={styles.cancelButton}
        />
        <Button
          title={selectedReason === 'wrong_goal' ? "Verwijderen" : "Bevestigen"}
          onPress={handleSubmit}
          disabled={!selectedReason}
          style={StyleSheet.flatten([
            styles.confirmButton,
            selectedReason === 'wrong_goal' && { backgroundColor: '#EF4444' }
          ])}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#FCD34D',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
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
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#A16207',
  },
  reasonsList: {
    marginBottom: 16,
  },
  reasonItem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  reasonItemSelected: {
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
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#3B82F6',
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  reasonLabelSelected: {
    color: '#3B82F6',
  },
  reasonDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 28,
  },
  notesInput: {
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
  deleteConfirmContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  deleteConfirmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deleteIconText: {
    fontSize: 16,
  },
  deleteTextContainer: {
    flex: 1,
  },
  deleteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 2,
  },
  deleteSubtitle: {
    fontSize: 14,
    color: '#DC2626',
  },
  deleteGoalContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  deleteGoalText: {
    fontSize: 14,
    color: '#B91C1C',
  },
  deleteGoalTitle: {
    fontWeight: '600',
  },
  deleteActions: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteButton: {
    flex: 1,
  },
});
