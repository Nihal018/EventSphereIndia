import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import { useEvents } from "../../hooks/useEvents";
import { categories, cities } from "../../data/mockData";
import EventList from "../../components/events/EventList";
import SearchBar from "../../components/common/SearchBar";
import Header from "../../components/common/Header";
import Button from "../../components/common/Button";
import Modal from "react-native-modal";
import { useFilters } from "../../contexts/FiltersContext";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainTabParamList, MainStackParamList, Event } from "../../types";
type SearchScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "Search">,
  NativeStackNavigationProp<MainStackParamList>
>;

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const {
    searchQuery,
    selectedCategory,
    selectedCity,
    setSearchQuery,
    setCategory,
    setCity,
    clearFilters,
  } = useFilters();
  const { events, isEventLiked, toggleLikeEvent } = useEvents();
  const [showFilters, setShowFilters] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

  const handleEventPress = useCallback(
    (event: any) => {
      navigation.navigate("EventDetails", { eventId: event.id });
    },
    [navigation]
  );

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const toggleFilters = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);

  const applyFilters = useCallback(
    (category: string | null, city: string | null) => {
      setCategory(category as any);
      setCity(city);
      setShowFilters(false);
    },
    [setCategory, setCity]
  );

  useEffect(() => {
    const fEvents = events.filter((event) => {
      if (
        event.venue.city
          .toLowerCase()
          .includes(selectedCity ? selectedCity.toLowerCase() : "") ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.category
          .toLowerCase()
          .includes(selectedCategory ? selectedCategory.toLowerCase() : "") ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return event;
      }
    });

    setFilteredEvents(fEvents);
  }, [selectedCategory, selectedCity, searchQuery]);

  const FilterModal = () => (
    <Modal
      isVisible={showFilters}
      onBackdropPress={() => setShowFilters(false)}
      style={{ margin: 0, justifyContent: "flex-end" }}
    >
      <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-xl font-bold">Filters</Text>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3">Category</Text>
            <View className="flex-row flex-wrap gap-2">
              <TouchableOpacity
                onPress={() => applyFilters(null, selectedCity)}
                className={`px-4 py-2 rounded-full border ${
                  !selectedCategory
                    ? "bg-primary-500 border-primary-500"
                    : "border-gray-300"
                }`}
              >
                <Text
                  className={!selectedCategory ? "text-white" : "text-gray-600"}
                >
                  All
                </Text>
              </TouchableOpacity>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => applyFilters(category, selectedCity)}
                  className={`px-4 py-2 rounded-full border ${
                    selectedCategory === category
                      ? "bg-primary-500 border-primary-500"
                      : "border-gray-300"
                  }`}
                >
                  <Text
                    className={
                      selectedCategory === category
                        ? "text-white"
                        : "text-gray-600"
                    }
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3">City</Text>
            <View className="flex-row flex-wrap gap-2">
              <TouchableOpacity
                onPress={() => applyFilters(selectedCategory, null)}
                className={`px-4 py-2 rounded-full border ${
                  !selectedCity
                    ? "bg-primary-500 border-primary-500"
                    : "border-gray-300"
                }`}
              >
                <Text
                  className={!selectedCity ? "text-white" : "text-gray-600"}
                >
                  All Cities
                </Text>
              </TouchableOpacity>
              {cities.map((city) => (
                <TouchableOpacity
                  key={city}
                  onPress={() => applyFilters(selectedCategory, city)}
                  className={`px-4 py-2 rounded-full border ${
                    selectedCity === city
                      ? "bg-primary-500 border-primary-500"
                      : "border-gray-300"
                  }`}
                >
                  <Text
                    className={
                      selectedCity === city ? "text-white" : "text-gray-600"
                    }
                  >
                    {city}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View className="flex-row space-x-3 mt-4">
          <Button
            title="Clear All"
            onPress={() => {
              clearFilters();
              setShowFilters(false);
            }}
            variant="outline"
            style={{ flex: 1 }}
          />
          <Button
            title="Apply"
            onPress={() => setShowFilters(false)}
            gradient
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </Modal>
  );

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
                  onPress={() => setCategory(null)}
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
                  onPress={() => setCity(null)}
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
      <FilterModal />
    </SafeAreaView>
  );
};

export default React.memo(SearchScreen);
