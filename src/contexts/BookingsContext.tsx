import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { parseISO } from "date-fns";
import { Booking } from "../types";
import { useAuth } from "./AuthContext";
import { useEvents } from "./EventsContext";
import { apiService } from "../services/api/apiService";

// Bookings State interface
interface BookingsState {
  bookings: Booking[];
  upcomingBookings: Booking[];
  pastBookings: Booking[];
  bookingsLoading: boolean;
  bookingsError: string | null;
}

// Bookings Action types
type BookingsAction =
  | { type: "BOOKINGS_LOADING" }
  | {
      type: "BOOKINGS_SUCCESS";
      payload: {
        bookings: Booking[];
        upcomingBookings: Booking[];
        pastBookings: Booking[];
      };
    }
  | { type: "BOOKINGS_ERROR"; payload: string }
  | { type: "ADD_BOOKING"; payload: Booking }
  | { type: "CANCEL_BOOKING"; payload: Booking }
  | { type: "CLEAR_BOOKINGS_ERROR" };

// Initial Bookings State
const initialBookingsState: BookingsState = {
  bookings: [],
  upcomingBookings: [],
  pastBookings: [],
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
        bookings: action.payload.bookings,
        upcomingBookings: action.payload.upcomingBookings,
        pastBookings: action.payload.pastBookings,
        bookingsLoading: false,
        bookingsError: null,
      };

    case "BOOKINGS_ERROR":
      return {
        ...state,
        bookingsLoading: false,
        bookingsError: action.payload,
      };

    case "ADD_BOOKING": {
      const updatedBookings = [...state.bookings, action.payload];

      // Recompute upcoming and past bookings
      const upcomingBookings = updatedBookings.filter((booking) => {
        const eventDate =
          typeof booking.eventDate === "string"
            ? parseISO(booking.eventDate)
            : booking.eventDate;
        return (
          eventDate >= new Date() &&
          (booking.status === "confirmed" || booking.status === "pending")
        );
      });

      const pastBookings = updatedBookings.filter((booking) => {
        const eventDate =
          typeof booking.eventDate === "string"
            ? parseISO(booking.eventDate)
            : booking.eventDate;
        return eventDate < new Date() || booking.status === "cancelled";
      });

      return {
        ...state,
        bookings: updatedBookings,
        upcomingBookings,
        pastBookings,
      };
    }

    case "CANCEL_BOOKING": {
      const updatedBookings = state.bookings.map((booking) =>
        booking.id === action.payload.id ? action.payload : booking
      );

      // Recompute upcoming and past bookings
      const upcomingBookings = updatedBookings.filter((booking) => {
        const eventDate =
          typeof booking.eventDate === "string"
            ? parseISO(booking.eventDate)
            : booking.eventDate;
        return (
          eventDate >= new Date() &&
          (booking.status === "confirmed" || booking.status === "pending")
        );
      });

      const pastBookings = updatedBookings.filter((booking) => {
        const eventDate =
          typeof booking.eventDate === "string"
            ? parseISO(booking.eventDate)
            : booking.eventDate;
        return eventDate < new Date() || booking.status === "cancelled";
      });

      return {
        ...state,
        bookings: updatedBookings,
        upcomingBookings,
        pastBookings,
      };
    }

    case "CLEAR_BOOKINGS_ERROR":
      return {
        ...state,
        bookingsError: null,
      };

    default:
      return state;
  }
};

// Bookings Context Value interface
interface BookingsContextValue {
  bookings: Booking[];
  upcomingBookings: Booking[];
  pastBookings: Booking[];
  bookingsLoading: boolean;
  bookingsError: string | null;
  dispatch: React.Dispatch<BookingsAction>;

  // Actions
  fetchBookings: () => Promise<void>;
  createBooking: (
    eventId: string,
    quantity: number,
    userDetails: { name: string; email: string; phone: string },
    ticketType?: "general" | "vip"
  ) => Promise<Booking | null>;
  cancelBooking: (bookingId: string) => Promise<boolean>;
  getBookingByIdFromApi: (
    bookingId: string
  ) => Promise<{ booking: Booking; event?: any } | null>;
  refreshBookings: () => Promise<void>;
  getBookingById: (bookingId: string) => Booking | undefined;
  clearBookingsError: () => void;
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
    if (!isAuthenticated || !user?.id) {
      console.warn("User not authenticated, cannot fetch bookings.");
      return;
    }

