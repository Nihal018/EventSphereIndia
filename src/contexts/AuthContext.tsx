import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { User } from "../types"; // Assuming User type is defined in ../types

// Auth State interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean; // Indicates if the initial auth check is in progress
  authError: string | null; // To store authentication errors
}

// Auth Action types
type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: User }
  | { type: "AUTH_FAILURE"; payload: string }
  | { type: "AUTH_LOGOUT" }
  | { type: "AUTH_INITIAL_CHECK_COMPLETE" }; // New action for initial loading state

// Initial Auth State
const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  authLoading: true, // Set to true initially to indicate loading
  authError: null,
};

// Auth Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, authLoading: true, authError: null };

    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        authLoading: false,
        authError: null,
      };

    case "AUTH_FAILURE":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        authLoading: false,
        authError: action.payload,
      };

    case "AUTH_LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        authLoading: false, // No longer loading after logout
        authError: null,
      };

    case "AUTH_INITIAL_CHECK_COMPLETE":
      return { ...state, authLoading: false };

    default:
      return state;
  }
};

// Auth Context Value interface
interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null; // To store authentication errors
  dispatch: React.Dispatch<AuthAction>; // Expose dispatch for advanced use if needed

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>; // Logout is now async due to AsyncStorage
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Auth Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // Effect to check authentication status from AsyncStorage on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userToken = await AsyncStorage.getItem("userToken");
        const userDataString = await AsyncStorage.getItem("userData");

        if (userToken && userDataString) {
          const user: User = JSON.parse(userDataString);
          dispatch({ type: "AUTH_SUCCESS", payload: user });
        } else {
          dispatch({ type: "AUTH_LOGOUT" }); // Not authenticated, set state accordingly
        }
      } catch (error) {
        console.error(
          "Failed to load authentication data from storage:",
          error
        );
        dispatch({ type: "AUTH_FAILURE", payload: "Failed to load session." });
      } finally {
        // Ensure authLoading is set to false after initial check
        dispatch({ type: "AUTH_INITIAL_CHECK_COMPLETE" });
      }
    };

    checkAuthStatus();
  }, []); // Run only once on component mount

  // Actions
  const login = useCallback(async (email: string, password: string) => {
    dispatch({ type: "AUTH_START" });
    try {
      // --- Replace with your actual API call for login ---
      // Example:
      // const response = await fetch('YOUR_LOGIN_API_ENDPOINT', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // });
      // const data = await response.json();
      // if (!response.ok) {
      //   throw new Error(data.message || 'Login failed');
      // }
      // const userToken = data.token;
      // const userData = data.user; // Assuming your API returns user data
      // --- End of API call example ---

      // Simulate a successful login for demonstration
      await new Promise((resolve) => setTimeout(resolve, 500));
      const mockUser: User = {
        id: "mock-user-123",
        email,
        name: "Test User",
        preferences: ["Music", "Sports"],
        createdAt: new Date(),
      };
      const mockToken = "dummy-jwt-token-for-" + email;

      // Store token and user data
      await AsyncStorage.setItem("userToken", mockToken);
      await AsyncStorage.setItem("userData", JSON.stringify(mockUser));

      dispatch({ type: "AUTH_SUCCESS", payload: mockUser });
    } catch (error: any) {
      console.error("Login error:", error);
      dispatch({
        type: "AUTH_FAILURE",
        payload: error.message || "Login failed",
      });
      throw error; // Re-throw to allow component to handle
    }
  }, []);

  const register = useCallback(async (userData: any) => {
    dispatch({ type: "AUTH_START" });
    try {
      // --- Replace with your actual API call for registration ---
      // Example:
      // const response = await fetch('YOUR_REGISTER_API_ENDPOINT', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(userData)
      // });
      // const data = await response.json();
      // if (!response.ok) {
      //   throw new Error(data.message || 'Registration failed');
      // }
      // const userToken = data.token;
      // const newUser = data.user;
      // --- End of API call example ---

      // Simulate a successful registration
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const newUser: User = {
        id: "mock-user-" + Date.now(),
        email: userData.email,
        name: userData.name,
        preferences: [],
        createdAt: new Date(),
      };
      const mockToken = "dummy-jwt-token-for-new-user";

      // Store token and new user data
      await AsyncStorage.setItem("userToken", mockToken);
      await AsyncStorage.setItem("userData", JSON.stringify(newUser));

      dispatch({ type: "AUTH_SUCCESS", payload: newUser });
    } catch (error: any) {
      console.error("Registration error:", error);
      dispatch({
        type: "AUTH_FAILURE",
        payload: error.message || "Registration failed",
      });
      throw error; // Re-throw to allow component to handle
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userData");
      dispatch({ type: "AUTH_LOGOUT" });
    } catch (error) {
      console.error("Failed to clear authentication data from storage:", error);
      // Even if storage clear fails, we should still update state for immediate UX
      dispatch({ type: "AUTH_LOGOUT" });
    }
  }, []);

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(
    () => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      authLoading: state.authLoading,
      authError: state.authError,
      dispatch,
      login,
      register,
      logout,
    }),
    [state, login, register, logout]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook to use the Auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
