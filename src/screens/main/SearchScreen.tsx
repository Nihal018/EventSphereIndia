import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import { useEvents } from "../../contexts/EventsContext"; // Corrected import path
import { categories, cities } from "../../data/mockData";
import EventList from "../../components/events/EventList";
import SearchBar from "../../components/common/SearchBar";
import Header from "../../components/common/Header";
import Button from "../../components/common/Button";
// import Modal from "react-native-modal"; // No longer needed directly here
import { useFilters } from "../../contexts/FiltersContext"; // Corrected import path
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  MainTabParamList,
  MainStackParamList,
  Event,
  EventCategory,
} from "../../types";

// Import the new FilterModal component
import FilterModal from "../../components/common/FilterModal";

type SearchScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "Search">,
  NativeStackNavigationProp<MainStackParamList>
>;

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();

  // Global filter state from context
  const {
    searchQuery,
    selectedCategory,
    selectedCity,
    setSearchQuery,
    setCategory,
    setCity,
    clearFilters,
  } = useFilters();

  // Event data from context
  const { events, isEventLiked, toggleLikeEvent } = useEvents();

  // Local state for controlling the visibility of the filter modal
  const [showFilters, setShowFilters] = useState(false);

  // State for filtered events based on applied filters
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

  // Effect to update local modal state when global filters change (e.g., when navigating back from another screen)
  useEffect(() => {
    setCity(selectedCity);
    setCategory(selectedCategory);
  }, [selectedCity, selectedCategory]);

  // Effect to filter events based on the *applied* filters (selectedCategory, selectedCity, searchQuery)
  useEffect(() => {
    const fEvents = events.filter((event) => {
      const matchesCategory = selectedCategory
        ? event.category.toLowerCase() === selectedCategory.toLowerCase()
        : true; // If no category selected, all categories match

      const matchesCity = selectedCity
        ? event.venue.city.toLowerCase() === selectedCity.toLowerCase()
        : true; // If no city selected, all cities match

      const matchesSearchQuery = searchQuery
        ? event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.venue.city.toLowerCase().includes(searchQuery.toLowerCase())
        : true; // If no search query, all events match

      return matchesCategory && matchesCity && matchesSearchQuery;
    });

    setFilteredEvents(fEvents);
  }, [events, selectedCategory, selectedCity, searchQuery]); // Dependencies are the *applied* filters

  const handleEventPress = useCallback(
    (event: Event) => {
      // Ensure 'event' is typed as Event
      navigation.navigate("EventDetails", { eventId: event.id });
    },
    [navigation]
  );

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const toggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
    // When opening the modal, ensure local state reflects current applied filters
    if (!showFilters) {
      setCity(selectedCity);
      setCategory(selectedCategory);
    }
  }, [showFilters, selectedCity, selectedCategory]);

  // This function is passed to FilterModal and called when 'Apply' is clicked
  const handleApplyFilters = useCallback(
    (category: EventCategory | null, city: string | null) => {
      setCategory(category); // Update global context
      setCity(city); // Update global context
      // setShowFilters(false); // Modal will close via onClose prop
    },
    [setCategory, setCity]
  );

  // This function is passed to FilterModal and called when 'Clear All' is clicked
  const handleClearAllFilters = useCallback(() => {
    clearFilters(); // Clear global context
    // setShowFilters(false); // Modal will close via onClose prop
  }, [clearFilters]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* <Header
        style={{ height: 60 }}
        title="Search Events"
        showBack
        onLeftPress={handleBack}
      /> */}

      <View className="px-5 pb-4">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFilter={toggleFilters}
          placeholder="Search events, venues, cities..."
          autoFocus
        />
      </View>

      {(selectedCategory || selectedCity) && (
        <View className="px-5 pb-4">
          <View className="flex-row items-center flex-wrap gap-2">
            <Text className="text-gray-600">Active filters:</Text>
            {selectedCategory && (
              <View className="bg-primary-100 px-3 py-1 rounded-full flex-row items-center">
                <Text className="text-primary-700 text-sm">
                  {selectedCategory}
                </Text>
                <TouchableOpacity
                  onPress={() => setCategory(null)} // Directly clear global filter
                  className="ml-2"
                >
                  <Ionicons name="close" size={14} color="#0369a1" />
                </TouchableOpacity>
              </View>
            )}
            {selectedCity && (
              <View className="bg-accent-100 px-3 py-1 rounded-full flex-row items-center">
                <Text className="text-accent-700 text-sm">{selectedCity}</Text>
                <TouchableOpacity
                  onPress={() => setCity(null)} // Directly clear global filter
                  className="ml-2"
                >
                  <Ionicons name="close" size={14} color="#c14706" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      <EventList
        events={filteredEvents}
        numColumns={2}
        onEventPress={handleEventPress}
        onLike={toggleLikeEvent}
        style={{ paddingHorizontal: 0, marginBottom: 0 }}
        isLiked={isEventLiked}
        emptyMessage="No events found matching your search"
      />

      {/* Render the FilterModal component */}
      <FilterModal
        isVisible={showFilters}
        onClose={() => setShowFilters(false)} // Callback to close modal
        onApply={handleApplyFilters} // Callback for Apply button
        onClearAll={handleClearAllFilters} // Callback for Clear All button
        categories={categories}
        cities={cities}
      />
    </SafeAreaView>
  );
};

export default React.memo(SearchScreen);
