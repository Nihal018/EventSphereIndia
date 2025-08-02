import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { User } from "../types";
import {
  msalConfig,
  webMsalConfig,
  loginRequest,
  tokenRequest,
} from "../config/azure";

// Import different MSAL libraries based on platform
let PublicClientApplication: any;
let MSALResult: any;

if (Platform.OS === "web") {
  // Use @azure/msal-browser for web
  const msalBrowser = require("@azure/msal-browser");
  PublicClientApplication = msalBrowser.PublicClientApplication;
} else {
  // Use react-native-msal for native platforms
  const msalNative = require("react-native-msal");
  PublicClientApplication = msalNative.PublicClientApplication;
  MSALResult = msalNative.MSALResult;
}

// Auth State interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;
  accessToken: string | null;
}

// Auth Action types
type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: { user: User; accessToken: string } }
  | { type: "AUTH_FAILURE"; payload: string }
  | { type: "AUTH_LOGOUT" }
  | { type: "AUTH_INITIAL_CHECK_COMPLETE" }
  | { type: "TOKEN_REFRESH"; payload: string };

// Initial Auth State
const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  authLoading: true,
  authError: null,
  accessToken: null,
};

// Auth Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, authLoading: true, authError: null };

    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        authLoading: false,
        authError: null,
      };

    case "AUTH_FAILURE":
      return {
        ...state,
        user: null,
        accessToken: null,
        isAuthenticated: false,
        authLoading: false,
        authError: action.payload,
      };

    case "AUTH_LOGOUT":
      return {
        ...state,
        user: null,
        accessToken: null,
        isAuthenticated: false,
        authLoading: false,
        authError: null,
      };

    case "AUTH_INITIAL_CHECK_COMPLETE":
      return { ...state, authLoading: false };

    case "TOKEN_REFRESH":
      return { ...state, accessToken: action.payload };

    default:
      return state;
  }
};

