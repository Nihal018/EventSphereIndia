import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList, EventCategory, Event } from '../../types';
import { useEvents } from '../../contexts/EventsContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

type EditEventScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'EditEvent'
>;

type EditEventScreenRouteProp = RouteProp<MainStackParamList, 'EditEvent'>;

interface EditEventFormData {
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  time: string;
  venue: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  capacity: string;
  price: string;
  tags: string;
  eventType: string;
  ageRestriction: string;
  refundPolicy: string;
}

const eventCategories: EventCategory[] = [
  'Music', 'Technology', 'Business', 'Arts', 'Sports', 'Food',
  'Health', 'Education', 'Entertainment', 'Comedy', 'Theatre', 'Workshop'
];

const EditEventScreen: React.FC = () => {
  const navigation = useNavigation<EditEventScreenNavigationProp>();
  const route = useRoute<EditEventScreenRouteProp>();
  const { updateEvent, getEventById, crudLoading, crudError } = useEvents();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<EditEventFormData>({
    title: '',
    description: '',
    category: 'Music',
    date: '',
    time: '',
    venue: {
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
    },
    capacity: '',
    price: '',
    tags: '',
    eventType: 'offline',
    ageRestriction: 'all',
    refundPolicy: 'Standard refund policy applies',
  });

  useEffect(() => {
    loadEventData();
  }, [route.params.eventId]);

  const loadEventData = async () => {
    try {
      const eventData = await getEventById(route.params.eventId);
      if (eventData) {
        setEvent(eventData);
        
        // Format date for display (assuming event.date is a Date or ISO string)
        const eventDate = new Date(eventData.date);
        const formattedDate = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        setFormData({
          title: eventData.title,
          description: eventData.description,
          category: eventData.category,
          date: formattedDate,
          time: eventData.time,
          venue: {
            name: eventData.venue.name,
            address: eventData.venue.address,
            city: eventData.venue.city,
            state: eventData.venue.state,
            zipCode: eventData.venue.pincode || '',
          },
          capacity: eventData.capacity.toString(),
          price: eventData.isFree ? '0' : eventData.price.min.toString(),
          tags: eventData.tags.join(', '),
          eventType: 'offline', // Default, as this might not be in the Event type
          ageRestriction: 'all', // Default, as this might not be in the Event type
          refundPolicy: 'Standard refund policy applies', // Default
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load event data');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof EditEventFormData],
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
        return formData.date !== '' && formData.time !== '';
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
    if (!user || !event) {
      Alert.alert('Error', 'Unable to update event');
      return;
    }

    try {
      const updates = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        date: formData.date,
        time: formData.time,
        venue: {
          ...formData.venue,
          pincode: formData.venue.zipCode,
        },
        capacity: Number(formData.capacity),
        price: Number(formData.price),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };

      const result = await updateEvent(event.id, updates, user.id);
      
      if (result) {
        Alert.alert(
          'Success',
          'Event updated successfully!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', crudError || 'Failed to update event');
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

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Date & Time</Text>
      
      <Text style={styles.label}>Event Date *</Text>
      <TextInput
        style={styles.input}
        value={formData.date}
        onChangeText={(value) => updateFormData('date', value)}
        placeholder="YYYY-MM-DD"
      />

      <Text style={styles.label}>Event Time *</Text>
      <TextInput
        style={styles.input}
        value={formData.time}
        onChangeText={(value) => updateFormData('time', value)}
        placeholder="HH:MM (24-hour format)"
      />

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

      <Text style={styles.label}>Ticket Price (INR)</Text>
      <TextInput
        style={styles.input}
        value={formData.price}
        onChangeText={(value) => updateFormData('price', value)}
        placeholder="Enter ticket price (0 for free)"
        keyboardType="numeric"
      />

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

  if (loading || crudLoading) {
    return <LoadingSpinner text={loading ? "Loading event..." : "Updating event..."} overlay />;
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Event not found</Text>
          <TouchableOpacity style={styles.errorButton} onPress={() => navigation.goBack()}>
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Event</Text>
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
              <Text style={styles.navButtonTextPrimary}>Update Event</Text>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 16,
  },
  errorButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditEventScreen;