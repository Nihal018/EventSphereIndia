import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
} from "react";
import { Event, EventCategory } from "../types";
import { apiService } from "../services/api/apiService";

// Events State interface
interface EventsState {
  events: Event[];
  featuredEvents: Event[];
  likedEvents: string[];
  eventsLoading: boolean;
  eventsError: string | null;
  totalEvents: number; // Added for convenience, derived from 'events'
  organizerEvents: Event[];
  organizerStats: any;
  crudLoading: boolean;
  crudError: string | null;
}

// Events Action types
type EventsAction =
  | { type: "EVENTS_LOADING" }
  | { type: "EVENTS_SUCCESS"; payload: Event[] }
  | { type: "EVENTS_ERROR"; payload: string }
  | { type: "FEATURED_EVENTS_SUCCESS"; payload: Event[] }
  | { type: "TOGGLE_LIKE_EVENT"; payload: string }
  | { type: "CLEAR_EVENTS_ERROR" }
  | { type: "CREATE_EVENT_SUCCESS"; payload: Event }
  | { type: "UPDATE_EVENT_SUCCESS"; payload: Event }
  | { type: "DELETE_EVENT_SUCCESS"; payload: string }
  | { type: "ORGANIZER_EVENTS_SUCCESS"; payload: { events: Event[]; stats: any } }
  | { type: "CRUD_LOADING" }
  | { type: "CRUD_ERROR"; payload: string };

// Initial Events State
const initialEventsState: EventsState = {
  events: [],
  featuredEvents: [],
  likedEvents: [],
  eventsLoading: false,
  eventsError: null,
  totalEvents: 0, // Initial value
  organizerEvents: [],
  organizerStats: null,
  crudLoading: false,
  crudError: null,
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

    case "CREATE_EVENT_SUCCESS":
      return {
        ...state,
        events: [action.payload, ...state.events],
        organizerEvents: [action.payload, ...state.organizerEvents],
        crudLoading: false,
        crudError: null,
      };

    case "UPDATE_EVENT_SUCCESS":
      const updatedEvent = action.payload;
      return {
        ...state,
        events: state.events.map(event => 
          event.id === updatedEvent.id ? updatedEvent : event
        ),
        organizerEvents: state.organizerEvents.map(event => 
          event.id === updatedEvent.id ? updatedEvent : event
        ),
        crudLoading: false,
        crudError: null,
      };

    case "DELETE_EVENT_SUCCESS":
      const deletedEventId = action.payload;
      return {
        ...state,
        events: state.events.filter(event => event.id !== deletedEventId),
        organizerEvents: state.organizerEvents.filter(event => event.id !== deletedEventId),
        crudLoading: false,
        crudError: null,
      };

    case "ORGANIZER_EVENTS_SUCCESS":
      return {
        ...state,
        organizerEvents: action.payload.events,
        organizerStats: action.payload.stats,
        crudLoading: false,
        crudError: null,
      };

    case "CRUD_LOADING":
      return { ...state, crudLoading: true, crudError: null };

    case "CRUD_ERROR":
      return { ...state, crudLoading: false, crudError: action.payload };

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
  totalEvents: number;
  organizerEvents: Event[];
  organizerStats: any;
  crudLoading: boolean;
  crudError: string | null;
  dispatch: React.Dispatch<EventsAction>;

  // Actions
  fetchEvents: (filters?: {
    category?: EventCategory;
    search?: string;
    city?: string;
  }) => Promise<void>;
  fetchFeaturedEvents: () => Promise<void>;
  searchEvents: (query: string) => Promise<void>;
  getEventsByCategory: (category: EventCategory) => Promise<void>;
  getEventsByCity: (city: string) => Promise<void>;
  getEventById: (eventId: string) => Promise<Event | null>;
  refreshEvents: () => Promise<void>;
  toggleLikeEvent: (eventId: string) => void;
  isEventLiked: (eventId: string) => boolean;
  clearEventsError: () => void;

  // New CRUD Actions
  createEvent: (eventData: any) => Promise<Event | null>;
  updateEvent: (eventId: string, updates: any, organizerId?: string) => Promise<Event | null>;
  deleteEvent: (eventId: string, organizerId?: string) => Promise<boolean>;
  getEventsByOrganizer: (organizerId: string, status?: string) => Promise<void>;
  clearCrudError: () => void;
}

