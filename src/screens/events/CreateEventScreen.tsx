import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList, EventCategory } from '../../types';
import { useEvents } from '../../contexts/EventsContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

type CreateEventScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'CreateEvent'
>;

interface CreateEventFormData {
  title: string;
  description: string;
  category: EventCategory;
  date: Date | null;
  time: Date | null;
  venue: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  capacity: string;
  price: string;
  isFree: boolean;
  tags: string;
  eventType: string;
  ageRestriction: string;
  refundPolicy: string;
}

const eventCategories: EventCategory[] = [
  'Music', 'Technology', 'Business', 'Arts', 'Sports', 'Food',
  'Health', 'Education', 'Entertainment', 'Comedy', 'Theatre', 'Workshop'
];

const CreateEventScreen: React.FC = () => {
  const navigation = useNavigation<CreateEventScreenNavigationProp>();
  const { createEvent, crudLoading, crudError } = useEvents();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [formData, setFormData] = useState<CreateEventFormData>({
    title: '',
    description: '',
    category: 'Music',
    date: null,
    time: null,
    venue: {
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
    },
    capacity: '',
    price: '',
    isFree: false,
    tags: '',
    eventType: 'offline',
    ageRestriction: 'all',
    refundPolicy: 'Standard refund policy applies',
  });

  const updateFormData = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof CreateEventFormData] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.title.trim() !== '' && formData.description.trim() !== '';
      case 2:
        return formData.date !== null && formData.time !== null;
      case 3:
        return formData.venue.name.trim() !== '' && 
               formData.venue.address.trim() !== '' &&
               formData.venue.city.trim() !== '';
      case 4:
        return formData.capacity !== '' && !isNaN(Number(formData.capacity));
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      Alert.alert('Error', 'Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create an event');
      return;
    }

    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        date: formData.date ? formData.date.toISOString().split('T')[0] : '',
        time: formData.time ? formData.time.toTimeString().split(' ')[0].substring(0, 5) : '',
        venue: formData.venue,
        capacity: Number(formData.capacity),
        price: formData.isFree ? 0 : Number(formData.price),
        organizerId: user.id,
        organizerName: user.name,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        eventType: formData.eventType,
        ageRestriction: formData.ageRestriction,
        refundPolicy: formData.refundPolicy,
      };

      const result = await createEvent(eventData);
      
      if (result) {
        Alert.alert(
          'Success',
          'Event created successfully!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', crudError || 'Failed to create event');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      
      <Text style={styles.label}>Event Title *</Text>
      <TextInput
        style={styles.input}
        value={formData.title}
        onChangeText={(value) => updateFormData('title', value)}
        placeholder="Enter event title"
        maxLength={100}
      />

      <Text style={styles.label}>Description *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={formData.description}
        onChangeText={(value) => updateFormData('description', value)}
        placeholder="Describe your event"
        multiline
        numberOfLines={4}
        maxLength={500}
      />

      <Text style={styles.label}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        {eventCategories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              formData.category === category && styles.categoryButtonActive
            ]}
            onPress={() => updateFormData('category', category)}
          >
            <Text style={[
              styles.categoryButtonText,
              formData.category === category && styles.categoryButtonTextActive
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      updateFormData('date', selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      updateFormData('time', selectedTime);
    }
  };

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Date & Time</Text>
      
      <Text style={styles.label}>Event Date *</Text>
      <TouchableOpacity
        style={[styles.dateTimeButton, !formData.date && styles.dateTimeButtonEmpty]}
        onPress={() => setShowDatePicker(true)}
      >
        <View style={styles.dateTimeButtonContent}>
          <Ionicons 
            name="calendar-outline" 
            size={20} 
            color={formData.date ? '#0ea5e9' : '#9ca3af'} 
          />
          <Text style={[styles.dateTimeButtonText, !formData.date && styles.dateTimeButtonTextEmpty]}>
            {formData.date ? formatDate(formData.date) : 'Select event date'}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color="#9ca3af" />
      </TouchableOpacity>

      <Text style={styles.label}>Event Time *</Text>
      <TouchableOpacity
        style={[styles.dateTimeButton, !formData.time && styles.dateTimeButtonEmpty]}
        onPress={() => setShowTimePicker(true)}
      >
        <View style={styles.dateTimeButtonContent}>
          <Ionicons 
            name="time-outline" 
            size={20} 
            color={formData.time ? '#0ea5e9' : '#9ca3af'} 
          />
          <Text style={[styles.dateTimeButtonText, !formData.time && styles.dateTimeButtonTextEmpty]}>
            {formData.time ? formatTime(formData.time) : 'Select event time'}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color="#9ca3af" />
      </TouchableOpacity>

      {formData.date && formData.time && (
        <View style={styles.dateTimeSummary}>
          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          <View style={styles.dateTimeSummaryContent}>
            <Text style={styles.dateTimeSummaryTitle}>Event Scheduled</Text>
            <Text style={styles.dateTimeSummaryText}>
              {formatDate(formData.date)} at {formatTime(formData.time)}
            </Text>
          </View>
        </View>
      )}

      <Text style={styles.label}>Event Type</Text>
      <View style={styles.radioContainer}>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => updateFormData('eventType', 'offline')}
        >
          <View style={[styles.radio, formData.eventType === 'offline' && styles.radioActive]} />
          <Text style={styles.radioText}>Offline Event</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => updateFormData('eventType', 'online')}
        >
          <View style={[styles.radio, formData.eventType === 'online' && styles.radioActive]} />
          <Text style={styles.radioText}>Online Event</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.date || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Time Picker Modal */}
      {showTimePicker && (
        <DateTimePicker
          value={formData.time || new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Venue Details</Text>
      
      <Text style={styles.label}>Venue Name *</Text>
      <TextInput
        style={styles.input}
        value={formData.venue.name}
        onChangeText={(value) => updateFormData('venue.name', value)}
        placeholder="Enter venue name"
      />

      <Text style={styles.label}>Address *</Text>
      <TextInput
        style={styles.input}
        value={formData.venue.address}
        onChangeText={(value) => updateFormData('venue.address', value)}
        placeholder="Enter full address"
      />

      <Text style={styles.label}>City *</Text>
      <TextInput
        style={styles.input}
        value={formData.venue.city}
        onChangeText={(value) => updateFormData('venue.city', value)}
        placeholder="Enter city"
      />

      <Text style={styles.label}>State</Text>
      <TextInput
        style={styles.input}
        value={formData.venue.state}
        onChangeText={(value) => updateFormData('venue.state', value)}
        placeholder="Enter state"
      />

      <Text style={styles.label}>ZIP Code</Text>
      <TextInput
        style={styles.input}
        value={formData.venue.zipCode}
        onChangeText={(value) => updateFormData('venue.zipCode', value)}
        placeholder="Enter ZIP code"
        keyboardType="numeric"
      />
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Pricing & Capacity</Text>
      
      <Text style={styles.label}>Capacity *</Text>
      <TextInput
        style={styles.input}
        value={formData.capacity}
        onChangeText={(value) => updateFormData('capacity', value)}
        placeholder="Maximum number of attendees"
        keyboardType="numeric"
      />

      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => updateFormData('isFree', !formData.isFree)}
        >
          <View style={[styles.checkboxBox, formData.isFree && styles.checkboxActive]}>
            {formData.isFree && <Ionicons name="checkmark" size={16} color="white" />}
          </View>
          <Text style={styles.checkboxText}>This is a free event</Text>
        </TouchableOpacity>
      </View>

      {!formData.isFree && (
        <>
          <Text style={styles.label}>Ticket Price (INR)</Text>
          <TextInput
            style={styles.input}
            value={formData.price}
            onChangeText={(value) => updateFormData('price', value)}
            placeholder="Enter ticket price"
            keyboardType="numeric"
          />
        </>
      )}

      <Text style={styles.label}>Tags (comma separated)</Text>
      <TextInput
        style={styles.input}
        value={formData.tags}
        onChangeText={(value) => updateFormData('tags', value)}
        placeholder="e.g., live music, outdoor, family-friendly"
      />

      <Text style={styles.label}>Age Restriction</Text>
      <View style={styles.radioContainer}>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => updateFormData('ageRestriction', 'all')}
        >
          <View style={[styles.radio, formData.ageRestriction === 'all' && styles.radioActive]} />
          <Text style={styles.radioText}>All Ages</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => updateFormData('ageRestriction', '18+')}
        >
          <View style={[styles.radio, formData.ageRestriction === '18+' && styles.radioActive]} />
          <Text style={styles.radioText}>18+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => updateFormData('ageRestriction', '21+')}
        >
          <View style={[styles.radio, formData.ageRestriction === '21+' && styles.radioActive]} />
          <Text style={styles.radioText}>21+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (crudLoading) {
    return <LoadingSpinner text="Creating event..." overlay />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Event</Text>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>{currentStep}/4</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </ScrollView>

        <View style={styles.navigation}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.navButton} onPress={prevStep}>
              <Text style={styles.navButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
          
          {currentStep < 4 ? (
            <TouchableOpacity 
              style={[styles.navButton, styles.navButtonPrimary]} 
              onPress={nextStep}
            >
              <Text style={styles.navButtonTextPrimary}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.navButton, styles.navButtonPrimary]} 
              onPress={handleSubmit}
            >
              <Text style={styles.navButtonTextPrimary}>Create Event</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  stepIndicator: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 16,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    marginTop: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  categoryButtonActive: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  radioContainer: {
    marginTop: 8,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
  },
  radioActive: {
    borderColor: '#0ea5e9',
    backgroundColor: '#0ea5e9',
  },
  radioText: {
    fontSize: 16,
    color: '#374151',
  },
  checkboxContainer: {
    marginTop: 8,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  checkboxText: {
    fontSize: 16,
    color: '#374151',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  navButtonPrimary: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  navButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: '#fff',
    marginBottom: 4,
  },
  dateTimeButtonEmpty: {
    borderColor: '#e5e7eb',
  },
  dateTimeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateTimeButtonText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  dateTimeButtonTextEmpty: {
    color: '#9ca3af',
  },
  dateTimeSummary: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  dateTimeSummaryContent: {
    flex: 1,
    marginLeft: 12,
  },
  dateTimeSummaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#15803d',
    marginBottom: 2,
  },
  dateTimeSummaryText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 18,
  },
});

export default CreateEventScreen;