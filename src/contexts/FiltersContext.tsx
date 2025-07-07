import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
} from "react";
import { EventCategory } from "../types"; // Assuming types are in ../types

// Filters State interface
interface FiltersState {
  selectedCategory: EventCategory | null;
  searchQuery: string;
  selectedCity: string | null;
}

// Filters Action types
type FiltersAction =
  | { type: "SET_CATEGORY_FILTER"; payload: EventCategory | null }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_CITY_FILTER"; payload: string | null }
  | { type: "CLEAR_FILTERS" };

// Initial Filters State
const initialFiltersState: FiltersState = {
  selectedCategory: null,
  searchQuery: "",
  selectedCity: null,
};

// Filters Reducer
const filtersReducer = (
  state: FiltersState,
  action: FiltersAction
): FiltersState => {
  switch (action.type) {
    case "SET_CATEGORY_FILTER":
      return { ...state, selectedCategory: action.payload };

    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };

    case "SET_CITY_FILTER":
      return { ...state, selectedCity: action.payload };

    case "CLEAR_FILTERS":
      return {
        ...state,
        selectedCategory: null,
        searchQuery: "",
        selectedCity: null,
      };

    default:
      return state;
  }
};

// Filters Context Value interface
interface FiltersContextValue {
  selectedCategory: EventCategory | null;
  searchQuery: string;
  selectedCity: string | null;
  dispatch: React.Dispatch<FiltersAction>; // Expose dispatch for advanced use if needed

  // Actions
  setCategory: (category: EventCategory | null) => void;
  setSearchQuery: (query: string) => void;
  setCity: (city: string | null) => void;
  clearFilters: () => void;
}

const FiltersContext = createContext<FiltersContextValue | undefined>(
  undefined
);

// Filters Provider component
export const FiltersProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(filtersReducer, initialFiltersState);

  // Actions
  const setCategory = useCallback((category: EventCategory | null) => {
    dispatch({ type: "SET_CATEGORY_FILTER", payload: category });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: "SET_SEARCH_QUERY", payload: query });
  }, []);

  const setCity = useCallback((city: string | null) => {
    dispatch({ type: "SET_CITY_FILTER", payload: city });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: "CLEAR_FILTERS" });
  }, []);

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(
    () => ({
      selectedCategory: state.selectedCategory,
      searchQuery: state.searchQuery,
      selectedCity: state.selectedCity,
      dispatch,
      setCategory,
      setSearchQuery,
      setCity,
      clearFilters,
    }),
    [state, setCategory, setSearchQuery, setCity, clearFilters]
  );

  return (
    <FiltersContext.Provider value={contextValue}>
      {children}
    </FiltersContext.Provider>
  );
};

// Custom hook to use the Filters context
export const useFilters = () => {
  const context = useContext(FiltersContext);
  if (context === undefined) {
    throw new Error("useFilters must be used within a FiltersProvider");
  }
  return context;
};