    dispatch({ type: "BOOKINGS_LOADING" });
    try {
      const response = await apiService.getUserBookings(user.id);

      if (response.success && response.data) {
        const bookings = response.data.bookings || [];

        // Compute upcoming and past bookings client-side since API returns empty arrays
        const upcomingBookings = bookings.filter((booking) => {
          const eventDate =
            typeof booking.eventDate === "string"
              ? parseISO(booking.eventDate)
              : booking.eventDate;
          return (
            eventDate >= new Date() &&
            (booking.status === "confirmed" || booking.status === "pending")
          );
        });

        const pastBookings = bookings.filter((booking) => {
          const eventDate =
            typeof booking.eventDate === "string"
              ? parseISO(booking.eventDate)
              : booking.eventDate;
          return eventDate < new Date() || booking.status === "cancelled";
        });

        dispatch({
          type: "BOOKINGS_SUCCESS",
          payload: {
            bookings,
            upcomingBookings,
            pastBookings,
          },
        });
      } else {
        dispatch({
          type: "BOOKINGS_ERROR",
          payload: response.error || "Failed to fetch bookings",
        });
      }
    } catch (error: any) {
      dispatch({
        type: "BOOKINGS_ERROR",
        payload: error.message || "Failed to fetch bookings",
      });
    }
  }, [isAuthenticated, user?.id]);

  const createBooking = useCallback(
    async (
      eventId: string,
      quantity: number,
      userDetails: { name: string; email: string; phone: string },
      ticketType: "general" | "vip" = "general"
    ): Promise<Booking | null> => {
      if (!isAuthenticated || !user?.id) {
        throw new Error("User not authenticated or user data missing.");
      }

      try {
        const bookingData = {
          userId: user.id,
          eventId,
          quantity,
          userDetails,
          ticketType,
        };

        const response = await apiService.createBooking(bookingData);

        if (response.success && response.data) {
          // Add the new booking to state
          dispatch({ type: "ADD_BOOKING", payload: response.data.booking });
          return response.data.booking;
        } else {
          throw new Error(response.error || "Failed to create booking");
        }
      } catch (error: any) {
        console.error("Error creating booking:", error);
        throw error;
      }
    },
    [isAuthenticated, user?.id]
  );

  const cancelBooking = useCallback(
    async (bookingId: string): Promise<boolean> => {
      if (!isAuthenticated || !user?.id) {
        throw new Error("User not authenticated or user data missing.");
      }

      try {
        const response = await apiService.cancelBooking(bookingId, user.id);

        if (response.success && response.data) {
          // Update the cancelled booking in state
          dispatch({ type: "CANCEL_BOOKING", payload: response.data.booking });
          return true;
        } else {
          throw new Error(response.error || "Failed to cancel booking");
        }
      } catch (error: any) {
        console.error("Error cancelling booking:", error);
        throw error;
      }
    },
    [isAuthenticated, user?.id]
  );

  const getBookingByIdFromApi = useCallback(
    async (
      bookingId: string
    ): Promise<{ booking: Booking; event?: any } | null> => {
      if (!isAuthenticated || !user?.id) {
        throw new Error("User not authenticated or user data missing.");
      }

      try {
        const response = await apiService.getBookingById(bookingId, user.id);

        if (response.success && response.data) {
          return {
            booking: response.data.booking,
            event: response.data.event,
          };
        } else {
          throw new Error(response.error || "Failed to fetch booking details");
        }
      } catch (error: any) {
        console.error("Error fetching booking details:", error);
        throw error;
      }
    },
    [isAuthenticated, user?.id]
  );

  const refreshBookings = useCallback(async () => {
    await fetchBookings();
  }, [fetchBookings]);

  const getBookingById = useCallback(
    (bookingId: string): Booking | undefined => {
      return state.bookings.find((booking) => booking.id === bookingId);
    },
    [state.bookings]
  );

  const clearBookingsError = useCallback(() => {
    dispatch({ type: "CLEAR_BOOKINGS_ERROR" });
  }, []);

  // Auto-fetch bookings when user authentication changes
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchBookings();
    }
  }, [isAuthenticated, user?.id, fetchBookings]);

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(
    () => ({
      bookings: state.bookings,
      upcomingBookings: state.upcomingBookings,
      pastBookings: state.pastBookings,
      bookingsLoading: state.bookingsLoading,
      bookingsError: state.bookingsError,
      dispatch,
      fetchBookings,
      createBooking,
      cancelBooking,
      getBookingByIdFromApi,
      refreshBookings,
      getBookingById,
      clearBookingsError,
    }),
    [
      state.bookings,
      state.upcomingBookings,
      state.pastBookings,
      state.bookingsLoading,
      state.bookingsError,
      fetchBookings,
      createBooking,
      cancelBooking,
      getBookingByIdFromApi,
      refreshBookings,
      getBookingById,
      clearBookingsError,
    ]
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
