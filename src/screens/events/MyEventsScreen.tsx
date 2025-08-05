import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList, Event } from '../../types';
import { useEvents } from '../../contexts/EventsContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

type MyEventsScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'MyEvents'
>;

const { width } = Dimensions.get('window');

const MyEventsScreen: React.FC = () => {
  const navigation = useNavigation<MyEventsScreenNavigationProp>();
  const { getEventsByOrganizer, deleteEvent, organizerEvents, organizerStats, crudLoading, crudError } = useEvents();
  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'cancelled'>('all');

  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadOrganizerEvents();
      }
    }, [user, filter])
  );

  const loadOrganizerEvents = async () => {
    if (!user) return;
    
    try {
      const status = filter === 'all' ? undefined : filter;
      await getEventsByOrganizer(user.id, status);
    } catch (error) {
      Alert.alert('Error', 'Failed to load your events');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrganizerEvents();
    setRefreshing(false);
  };

  const handleDeleteEvent = (event: Event) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${event.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteEvent(event.id, user?.id);
            if (success) {
              Alert.alert('Success', 'Event deleted successfully');
              loadOrganizerEvents(); // Refresh the list
            } else {
              Alert.alert('Error', crudError || 'Failed to delete event');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      case 'completed':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatPrice = (price: { min: number; max: number }) => {
    if (price.min === 0 && price.max === 0) return 'Free';
    if (price.min === price.max) return `₹${price.min}`;
    return `₹${price.min} - ₹${price.max}`;
  };

  const renderEventCard = (event: Event) => (
    <View key={event.id} style={styles.eventCard}>
      <View style={styles.eventImageContainer}>
        {event.images && event.images.length > 0 ? (
          <Image source={{ uri: event.images[0] }} style={styles.eventImage} />
        ) : (
          <View style={[styles.eventImage, styles.placeholderImage]}>
            <Ionicons name="image-outline" size={40} color="#9ca3af" />
          </View>
        )}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) }]}>
          <Text style={styles.statusText}>{event.status}</Text>
        </View>
      </View>

      <View style={styles.eventContent}>
        <Text style={styles.eventTitle} numberOfLines={2}>
          {event.title}
        </Text>
        
        <View style={styles.eventMeta}>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={16} color="#6b7280" />
            <Text style={styles.metaText}>{formatDate(event.date)} • {event.time}</Text>
          </View>
          
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={16} color="#6b7280" />
            <Text style={styles.metaText} numberOfLines={1}>
              {event.venue.city}, {event.venue.state}
            </Text>
          </View>
          
          <View style={styles.metaRow}>
            <Ionicons name="people-outline" size={16} color="#6b7280" />
            <Text style={styles.metaText}>
              {event.bookedCount}/{event.capacity} booked
            </Text>
          </View>
          
          <View style={styles.metaRow}>
            <Ionicons name="pricetag-outline" size={16} color="#6b7280" />
            <Text style={styles.metaText}>{formatPrice(event.price)}</Text>
          </View>
        </View>

        <View style={styles.eventActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('EventDetails', { eventId: event.id })}
          >
            <Ionicons name="eye-outline" size={18} color="#0ea5e9" />
            <Text style={styles.actionButtonText}>View</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('EditEvent', { eventId: event.id })}
          >
            <Ionicons name="create-outline" size={18} color="#059669" />
            <Text style={[styles.actionButtonText, { color: '#059669' }]}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteEvent(event)}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
            <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderStatsCard = () => {
    if (!organizerStats) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Your Event Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{organizerStats.total}</Text>
            <Text style={styles.statLabel}>Total Events</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{organizerStats.active}</Text>
            <Text style={styles.statLabel}>Active Events</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{organizerStats.totalBookings}</Text>
            <Text style={styles.statLabel}>Total Bookings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>₹{organizerStats.totalRevenue || 0}</Text>
            <Text style={styles.statLabel}>Total Revenue</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
        onPress={() => setFilter('all')}
      >
        <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
          All
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterButton, filter === 'active' && styles.filterButtonActive]}
        onPress={() => setFilter('active')}
      >
        <Text style={[styles.filterButtonText, filter === 'active' && styles.filterButtonTextActive]}>
          Active
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterButton, filter === 'cancelled' && styles.filterButtonActive]}
        onPress={() => setFilter('cancelled')}
      >
        <Text style={[styles.filterButtonText, filter === 'cancelled' && styles.filterButtonTextActive]}>
          Cancelled
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {crudLoading && !refreshing && (
        <LoadingSpinner text="Loading your events..." overlay />
      )}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Events</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateEvent')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderStatsCard()}
        {renderFilterButtons()}
        
        {organizerEvents.length > 0 ? (
          <View style={styles.eventsList}>
            {organizerEvents.map(renderEventCard)}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No Events Found</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'all' 
                ? "You haven't created any events yet"
                : `No ${filter} events found`
              }
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('CreateEvent')}
            >
              <Text style={styles.emptyButtonText}>Create Your First Event</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  createButton: {
    backgroundColor: '#0ea5e9',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 64) / 2,
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0ea5e9',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#fff',
  },
  filterButtonActive: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  eventsList: {
    paddingHorizontal: 16,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  eventImageContainer: {
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  placeholderImage: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  eventMeta: {
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
    flex: 1,
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0ea5e9',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyEventsScreen;