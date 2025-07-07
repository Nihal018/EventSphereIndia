import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
} from "react";
import { Event, EventCategory } from "../types"; // Assuming types are in ../types

// Events State interface
interface EventsState {
  events: Event[];
  featuredEvents: Event[];
  likedEvents: string[];
  eventsLoading: boolean;
  eventsError: string | null;
  totalEvents: number; // Added for convenience, derived from 'events'
}

// Events Action types
type EventsAction =
  | { type: "EVENTS_LOADING" }
  | { type: "EVENTS_SUCCESS"; payload: Event[] }
  | { type: "EVENTS_ERROR"; payload: string }
  | { type: "FEATURED_EVENTS_SUCCESS"; payload: Event[] }
  | { type: "TOGGLE_LIKE_EVENT"; payload: string }
  | { type: "CLEAR_EVENTS_ERROR" }; // New action to clear eventsError

// Initial Events State
const initialEventsState: EventsState = {
  events: [],
  featuredEvents: [],
  likedEvents: [],
  eventsLoading: false,
  eventsError: null,
  totalEvents: 0, // Initial value
};

// Events Reducer
const eventsReducer = (
  state: EventsState,
  action: EventsAction
): EventsState => {
  switch (action.type) {
    case "EVENTS_LOADING":
      return { ...state, eventsLoading: true, eventsError: null };

    case "EVENTS_SUCCESS":
      return {
        ...state,
        events: action.payload,
        eventsLoading: false,
        eventsError: null,
        totalEvents: action.payload.length, // Update totalEvents here
      };

    case "EVENTS_ERROR":
      return {
        ...state,
        events: [],
        eventsLoading: false,
        eventsError: action.payload,
        totalEvents: 0, // Reset totalEvents on error
      };

    case "FEATURED_EVENTS_SUCCESS":
      return { ...state, featuredEvents: action.payload };

    case "TOGGLE_LIKE_EVENT":
      const eventId = action.payload;
      const isLiked = state.likedEvents.includes(eventId);
      const likedEvents = isLiked
        ? state.likedEvents.filter((id) => id !== eventId)
        : [...state.likedEvents, eventId];

      return { ...state, likedEvents };

    case "CLEAR_EVENTS_ERROR": // New case to clear error
      return { ...state, eventsError: null };

    default:
      return state;
  }
};

// Events Context Value interface
interface EventsContextValue {
  events: Event[];
  featuredEvents: Event[];
  likedEvents: string[];
  eventsLoading: boolean;
  eventsError: string | null;
  totalEvents: number; // Exposed directly
  dispatch: React.Dispatch<EventsAction>; // Expose dispatch for advanced use if needed

  // Actions
  fetchEvents: () => Promise<void>;
  fetchFeaturedEvents: () => Promise<void>;
  toggleLikeEvent: (eventId: string) => void;
  isEventLiked: (eventId: string) => boolean; // Helper function for checking like status
  clearEventsError: () => void; // New action to clear eventsError
}

const EventsContext = createContext<EventsContextValue | undefined>(undefined);

// Events Provider component
export const EventsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(eventsReducer, initialEventsState);

  // Actions
  const fetchEvents = useCallback(async () => {
    dispatch({ type: "EVENTS_LOADING" });
    try {
      // Correctly import named export from mockData.js
      const { mockEvents } = await import("../data/mockData"); // Directly destructure mockEvents
      dispatch({ type: "EVENTS_SUCCESS", payload: mockEvents });
    } catch (error: any) {
      dispatch({
        type: "EVENTS_ERROR",
        payload: error.message || "Failed to fetch events",
      });
    }
  }, []);

  const fetchFeaturedEvents = useCallback(async () => {
    try {
      // Correctly import named export from mockData.js
      const { mockEvents } = await import("../data/mockData"); // Directly destructure mockEvents
      const featured = mockEvents
        .filter((event) => event.rating >= 4.7)
        .slice(0, 3);
      dispatch({ type: "FEATURED_EVENTS_SUCCESS", payload: featured });
    } catch (error: any) {
      console.error("Failed to fetch featured events:", error);
      // Optionally dispatch an error action here if you want to show it in UI
    }
  }, []);

  const toggleLikeEvent = useCallback((eventId: string) => {
    dispatch({ type: "TOGGLE_LIKE_EVENT", payload: eventId });
  }, []);

  // Helper function to check if an event is liked
  const isEventLiked = useCallback(
    (eventId: string) => state.likedEvents.includes(eventId),
    [state.likedEvents]
  );

  const clearEventsError = useCallback(() => {
    dispatch({ type: "CLEAR_EVENTS_ERROR" });
  }, []);

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(
    () => ({
      events: state.events,
      featuredEvents: state.featuredEvents,
      likedEvents: state.likedEvents,
      eventsLoading: state.eventsLoading,
      eventsError: state.eventsError,
      totalEvents: state.totalEvents, // Expose totalEvents
      dispatch, // Keep dispatch if you want to expose it
      fetchEvents,
      fetchFeaturedEvents,
      toggleLikeEvent,
      isEventLiked, // Expose isEventLiked
      clearEventsError, // Expose clearEventsError
    }),
    [
      state.events,
      state.featuredEvents,
      state.likedEvents,
      state.eventsLoading,
      state.eventsError,
      state.totalEvents,
      dispatch, // Keep dispatch if you want to expose it
      fetchEvents,
      fetchFeaturedEvents,
      toggleLikeEvent,
      isEventLiked,
      clearEventsError,
    ]
  );

  return (
    <EventsContext.Provider value={contextValue}>
      {children}
    </EventsContext.Provider>
  );
};

// Custom hook to use the Events context
export const useEvents = () => {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error("useEvents must be used within an EventsProvider");
  }
  return context;
};
