import { useMemo } from "react";

import { Event } from "../types";
import { useEvents as useEventsData } from "../contexts/EventsContext";
import { useFilters } from "../contexts/FiltersContext";

export const useEvents = () => {
  const {
    events,
    featuredEvents,
    likedEvents,
    eventsLoading,
    eventsError,
    fetchEvents,
    fetchFeaturedEvents,
    toggleLikeEvent,
  } = useEventsData();
  const { selectedCategory, searchQuery, selectedCity } = useFilters();

  // Filtered events based on search and filters
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        !searchQuery ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        !selectedCategory || event.category === selectedCategory;
      const matchesCity = !selectedCity || event.venue.city === selectedCity;

      return matchesSearch && matchesCategory && matchesCity;
    });
  }, [events, searchQuery, selectedCategory, selectedCity]);

  // Nearby events (mock logic for demonstration)
  const nearbyEvents = useMemo(() => {
    const majorCities = ["Mumbai", "Delhi", "Bengaluru", "Chennai", "Kolkata"];
    return events
      .filter((event) => majorCities.includes(event.venue.city))
      .slice(0, 5);
  }, [events]);

  // Popular events based on booking percentage
  const popularEvents = useMemo(() => {
    return [...events]
      .sort((a, b) => b.bookedCount / b.capacity - a.bookedCount / a.capacity)
      .slice(0, 10);
  }, [events]);

  // Check if event is liked
  const isEventLiked = (eventId: string): boolean => {
    return likedEvents.includes(eventId);
  };

  // Get event by ID
  const getEventById = (eventId: string): Event | undefined => {
    return events.find((event) => event.id === eventId);
  };

  return {
    // Data
    events: filteredEvents,
    featuredEvents,
    nearbyEvents,
    popularEvents,
    likedEvents,

    // State
    eventsLoading,
    eventsError,

    // Actions
    fetchEvents,
    fetchFeaturedEvents,
    toggleLikeEvent,

    // Utilities
    isEventLiked,
    getEventById,

    // Computed
    hasEvents: filteredEvents.length > 0,
    totalEvents: filteredEvents.length,
  };
};
