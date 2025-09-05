import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Goal, GoalCategory } from '../../types';
import { CategorySystemHelper } from '../../lib/category-system';
import { DataService, CategoryDetectionEngine } from '../../lib/data-service';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

const { height: screenHeight } = Dimensions.get('window');

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
  const scrollViewRef = useRef<ScrollView>(null);
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
    // Vul de form in met de suggestie
    setFormData(prev => ({
      ...prev,
      title: suggestion.title,
      timeSlot: suggestion.timeSlot,
      category: suggestion.category,
    }));
    
    // Sluit de suggesties
    setShowQuickSuggestions(false);
    
    // Scroll naar boven zodat gebruiker ziet dat form is ingevuld
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, 100);
  };

  const isEditing = !!editingGoal;
  const modalTitle = isEditing ? 'Doel bewerken' : 'Nieuw doel toevoegen';

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
                colors={['rgba(255, 255, 255, 0.98)', 'rgba(255, 255, 255, 0.95)']}
                style={styles.modalGradient}
              />
              
              {/* Premium Header - exact zoals MissGoalModal */}
              <View style={styles.header}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <View style={styles.closeButtonBackground}>
                    <Ionicons name="close" size={20} color="#64748b" />
                  </View>
                </TouchableOpacity>
                <View style={styles.headerText}>
                  <Text style={styles.title}>{modalTitle}</Text>
                  <Text style={styles.subtitle}>
                    {isEditing ? "Pas je doel aan" : "Voeg een nieuw doel toe aan je planning"}
                  </Text>
                </View>
              </View>
              
              <ScrollView 
                ref={scrollViewRef}
                style={styles.scrollView} 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Custom Form - Always visible */}
                <View style={styles.formSection}>
                  <Input
                    label="Doel titel *"
                    value={formData.title}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                    placeholder="Bijv. Voor 09:00 opstaan"
                    error={titleError}
                    scrollViewRef={scrollViewRef}
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
                    scrollViewRef={scrollViewRef}
                  />

                  <Input
                    label="Tijdslot (optioneel)"
                    value={formData.timeSlot}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, timeSlot: text }))}
                    placeholder="Bijv. 09:00-10:00 of voor 11:00"
                    scrollViewRef={scrollViewRef}
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
                      title="Annuleren"
                      onPress={onClose}
                      variant="outline"
                      style={styles.cancelButton}
                    />
                    <Button
                      title={isEditing ? "Wijzigingen opslaan" : "Doel toevoegen"}
                      onPress={handleSubmit}
                      disabled={!formData.title.trim()}
                      style={styles.submitButton}
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
                              <Text style={styles.suggestionCategory}>
                                {GOAL_CATEGORIES.find(cat => cat.value === suggestion.category)?.label}
                              </Text>
                            </View>
                            <View style={styles.suggestionAction}>
                              <Ionicons name="add-circle" size={24} color="#667eea" />
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
}const styles = StyleSheet.create({
  // Modal structure - exact zoals MissGoalModal
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 8,
  },
  modal: {
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
    backgroundColor: 'transparent',
  },
  modalGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  
  // Premium Header - exact zoals MissGoalModal
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
  closeButton: {
    marginRight: 16,
    padding: 4,
  },
  closeButtonBackground: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(100, 116, 139, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.12)',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
    letterSpacing: -0.5,
    flexShrink: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    flexShrink: 1,
  },

  // ScrollView styling
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
    position: 'relative',
    zIndex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
    flexGrow: 1,
  },

  // Form content styles
  formSection: {
    marginBottom: 24,
    paddingHorizontal: 24,
    paddingTop: 8,
    position: 'relative',
    zIndex: 1,
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
    marginTop: 32,
    paddingHorizontal: 24,
  },
  suggestionsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    shadowColor: 'rgba(99, 102, 241, 0.15)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  suggestionsToggleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.4,
  },
  suggestionsContainer: {
    marginTop: 16,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 24,
    shadowColor: 'rgba(99, 102, 241, 0.12)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 20,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  suggestionItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionAction: {
    marginLeft: 12,
    padding: 4,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  suggestionTime: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  suggestionCategory: {
    fontSize: 11,
    fontWeight: '600',
    color: '#667eea',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.2)',
  },
});
