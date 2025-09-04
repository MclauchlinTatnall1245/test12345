import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Goal, GoalCategory } from '../../types';
import { CategorySystemHelper } from '../../lib/category-system';
import { Picker } from '@react-native-picker/picker';

interface EditGoalFormProps {
  goal: Goal;
  onGoalUpdated: (updatedGoal: Goal) => void;
  onCancel: () => void;
}

interface GoalFormData {
  title: string;
  description: string;
  timeSlot: string;
  category: GoalCategory;
  subcategory?: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  timeSlot?: string;
  category?: string;
}

const GOAL_CATEGORIES: { value: GoalCategory; label: string }[] = [
  { value: 'health', label: 'Gezondheid & Fitness' },
  { value: 'productivity', label: 'Werk & Productiviteit' },
  { value: 'household', label: 'Huishouden & Wonen' },
  { value: 'practical', label: 'Praktisch & Regelen' },
  { value: 'personal_development', label: 'Persoonlijke Ontwikkeling' },
  { value: 'entertainment', label: 'Ontspanning & Hobby\'s' },
  { value: 'social', label: 'Sociaal & Relaties' },
  { value: 'finance', label: 'Financieel' },
  { value: 'shopping', label: 'Shopping & Aankopen' },
  { value: 'other', label: 'Anders' },
];

export function EditGoalForm({ goal, onGoalUpdated, onCancel }: EditGoalFormProps) {
  const [formData, setFormData] = useState<GoalFormData>({
    title: goal.title,
    description: goal.description || '',
    timeSlot: goal.timeSlot || '',
    category: goal.category,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Titel is verplicht';
    }

    if (!formData.category) {
      newErrors.category = 'Categorie is verplicht';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const updatedGoal: Goal = {
      ...goal,
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      timeSlot: formData.timeSlot.trim() || undefined,
      category: formData.category,
    };

    onGoalUpdated(updatedGoal);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>✏️ Doel bewerken</Text>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
          <Ionicons name="close" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        {/* Title */}
        <View style={styles.field}>
          <Text style={styles.label}>Titel *</Text>
          <Input
            value={formData.title}
            onChangeText={(text: string) => setFormData(prev => ({ ...prev, title: text }))}
            placeholder="Wat wil je bereiken?"
            style={errors.title ? styles.inputError : undefined}
          />
          {errors.title && (
            <Text style={styles.errorText}>{errors.title}</Text>
          )}
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>Beschrijving (optioneel)</Text>
          <Input
            value={formData.description}
            onChangeText={(text: string) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder="Extra details..."
          />
        </View>

        {/* Time Slot */}
        <View style={styles.field}>
          <Text style={styles.label}>Tijdslot (optioneel)</Text>
          <Input
            value={formData.timeSlot}
            onChangeText={(text: string) => setFormData(prev => ({ ...prev, timeSlot: text }))}
            placeholder="bijv. 09:00, 10:00-11:00, voor 09:00"
          />
          <Text style={styles.helperText}>
            Voorbeelden: "09:00", "10:00-11:00", "voor 09:00"
          </Text>
        </View>

        {/* Category */}
        <View style={styles.field}>
          <Text style={styles.label}>Categorie *</Text>
          <View style={[styles.pickerContainer, errors.category ? styles.pickerError : null]}>
            <Picker
              selectedValue={formData.category}
              onValueChange={(value: string) => setFormData(prev => ({ ...prev, category: value as GoalCategory }))}
              style={styles.picker}
            >
              <Picker.Item label="Selecteer categorie..." value="" />
              {GOAL_CATEGORIES.map((cat) => (
                <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
              ))}
            </Picker>
          </View>
          {errors.category && (
            <Text style={styles.errorText}>{errors.category}</Text>
          )}
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title="💾 Opslaan"
            onPress={handleSubmit}
            style={styles.saveButton}
          />
          <Button
            title="❌ Annuleren"
            onPress={onCancel}
            variant="outline"
            style={styles.cancelButton}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  form: {
    gap: 16,
  },
  field: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  inputError: {
    borderColor: '#FCA5A5',
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  pickerError: {
    borderColor: '#FCA5A5',
  },
  picker: {
    height: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  saveButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
});
