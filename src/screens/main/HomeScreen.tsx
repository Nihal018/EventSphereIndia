import React, { useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  FlatList, // Import FlatList
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  CompositeNavigationProp,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

// Import the updated ParamList types and Event type
import {
  RootStackParamList,
  MainTabParamList,
  MainStackParamList,
  Event,
} from "../../types";

// Import the new specific contexts
import { useUI } from "../../contexts/UIContext";
import { useEvents } from "../../contexts/EventsContext";
import { useFilters } from "../../contexts/FiltersContext";

import { categories } from "../../data/mockData";
import EventList from "../../components/events/EventList"; // Keep EventList for horizontal lists
import EventCard from "../../components/events/EventCard"; // Import EventCard for the main list
import CategoryFilter from "../../components/events/CategoryFilter";
import SearchBar from "../../components/common/SearchBar";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorBoundary from "../../components/common/ErrorBoundary";

// Correct the navigation prop type for HomeScreen
type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "Home">,
  NativeStackNavigationProp<MainStackParamList>
>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const {
    refreshing,
    setRefreshing,
    setGlobalError,
    clearErrors: clearGlobalErrors,
  } = useUI();
  const { selectedCategory, searchQuery, setCategory, setSearchQuery } =
    useFilters();
  const {
    events,
    featuredEvents,
    eventsLoading,
    eventsError,
    totalEvents,
    fetchEvents,
    fetchFeaturedEvents,
    toggleLikeEvent,
    isEventLiked,
    clearEventsError,
  } = useEvents();

  const nearbyEvents = useMemo(() => events.slice(0, 3), [events]);

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([fetchEvents(), fetchFeaturedEvents()]);
      } catch (error) {
        console.error("Failed to initialize home screen data:", error);
      }
    };
    initializeData();
  }, [fetchEvents, fetchFeaturedEvents]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchEvents(), fetchFeaturedEvents()]);
    } catch (error) {
      console.error("Error during home screen refresh:", error);
      clearGlobalErrors();
      setGlobalError("Failed to refresh data. Please try again.");
    } finally {
      setRefreshing(false);
    }
  }, [
    setRefreshing,
    fetchEvents,
    fetchFeaturedEvents,
    clearGlobalErrors,
    setGlobalError,
  ]);

  // Handle event press
  const handleEventPress = useCallback(
    (event: Event) => {
      navigation.navigate("EventDetails", { eventId: event.id });
    },
    [navigation]
  );

  // Handle search press
  const handleSearchPress = useCallback(() => {
    navigation.navigate("Search");
  }, [navigation]);

  // Handle filter press
  const handleFilterPress = useCallback(() => {
    console.log("Filter pressed");
  }, []);

  // Handle category selection
  const handleCategorySelect = useCallback(
    (category: string | null) => {
      setCategory(category as any);
    },
    [setCategory]
  );

  // Handle search query change
  const handleSearchQueryChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
    },
    [setSearchQuery]
  );

  // Handle like event
  const handleLikeEvent = useCallback(
    (eventId: string) => {
      toggleLikeEvent(eventId);
    },
    [toggleLikeEvent]
  );

  // Memoized stats
  const stats = useMemo(
    () => ({
      totalEvents: totalEvents,
      cities: new Set(events.map((event) => event.venue.city)).size,
    }),
    [events, totalEvents]
  );

  // Render each individual EventCard for the main FlatList
  const renderEventItem = useCallback(
    ({ item }: { item: Event }) => (
      <View className="px-5 pb-4">
        <EventCard
          event={item}
          onPress={handleEventPress}
          onLike={handleLikeEvent}
          isLiked={isEventLiked?.(item.id)}
          variant="default" // Assuming 'default' is the vertical card style
        />
      </View>
    ),
    [handleEventPress, handleLikeEvent, isEventLiked]
  );

  // Render the header and other static content for the FlatList
  const renderListHeader = useCallback(
    () => (
      <View>
        {/* Header */}
        <View className="px-5 py-4">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-2xl font-bold text-gray-900 ml-1">
                Discover Events
              </Text>
              <Text className="text-gray-500 mt-1 ml-1">
                Find amazing events near you
              </Text>
            </View>
            <TouchableOpacity
              className="p-2"
              accessibilityLabel="Notifications"
              accessibilityHint="View your notifications"
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#1f2937"
              />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <SearchBar
            value={searchQuery}
            onChangeText={handleSearchQueryChange}
            onSearch={handleSearchPress}
            onFilter={handleFilterPress}
            placeholder="Search events, venues, or cities"
          />
        </View>

        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />

        {/* Loading State for initial fetch (if no events are loaded yet) */}
        {eventsLoading && events.length === 0 && (
          <View className="flex-1 justify-center items-center py-20">
            <LoadingSpinner text="Loading events..." />
          </View>
        )}

        {/* Featured Events (uses horizontal EventList) */}
        {featuredEvents.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center justify-between px-5 mb-4">
              <Text className="text-xl font-bold text-gray-900 ml-1">
                Featured Events
              </Text>
              <TouchableOpacity
                accessibilityLabel="View all featured events"
                accessibilityRole="button"
              >
                <Text className="text-primary-500 font-semibold">See All</Text>
              </TouchableOpacity>
            </View>

            <EventList
              events={featuredEvents}
              onEventPress={handleEventPress}
              onLike={handleLikeEvent}
              isLiked={isEventLiked}
              variant="featured"
              horizontal
              style={{}}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}

        {/* Stats Cards */}
        <View className="px-5 mb-6">
          <View className="flex-row space-x-4">
            <Card style={{ flex: 1 }} padding="md" className="mx-2">
              <View className="items-center">
                <Ionicons name="calendar" size={24} color="#0ea5e9" />
                <Text className="text-2xl font-bold text-gray-900 mt-2">
                  {stats.totalEvents}
                </Text>
                <Text className="text-gray-500 text-sm">Events Available</Text>
              </View>
            </Card>

            <Card style={{ flex: 1 }} padding="md">
              <View className="items-center">
                <Ionicons name="location" size={24} color="#f37316" />
                <Text className="text-2xl font-bold text-gray-900 mt-2">
                  {stats.cities}
                </Text>
                <Text className="text-gray-500 text-sm">Cities Covered</Text>
              </View>
            </Card>
          </View>
        </View>

        {/* Nearby Events (uses horizontal EventList) */}
        {nearbyEvents.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center justify-between px-5 mb-4">
              <Text className="text-xl font-bold text-gray-900 ml-1">
                Events Near You
              </Text>
              <TouchableOpacity
                accessibilityLabel="View all nearby events"
                accessibilityRole="button"
              >
                <Text className="text-primary-500 font-semibold">See All</Text>
              </TouchableOpacity>
            </View>

            <EventList
              events={nearbyEvents}
              onEventPress={handleEventPress}
              onLike={handleLikeEvent}
              isLiked={isEventLiked}
              variant="compact"
              style={{ paddingHorizontal: 20 }}
            />
          </View>
        )}

        {/* All Events Header (for the list below) */}
        <View className="px-5 mb-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-900 ml-1">
              {selectedCategory ? `${selectedCategory} Events` : "All Events"}
            </Text>
            <Text className="text-gray-500">{totalEvents} events</Text>
          </View>
        </View>
      </View>
    ),
    [
      searchQuery,
      handleSearchQueryChange,
      handleSearchPress,
      handleFilterPress,
      selectedCategory,
      handleCategorySelect,
      eventsLoading,
      events,
      featuredEvents,
      handleEventPress,
      handleLikeEvent,
      isEventLiked,
      stats.totalEvents,
      stats.cities,
      nearbyEvents,
      totalEvents,
    ]
  );

  // Error state display
  if (eventsError) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text className="text-xl font-bold text-gray-900 mt-4 text-center">
            Something went wrong
          </Text>
          <Text className="text-gray-600 text-center mt-2">{eventsError}</Text>
          <TouchableOpacity
            onPress={clearEventsError}
            className="mt-6 bg-primary-500 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fafafa" }}>
        <FlatList // Main vertical FlatList for 'All Events'
          data={events} // The main data source for the FlatList
          keyExtractor={(item) => item.id}
          renderItem={renderEventItem}
          ListHeaderComponent={renderListHeader} // All static content goes here
          ListEmptyComponent={() =>
            // Handles the case when 'events' is empty
            !eventsLoading && (
              <View className="flex-1 justify-center items-center py-20 px-5">
                <Text className="text-gray-600 text-center text-lg">
                  {selectedCategory
                    ? `No ${selectedCategory.toLowerCase()} events found`
                    : "No events found"}
                </Text>
              </View>
            )
          }
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#0ea5e9"]}
              tintColor="#0ea5e9"
            />
          }
          // Optimization props for FlatList
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
        />
      </SafeAreaView>
    </ErrorBoundary>
  );
};

export default React.memo(HomeScreen);