// Auth Context Value interface
interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;
  accessToken: string | null;
  dispatch: React.Dispatch<AuthAction>;

  // Actions
  login: () => Promise<void>;
  register: () => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Auth Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const [pca, setPca] = React.useState<any>(null);

  // Initialize MSAL and check authentication status
  useEffect(() => {
    const initializeMSAL = async () => {
      try {
        // Check if we're in Expo Go environment (MSAL native modules not available for native)
        const isExpoGo =
          Platform.OS !== "web" &&
          typeof global?.expo !== "undefined" &&
          !global?.nativeCallSyncHook;
        if (
          isExpoGo ||
          (Platform.OS !== "web" &&
            __DEV__ &&
            typeof PublicClientApplication === "undefined")
        ) {
          console.log(
            "MSAL not available in Expo Go - using mock auth for development"
          );
          console.log(
            "To test real authentication, use: npx expo run:ios or npx expo run:android"
          );
          dispatch({ type: "AUTH_INITIAL_CHECK_COMPLETE" });
          return;
        }

        // Use appropriate config based on platform
        const config = Platform.OS === "web" ? webMsalConfig : msalConfig;
        const publicClientApp = new PublicClientApplication(config);

        if (Platform.OS !== "web") {
          await publicClientApp.init();
        }
        setPca(publicClientApp);

        // Try to get accounts silently
        const accounts = await publicClientApp.getAccounts();
        if (accounts.length > 0) {
          // Try to acquire token silently
          try {
            const result = await publicClientApp.acquireTokenSilent({
              ...tokenRequest,
              account: accounts[0],
            });

            const user: User = {
              id:
                result.account?.localAccountId ||
                result.account?.homeAccountId ||
                "",
              email: result.account?.username || "",
              name: result.account?.name || "",
              preferences: [],
              createdAt: new Date(),
            };

            dispatch({
              type: "AUTH_SUCCESS",
              payload: { user, accessToken: result.accessToken },
            });
          } catch (silentError) {
            console.log("Silent token acquisition failed:", silentError);
            dispatch({ type: "AUTH_LOGOUT" });
          }
        } else {
          dispatch({ type: "AUTH_LOGOUT" });
        }
      } catch (error) {
        console.error("MSAL initialization failed:", error);
        dispatch({
          type: "AUTH_FAILURE",
          payload: "Authentication service unavailable",
        });
      } finally {
        dispatch({ type: "AUTH_INITIAL_CHECK_COMPLETE" });
      }
    };

    initializeMSAL();
  }, []);

  // Actions
  const login = useCallback(async () => {
    // Mock login for Expo Go development
    if (__DEV__ && !pca) {
      console.log("Using mock login for development");
      dispatch({ type: "AUTH_START" });

      // Simulate authentication delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockUser: User = {
        id: "dev-user-123",
        email: "test@eventsphereindia.com",
        name: "Test User",
        preferences: [],
        createdAt: new Date(),
      };

      dispatch({
        type: "AUTH_SUCCESS",
        payload: { user: mockUser, accessToken: "mock-token" },
      });
      return;
    }

    if (!pca) {
      throw new Error("Authentication service not initialized");
    }

    dispatch({ type: "AUTH_START" });
    try {
      let result: any;

      if (Platform.OS === "web") {
        // Web platform uses loginPopup
        result = await pca.loginPopup({
          ...loginRequest,
        });
      } else {
        // Native platform uses acquireToken
        result = await pca.acquireToken({
          ...loginRequest,
        });
      }

      const user: User = {
        id:
          result.account?.localAccountId || result.account?.homeAccountId || "",
        email: result.account?.username || "",
        name: result.account?.name || "",
        preferences: [],
        createdAt: new Date(),
      };

      // Store token and user data for offline access
      if (Platform.OS !== "web") {
        await AsyncStorage.setItem("accessToken", result.accessToken);
        await AsyncStorage.setItem("userData", JSON.stringify(user));
      }

      dispatch({
        type: "AUTH_SUCCESS",
        payload: { user, accessToken: result.accessToken },
      });
    } catch (error: any) {
      console.error("Login error:", error);
      dispatch({
        type: "AUTH_FAILURE",
        payload: error.message || "Login failed",
      });
      throw error;
    }
  }, [pca]);

  const register = useCallback(async () => {
    // Microsoft Entra External ID typically handles registration through the same login flow
    // Users register when they first sign in
    return login();
  }, [login]);

  const logout = useCallback(async () => {
    try {
      if (pca) {
        const accounts = await pca.getAccounts();
        if (accounts.length > 0) {
          if (Platform.OS === "web") {
            // Web platform uses logoutPopup or logout
            await pca.logoutPopup({
              account: accounts[0],
            });
          } else {
            // Native platform uses removeAccount
            await pca.removeAccount(accounts[0]);
          }
        }
      }

      if (Platform.OS !== "web") {
        await AsyncStorage.removeItem("accessToken");
        await AsyncStorage.removeItem("userData");
      }
      dispatch({ type: "AUTH_LOGOUT" });
    } catch (error) {
      console.error("Failed to logout:", error);
      // Even if logout fails, we should still update state for immediate UX
      dispatch({ type: "AUTH_LOGOUT" });
    }
  }, [pca]);

  const refreshToken = useCallback(async () => {
    if (!pca) {
      throw new Error("Authentication service not initialized");
    }

    try {
      const accounts = await pca.getAccounts();
      if (accounts.length > 0) {
        const result = await pca.acquireTokenSilent({
          ...tokenRequest,
          account: accounts[0],
        });

        dispatch({ type: "TOKEN_REFRESH", payload: result.accessToken });
        await AsyncStorage.setItem("accessToken", result.accessToken);
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      // If refresh fails, user needs to re-authenticate
      dispatch({ type: "AUTH_LOGOUT" });
      throw error;
    }
  }, [pca]);

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(
    () => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      authLoading: state.authLoading,
      authError: state.authError,
      accessToken: state.accessToken,
      dispatch,
      login,
      register,
      logout,
      refreshToken,
    }),
    [state, login, register, logout, refreshToken]
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
