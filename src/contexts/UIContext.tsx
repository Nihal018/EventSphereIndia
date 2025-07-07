import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import NetInfo from "@react-native-community/netinfo"; // Import NetInfo for network status

// UI State interface
interface UIState {
  isOnline: boolean;
  refreshing: boolean;
  // You can add other UI-related errors or global messages here if needed
  globalError: string | null;
}

// UI Action types
type UIAction =
  | { type: "SET_ONLINE_STATUS"; payload: boolean }
  | { type: "SET_REFRESHING"; payload: boolean }
  | { type: "SET_GLOBAL_ERROR"; payload: string | null } // Action to set/clear a global error message
  | { type: "CLEAR_ERRORS" }; // Action to clear all UI-related errors

// Initial UI State
const initialUIState: UIState = {
  isOnline: true, // Assume online initially, NetInfo will update
  refreshing: false,
  globalError: null,
};

// UI Reducer
const uiReducer = (state: UIState, action: UIAction): UIState => {
  switch (action.type) {
    case "SET_ONLINE_STATUS":
      return { ...state, isOnline: action.payload };

    case "SET_REFRESHING":
      return { ...state, refreshing: action.payload };

    case "SET_GLOBAL_ERROR":
      return { ...state, globalError: action.payload };

    case "CLEAR_ERRORS":
      return {
        ...state,
        globalError: null,
        // If you add other error states in UIState, clear them here too
      };

    default:
      return state;
  }
};

// UI Context Value interface
interface UIContextValue {
  isOnline: boolean;
  refreshing: boolean;
  // You can add other UI-related errors or global messages here if needed
  globalError: string | null;
  dispatch: React.Dispatch<UIAction>; // Expose dispatch for advanced use if needed

  // Actions
  setOnlineStatus: (status: boolean) => void;
  setRefreshing: (isRefreshing: boolean) => void;
  setGlobalError: (message: string | null) => void;
  clearErrors: () => void;
  refreshApp: () => Promise<void>; // A general refresh function for the app
}

const UIContext = createContext<UIContextValue | undefined>(undefined);

// UI Provider component
export const UIProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(uiReducer, initialUIState);

  // Actions
  const setOnlineStatus = useCallback((status: boolean) => {
    dispatch({ type: "SET_ONLINE_STATUS", payload: status });
  }, []);

  const setRefreshing = useCallback((isRefreshing: boolean) => {
    dispatch({ type: "SET_REFRESHING", payload: isRefreshing });
  }, []);

  const setGlobalError = useCallback((message: string | null) => {
    dispatch({ type: "SET_GLOBAL_ERROR", payload: message });
  }, []);

  const clearErrors = useCallback(() => {
    dispatch({ type: "CLEAR_ERRORS" });
  }, []);

  // --- NetInfo Listener ---
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((netState) => {
      setOnlineStatus(netState.isConnected ?? false);
    });

    // Initial check on mount
    NetInfo.fetch().then((netState) => {
      setOnlineStatus(netState.isConnected ?? false);
    });

    return unsubscribe; // Cleanup listener on unmount
  }, [setOnlineStatus]);

  // --- Global Refresh Function ---
  // This function would typically call refresh functions from other contexts.
  // It assumes that other contexts (like Events, Bookings) also expose a 'refresh' action.
  // You'd need to import and use those contexts here if you want to orchestrate a global refresh.
  // For now, it's a placeholder.
  const refreshApp = useCallback(
    async () => {
      setRefreshing(true);
      try {
        // Example: Call refresh functions from other contexts
        // const { fetchEvents } = useEvents(); // Assuming useEvents is available
        // const { fetchBookings } = useBookings(); // Assuming useBookings is available
        // await Promise.all([
        //   fetchEvents(),
        //   fetchBookings(),
        //   // ... other data fetching functions
        // ]);
        console.log("Global app refresh triggered.");
      } catch (error) {
        console.error("Error during global app refresh:", error);
        setGlobalError("Failed to refresh data. Please try again.");
      } finally {
        setRefreshing(false);
      }
    },
    [
      /* Add dependencies like fetchEvents, fetchBookings if used here */
    ]
  );

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(
    () => ({
      isOnline: state.isOnline,
      refreshing: state.refreshing,
      globalError: state.globalError,
      dispatch,
      setOnlineStatus,
      setRefreshing,
      setGlobalError,
      clearErrors,
      refreshApp,
    }),
    [
      state,
      setOnlineStatus,
      setRefreshing,
      setGlobalError,
      clearErrors,
      refreshApp,
    ]
  );

  return (
    <UIContext.Provider value={contextValue}>{children}</UIContext.Provider>
  );
};

// Custom hook to use the UI context
export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
};