const EventsContext = createContext<EventsContextValue | undefined>(undefined);

// Events Provider component
export const EventsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(eventsReducer, initialEventsState);

  // Actions
  const fetchEvents = useCallback(
    async (filters?: {
      category?: EventCategory;
      search?: string;
      city?: string;
    }) => {
      dispatch({ type: "EVENTS_LOADING" });
      try {
        const response = await apiService.getEvents(filters);

        if (response.success && response.data) {
          dispatch({ type: "EVENTS_SUCCESS", payload: response.data.events });
        } else {
          dispatch({
            type: "EVENTS_ERROR",
            payload: response.error || "Failed to fetch events",
          });
        }
      } catch (error: any) {
        dispatch({
          type: "EVENTS_ERROR",
          payload: error.message || "Failed to fetch events",
        });
      }
    },
    []
  );

  const fetchFeaturedEvents = useCallback(async () => {
    try {
      const response = await apiService.getFeaturedEvents();

      if (response.success && response.data) {
        // Take first 6 events as featured
        const featuredEventsData = response.data.events.slice(0, 6);
        dispatch({
          type: "FEATURED_EVENTS_SUCCESS",
          payload: featuredEventsData,
        });
      }
    } catch (error) {
      console.error("Failed to fetch featured events:", error);
    }
  }, []);

  const searchEvents = useCallback(async (query: string) => {
    dispatch({ type: "EVENTS_LOADING" });
    try {
      const response = await apiService.searchEvents(query);

      if (response.success && response.data) {
        dispatch({ type: "EVENTS_SUCCESS", payload: response.data.events });
      } else {
        dispatch({
          type: "EVENTS_ERROR",
          payload: response.error || "Failed to search events",
        });
      }
    } catch (error: any) {
      dispatch({
        type: "EVENTS_ERROR",
        payload: error.message || "Failed to search events",
      });
    }
  }, []);

  const getEventsByCategory = useCallback(async (category: EventCategory) => {
    dispatch({ type: "EVENTS_LOADING" });
    try {
      const response = await apiService.getEventsByCategory(category);

      if (response.success && response.data) {
        dispatch({ type: "EVENTS_SUCCESS", payload: response.data.events });
      } else {
        dispatch({
          type: "EVENTS_ERROR",
          payload: response.error || "Failed to fetch events by category",
        });
      }
    } catch (error: any) {
      dispatch({
        type: "EVENTS_ERROR",
        payload: error.message || "Failed to fetch events by category",
      });
    }
  }, []);

  const getEventsByCity = useCallback(async (city: string) => {
    dispatch({ type: "EVENTS_LOADING" });
    try {
      const response = await apiService.getEventsByCity(city);

      if (response.success && response.data) {
        dispatch({ type: "EVENTS_SUCCESS", payload: response.data.events });
      } else {
        dispatch({
          type: "EVENTS_ERROR",
          payload: response.error || "Failed to fetch events by city",
        });
      }
    } catch (error: any) {
      dispatch({
        type: "EVENTS_ERROR",
        payload: error.message || "Failed to fetch events by city",
      });
    }
  }, []);

  const getEventById = useCallback(
    async (eventId: string): Promise<Event | null> => {
      try {
        const response = await apiService.getEventById(eventId);

        if (response.success && response.data) {
          return response.data.event;
        }
        return null;
      } catch (error) {
        console.error("Failed to fetch event by ID:", error);
        return null;
      }
    },
    []
  );

  const refreshEvents = useCallback(async () => {
    await fetchEvents();
  }, [fetchEvents]);

  const toggleLikeEvent = useCallback((eventId: string) => {
    dispatch({ type: "TOGGLE_LIKE_EVENT", payload: eventId });
  }, []);

  const isEventLiked = useCallback(
    (eventId: string) => state.likedEvents.includes(eventId),
    [state.likedEvents]
  );

  const clearEventsError = useCallback(() => {
    dispatch({ type: "CLEAR_EVENTS_ERROR" });
  }, []);

  // New CRUD Methods
  const createEvent = useCallback(async (eventData: any): Promise<Event | null> => {
    dispatch({ type: "CRUD_LOADING" });
    try {
      const response = await apiService.createEvent(eventData);
      
      if (response.success && response.data) {
        dispatch({ type: "CREATE_EVENT_SUCCESS", payload: response.data.event });
        return response.data.event;
      } else {
        dispatch({
          type: "CRUD_ERROR",
          payload: response.error || "Failed to create event",
        });
        return null;
      }
    } catch (error: any) {
      dispatch({
        type: "CRUD_ERROR",
        payload: error.message || "Failed to create event",
      });
      return null;
    }
  }, []);

  const updateEvent = useCallback(async (
    eventId: string, 
    updates: any, 
    organizerId?: string
  ): Promise<Event | null> => {
    dispatch({ type: "CRUD_LOADING" });
    try {
      const response = await apiService.updateEvent(eventId, updates, organizerId);
      
      if (response.success && response.data) {
        dispatch({ type: "UPDATE_EVENT_SUCCESS", payload: response.data.event });
        return response.data.event;
      } else {
        dispatch({
          type: "CRUD_ERROR",
          payload: response.error || "Failed to update event",
        });
        return null;
      }
    } catch (error: any) {
      dispatch({
        type: "CRUD_ERROR",
        payload: error.message || "Failed to update event",
      });
      return null;
    }
  }, []);

  const deleteEvent = useCallback(async (
    eventId: string, 
    organizerId?: string
  ): Promise<boolean> => {
    dispatch({ type: "CRUD_LOADING" });
    try {
      const response = await apiService.deleteEvent(eventId, organizerId);
      
      if (response.success) {
        dispatch({ type: "DELETE_EVENT_SUCCESS", payload: eventId });
        return true;
      } else {
        dispatch({
          type: "CRUD_ERROR",
          payload: response.error || "Failed to delete event",
        });
        return false;
      }
    } catch (error: any) {
      dispatch({
        type: "CRUD_ERROR",
        payload: error.message || "Failed to delete event",
      });
      return false;
    }
  }, []);

  const getEventsByOrganizer = useCallback(async (
    organizerId: string, 
    status?: string
  ): Promise<void> => {
    dispatch({ type: "CRUD_LOADING" });
    try {
      const response = await apiService.getEventsByOrganizer(organizerId, status);
      
      if (response.success && response.data) {
        dispatch({ 
          type: "ORGANIZER_EVENTS_SUCCESS", 
          payload: { 
            events: response.data.events, 
            stats: response.data.stats 
          } 
        });
      } else {
        dispatch({
          type: "CRUD_ERROR",
          payload: response.error || "Failed to fetch organizer events",
        });
      }
    } catch (error: any) {
      dispatch({
        type: "CRUD_ERROR",
        payload: error.message || "Failed to fetch organizer events",
      });
    }
  }, []);

  const clearCrudError = useCallback(() => {
    dispatch({ type: "CRUD_ERROR", payload: "" });
  }, []);

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(
    () => ({
      events: state.events,
      featuredEvents: state.featuredEvents,
      likedEvents: state.likedEvents,
      eventsLoading: state.eventsLoading,
      eventsError: state.eventsError,
      totalEvents: state.totalEvents,
      organizerEvents: state.organizerEvents,
      organizerStats: state.organizerStats,
      crudLoading: state.crudLoading,
      crudError: state.crudError,
      dispatch,
      fetchEvents,
      fetchFeaturedEvents,
      searchEvents,
      getEventsByCategory,
      getEventsByCity,
      getEventById,
      refreshEvents,
      toggleLikeEvent,
      isEventLiked,
      clearEventsError,
      createEvent,
      updateEvent,
      deleteEvent,
      getEventsByOrganizer,
      clearCrudError,
    }),
    [
      state.events,
      state.featuredEvents,
      state.likedEvents,
      state.eventsLoading,
      state.eventsError,
      state.totalEvents,
      state.organizerEvents,
      state.organizerStats,
      state.crudLoading,
      state.crudError,
      fetchEvents,
      fetchFeaturedEvents,
      searchEvents,
      getEventsByCategory,
      getEventsByCity,
      getEventById,
      refreshEvents,
      toggleLikeEvent,
      isEventLiked,
      clearEventsError,
      createEvent,
      updateEvent,
      deleteEvent,
      getEventsByOrganizer,
      clearCrudError,
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
