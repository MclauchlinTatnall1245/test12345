import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Goal, GoalCategory } from '../../types';
import { CategorySystemHelper } from '../../lib/category-system';
import { DataService, CategoryDetectionEngine } from '../../lib/data-service';
import { BaseModal } from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

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
  { value: 'other', label: 'Anders' }
];

const QUICK_GOAL_SUGGESTIONS = [
  { title: '30 minuten wandelen', category: 'health' as GoalCategory, timeSlot: '' },
  { title: '10 minuten meditatie', category: 'personal_development' as GoalCategory, timeSlot: '' },
  { title: 'Kamer opruimen', category: 'household' as GoalCategory, timeSlot: '' },
  { title: '1 uur lezen', category: 'personal_development' as GoalCategory, timeSlot: '' },
  { title: 'Email afhandelen', category: 'productivity' as GoalCategory, timeSlot: '' },
  { title: 'Voor 09:00 opstaan', category: 'health' as GoalCategory, timeSlot: 'voor 09:00' },
  { title: 'Gym sessie', category: 'health' as GoalCategory, timeSlot: '10:00-11:00' },
  { title: 'Boodschappen doen', category: 'household' as GoalCategory, timeSlot: '14:00-15:00' },
  { title: 'Auto tanken', category: 'practical' as GoalCategory, timeSlot: '' },
  { title: 'Rekening betalen', category: 'finance' as GoalCategory, timeSlot: '' },
  { title: 'Vrienden bellen', category: 'social' as GoalCategory, timeSlot: '' },
  { title: 'Budget bijhouden', category: 'finance' as GoalCategory, timeSlot: '' },
];

interface GoalFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (goal: Goal) => void;
  targetDate: string;
  editingGoal?: Goal | null;
}

interface GoalFormData {
  title: string;
  description: string;
  timeSlot: string;
  category: GoalCategory;
  subcategory?: string;
}

