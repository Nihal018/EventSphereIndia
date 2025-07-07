import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
} from "react";
import { Booking, Event } from "../types"; // Assuming types are in ../types
import { useAuth } from "./AuthContext"; // Assuming you'll create this context
import { useEvents } from "./EventsContext"; // Assuming you'll create this context

// Bookings State interface
interface BookingsState {
  bookings: Booking[];
  bookingsLoading: boolean;
  bookingsError: string | null;
}

// Bookings Action types
type BookingsAction =
  | { type: "BOOKINGS_LOADING" }
  | { type: "BOOKINGS_SUCCESS"; payload: Booking[] }
  | { type: "BOOKINGS_ERROR"; payload: string }
  | { type: "ADD_BOOKING"; payload: Booking };

// Initial Bookings State
const initialBookingsState: BookingsState = {
  bookings: [],
  bookingsLoading: false,
  bookingsError: null,
};

// Bookings Reducer
const bookingsReducer = (
  state: BookingsState,
  action: BookingsAction
): BookingsState => {
  switch (action.type) {
    case "BOOKINGS_LOADING":
      return { ...state, bookingsLoading: true, bookingsError: null };

    case "BOOKINGS_SUCCESS":
      return {
        ...state,
        bookings: action.payload,
        bookingsLoading: false,
        bookingsError: null,
      };

    case "BOOKINGS_ERROR":
      return {
        ...state,
        bookingsLoading: false,
        bookingsError: action.payload,
      };

    case "ADD_BOOKING":
      return {
        ...state,
        bookings: [...state.bookings, action.payload],
      };

    default:
      return state;
  }
};

// Bookings Context Value interface
interface BookingsContextValue {
  bookings: Booking[];
  bookingsLoading: boolean;
  bookingsError: string | null;
  dispatch: React.Dispatch<BookingsAction>; // Expose dispatch for advanced use if needed

  // Actions
  fetchBookings: () => Promise<void>;
  createBooking: (eventId: string, quantity: number) => Promise<void>;
}

const BookingsContext = createContext<BookingsContextValue | undefined>(
  undefined
);

// Bookings Provider component
export const BookingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(bookingsReducer, initialBookingsState);
  const { isAuthenticated, user } = useAuth(); // Access auth state from AuthContext
  const { events } = useEvents(); // Access events state from EventsContext

  const fetchBookings = useCallback(async () => {
    if (!isAuthenticated) {
      console.warn("User not authenticated, cannot fetch bookings.");
      return; // Do not proceed if not authenticated
    }

    dispatch({ type: "BOOKINGS_LOADING" });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      // In a real app, you'd fetch bookings for the current user
      dispatch({ type: "BOOKINGS_SUCCESS", payload: [] });
    } catch (error) {
      dispatch({ type: "BOOKINGS_ERROR", payload: "Failed to fetch bookings" });
    }
  }, [isAuthenticated]); // Dependency on isAuthenticated

  const createBooking = useCallback(
    async (eventId: string, quantity: number) => {
      if (!isAuthenticated || !user) {
        throw new Error("User not authenticated or user data missing.");
      }

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const event = events.find((e) => e.id === eventId);
        if (!event) throw new Error("Event not found");

        const booking: Booking = {
          id: Date.now().toString(),
          userId: user.id, // Use user ID from AuthContext
          eventId,
          event,
          quantity,
          totalAmount: event.price.min * quantity,
          status: "confirmed",
          bookingDate: new Date(),
          tickets: Array.from({ length: quantity }, (_, i) => ({
            id: `${Date.now()}-${i}`,
            ticketType: "general",
            price: event.price.min,
            qrCode: `QR-${Date.now()}-${i}`,
          })),
        };

        dispatch({ type: "ADD_BOOKING", payload: booking });
      } catch (error) {
        console.error("Error creating booking:", error);
        throw error; // Re-throw to allow component to handle
      }
    },
    [isAuthenticated, user, events] // Dependencies on auth and events state
  );

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(
    () => ({
      bookings: state.bookings,
      bookingsLoading: state.bookingsLoading,
      bookingsError: state.bookingsError,

      dispatch,
      fetchBookings,
      createBooking,
    }),
    [state, fetchBookings, createBooking]
  );

  return (
    <BookingsContext.Provider value={contextValue}>
      {children}
    </BookingsContext.Provider>
  );
};

// Custom hook to use the Bookings context
export const useBookings = () => {
  const context = useContext(BookingsContext);
  if (context === undefined) {
    throw new Error("useBookings must be used within a BookingsProvider");
  }
  return context;
};