export function GoalForm({ 
  visible, 
  onClose, 
  onSave, 
  targetDate, 
  editingGoal 
}: GoalFormProps) {
  const [showQuickSuggestions, setShowQuickSuggestions] = useState(false);
  const [detectedCategory, setDetectedCategory] = useState<{category: GoalCategory; subcategory?: string} | null>(null);
  
  const [formData, setFormData] = useState<GoalFormData>({
    title: '',
    description: '',
    timeSlot: '',
    category: 'other',
    subcategory: undefined
  });

  const [titleError, setTitleError] = useState('');

  // Get available subcategories for selected category
  const availableSubcategories = CategoryDetectionEngine.getSubcategoriesForCategory(formData.category);

  // Live detectie terwijl gebruiker typt
  useEffect(() => {
    if (formData.title.length > 2) {
      const detected = CategoryDetectionEngine.detectCategoryAndSubcategory(
        formData.title, 
        formData.description, 
        formData.timeSlot
      );
      setDetectedCategory(detected);
      
      // Auto-update category als detectie sterk genoeg is en category nog 'other' is
      if (detected && formData.category === 'other') {
        setFormData(prev => ({ 
          ...prev, 
          category: detected.category,
          subcategory: detected.subcategory 
        }));
      }
    } else {
      setDetectedCategory(null);
    }
  }, [formData.title, formData.description, formData.timeSlot]);

  // Reset form when modal opens/closes or editing goal changes
  useEffect(() => {
    if (visible) {
      if (editingGoal) {
        setFormData({
          title: editingGoal.title,
          description: editingGoal.description || '',
          timeSlot: editingGoal.timeSlot || '',
          category: editingGoal.category,
          subcategory: editingGoal.subcategory,
        });
      } else {
        setFormData({
          title: '',
          description: '',
          timeSlot: '',
          category: 'other',
          subcategory: undefined
        });
      }
      setTitleError('');
      setDetectedCategory(null);
      setShowQuickSuggestions(false);
    }
  }, [visible, editingGoal]);

  const handleSubmit = () => {
    // Validation
    if (!formData.title.trim()) {
      setTitleError('Doel titel is verplicht');
      return;
    }

    setTitleError('');

    // Automatische categorie detectie (maar gebruik handmatige keuze als die er is)
    const finalDetectedCategory = CategoryDetectionEngine.detectCategoryAndSubcategory(
      formData.title, 
      formData.description, 
      formData.timeSlot
    );

    const newGoal: Goal = {
      id: editingGoal?.id || DataService.generateId(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      timeSlot: formData.timeSlot.trim(),
      category: formData.category, // Gebruik handmatige keuze
      subcategory: formData.subcategory || finalDetectedCategory?.subcategory, // Handmatige keuze heeft voorrang
      completed: editingGoal?.completed || false,
      createdAt: editingGoal?.createdAt || new Date(),
      planDate: targetDate,
      completedAt: editingGoal?.completedAt,
      missed: editingGoal?.missed,
    };

    onSave(newGoal);
    onClose();
  };

  const handleAddQuickGoal = (suggestion: typeof QUICK_GOAL_SUGGESTIONS[0]) => {
    // Automatische categorie detectie ook voor quick goals
    const detectedCategory = CategoryDetectionEngine.detectCategoryAndSubcategory(
      suggestion.title, 
      '', 
      suggestion.timeSlot
    );

    const newGoal: Goal = {
      id: editingGoal?.id || DataService.generateId(),
      title: suggestion.title,
      description: '',
      timeSlot: suggestion.timeSlot,
      category: detectedCategory ? detectedCategory.category : suggestion.category,
      subcategory: detectedCategory?.subcategory,
      completed: editingGoal?.completed || false,
      createdAt: editingGoal?.createdAt || new Date(),
      planDate: targetDate,
      completedAt: editingGoal?.completedAt,
      missed: editingGoal?.missed,
    };

    onSave(newGoal);
    onClose();
  };

  const isEditing = !!editingGoal;
  const modalTitle = isEditing ? 'Doel bewerken' : 'Nieuw doel toevoegen';

  return (
    <BaseModal visible={visible} onClose={onClose} title={modalTitle}>
      {/* Custom Form - Always visible */}
      <View style={styles.formSection}>
        <Input
          label="Doel titel *"
          value={formData.title}
          onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
          placeholder="Bijv. Voor 09:00 opstaan"
          error={titleError}
        />

        {/* Live detectie feedback */}
        {detectedCategory && (
          <View style={styles.detectionFeedback}>
            <View style={styles.detectionContent}>
              <Text style={styles.detectionText}>
                💡 <Text style={styles.detectionBold}>Gedetecteerd:</Text> {GOAL_CATEGORIES.find(cat => cat.value === detectedCategory.category)?.label}
                {detectedCategory.subcategory && (
                  <Text style={styles.detectionSubcategory}> → {CategorySystemHelper.getSubcategoryLabel(detectedCategory.subcategory) || detectedCategory.subcategory}</Text>
                )}
              </Text>
              <TouchableOpacity
                style={styles.useDetectionButton}
                onPress={() => {
                  setFormData(prev => ({ 
                    ...prev, 
                    category: detectedCategory.category,
                    subcategory: detectedCategory.subcategory 
                  }));
                }}
              >
                <Text style={styles.useDetectionButtonText}>Gebruik</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Input
          label="Beschrijving (optioneel)"
          value={formData.description}
          onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
          placeholder="Extra details over je doel"
          multiline
          style={styles.textArea}
        />

        <Input
          label="Tijdslot (optioneel)"
          value={formData.timeSlot}
          onChangeText={(text) => setFormData(prev => ({ ...prev, timeSlot: text }))}
          placeholder="Bijv. 09:00-10:00 of voor 11:00"
        />

        {/* Category Selection */}
        <Select
          label="Categorie"
          value={formData.category}
          options={GOAL_CATEGORIES.map(cat => ({ value: cat.value, label: cat.label }))}
          onSelect={(value) => setFormData(prev => ({ 
            ...prev, 
            category: value as GoalCategory,
            subcategory: undefined // Reset subcategory when main category changes
          }))}
        />

        {/* Subcategorie selectie */}
        {availableSubcategories.length > 0 && (
          <Select
            label="Subcategorie (optioneel)"
            value={formData.subcategory || ''}
            options={[
              { value: '', label: 'Geen specifieke subcategorie' },
              ...availableSubcategories.map(sub => ({
                value: sub,
                label: CategorySystemHelper.getSubcategoryLabel(sub) || sub
              }))
            ]}
            onSelect={(value) => setFormData(prev => ({ 
              ...prev, 
              subcategory: value || undefined 
            }))}
          />
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title={isEditing ? "Wijzigingen opslaan" : "Doel toevoegen"}
            onPress={handleSubmit}
            disabled={!formData.title.trim()}
            style={styles.submitButton}
          />
          <Button
            title="Annuleren"
            onPress={onClose}
            variant="outline"
            style={styles.cancelButton}
          />
        </View>
      </View>

      {/* Quick Suggestions - Only for new goals */}
      {!isEditing && (
        <View style={styles.suggestionsSection}>
          <TouchableOpacity
            style={styles.suggestionsToggle}
            onPress={() => setShowQuickSuggestions(!showQuickSuggestions)}
          >
            <Text style={styles.suggestionsToggleText}>Snelle suggesties</Text>
            <Ionicons 
              name={showQuickSuggestions ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#3B82F6" 
            />
          </TouchableOpacity>

          {showQuickSuggestions && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Snelle doelen:</Text>
              {QUICK_GOAL_SUGGESTIONS.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => handleAddQuickGoal(suggestion)}
                >
                  <View style={styles.suggestionContent}>
                    <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                    {suggestion.timeSlot && (
                      <Text style={styles.suggestionTime}>⏰ {suggestion.timeSlot}</Text>
                    )}
                  </View>
                  <Text style={styles.suggestionCategory}>
                    {GOAL_CATEGORIES.find(cat => cat.value === suggestion.category)?.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  formSection: {
    marginBottom: 24,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  detectionFeedback: {
    marginTop: 8,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
  },
  detectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detectionText: {
    fontSize: 14,
    color: '#166534',
    flex: 1,
  },
  detectionBold: {
    fontWeight: '600',
  },
  detectionSubcategory: {
    color: '#059669',
  },
  useDetectionButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  useDetectionButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  submitButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
  suggestionsSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  suggestionsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 8,
  },
  suggestionsToggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3B82F6',
  },
  suggestionsContainer: {
    marginTop: 16,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 12,
  },
  suggestionItem: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  suggestionTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  suggestionCategory: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3B82F6',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
});
