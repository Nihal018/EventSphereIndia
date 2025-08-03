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
import { apiService } from "../services/api/apiService";

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
  userProfile: any | null;
  profileLoading: boolean;
  profileError: string | null;
}

// Auth Action types
type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: { user: User; accessToken: string } }
  | { type: "AUTH_FAILURE"; payload: string }
  | { type: "AUTH_LOGOUT" }
  | { type: "AUTH_INITIAL_CHECK_COMPLETE" }
  | { type: "TOKEN_REFRESH"; payload: string }
  | { type: "PROFILE_LOAD_START" }
  | { type: "PROFILE_LOAD_SUCCESS"; payload: any }
  | { type: "PROFILE_LOAD_FAILURE"; payload: string }
  | { type: "PROFILE_UPDATE_SUCCESS"; payload: any };

// Initial Auth State
const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  authLoading: true,
  authError: null,
  accessToken: null,
  userProfile: null,
  profileLoading: false,
  profileError: null,
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
        userProfile: null,
        profileLoading: false,
        profileError: null,
      };

    case "AUTH_INITIAL_CHECK_COMPLETE":
      return { ...state, authLoading: false };

    case "TOKEN_REFRESH":
      return { ...state, accessToken: action.payload };

    case "PROFILE_LOAD_START":
      return { ...state, profileLoading: true, profileError: null };

    case "PROFILE_LOAD_SUCCESS":
      return { 
        ...state, 
        userProfile: action.payload, 
        profileLoading: false, 
        profileError: null 
      };

    case "PROFILE_LOAD_FAILURE":
      return { 
        ...state, 
        profileLoading: false, 
        profileError: action.payload 
      };

    case "PROFILE_UPDATE_SUCCESS":
      return { 
        ...state, 
        userProfile: action.payload,
        profileError: null 
      };

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
  userProfile: any | null;
  profileLoading: boolean;
  profileError: string | null;
  dispatch: React.Dispatch<AuthAction>;

  // Auth Actions
  login: () => Promise<void>;
  register: () => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;

  // User Management Actions
  loadUserProfile: (userId: string) => Promise<void>;
  updateUserProfile: (userId: string, updates: any) => Promise<void>;
  createUserProfile: (userData: any) => Promise<void>;
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
          typeof (global as any)?.expo !== "undefined" &&
          !(global as any)?.nativeCallSyncHook;
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

            // Automatically load or create user profile after successful authentication
            try {
              await loadUserProfileSilently(user.id);
            } catch (profileError) {
              console.log("Failed to load user profile:", profileError);
              // Attempt to create user profile if it doesn't exist
              try {
                await createUserProfileSilently({
                  id: user.id,
                  email: user.email,
                  name: user.name,
                  role: "user",
                });
              } catch (createError) {
                console.log("Failed to create user profile:", createError);
              }
            }
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

      // In mock mode, try to create the user in the database first
      try {
        await createUserProfileSilently({
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: "user",
        });
      } catch (createError) {
        console.log("Mock user already exists or creation failed, using local mock profile");
        // Fallback to local mock profile
        dispatch({
          type: "PROFILE_LOAD_SUCCESS",
          payload: {
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name,
            role: "user",
            stats: {
              totalBookings: 5,
              confirmedBookings: 4,
              cancelledBookings: 1,
              pendingBookings: 0,
              totalSpent: 2500,
            },
          },
        });
      }
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

      // Automatically load or create user profile after successful login
      try {
        await loadUserProfileSilently(user.id);
      } catch (profileError) {
        console.log("Failed to load user profile:", profileError);
        // Attempt to create user profile if it doesn't exist
        try {
          await createUserProfileSilently({
            id: user.id,
            email: user.email,
            name: user.name,
            role: "user",
          });
        } catch (createError) {
          console.log("Failed to create user profile:", createError);
        }
      }
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

  // User Management Methods
  const loadUserProfileSilently = useCallback(async (userId: string) => {
    try {
      const response = await apiService.getUserProfile(userId);
      if (response.success && response.data) {
        dispatch({
          type: "PROFILE_LOAD_SUCCESS",
          payload: response.data.user,
        });
      } else {
        throw new Error(response.error || "Failed to load user profile");
      }
    } catch (error) {
      throw error;
    }
  }, []);

  const createUserProfileSilently = useCallback(async (userData: any) => {
    try {
      const response = await apiService.createUser(userData);
      if (response.success && response.data) {
        dispatch({
          type: "PROFILE_LOAD_SUCCESS",
          payload: response.data.user,
        });
      } else {
        throw new Error(response.error || "Failed to create user profile");
      }
    } catch (error) {
      throw error;
    }
  }, []);

  const loadUserProfile = useCallback(async (userId: string) => {
    dispatch({ type: "PROFILE_LOAD_START" });
    try {
      const response = await apiService.getUserProfile(userId);
      if (response.success && response.data) {
        dispatch({
          type: "PROFILE_LOAD_SUCCESS",
          payload: response.data.user,
        });
      } else {
        // If it's the mock user and profile doesn't exist, try to create it
        if (__DEV__ && userId === "dev-user-123") {
          console.log("Mock user profile not found, attempting to create it");
          try {
            const createResponse = await apiService.createUser({
              id: userId,
              email: "test@eventsphereindia.com",
              name: "Test User",
              role: "user",
            });
            
            if (createResponse.success && createResponse.data) {
              dispatch({
                type: "PROFILE_LOAD_SUCCESS",
                payload: createResponse.data.user,
              });
            } else {
              dispatch({
                type: "PROFILE_LOAD_FAILURE",
                payload: response.error || "Failed to load user profile",
              });
            }
          } catch (createError) {
            dispatch({
              type: "PROFILE_LOAD_FAILURE",
              payload: response.error || "Failed to load user profile",
            });
          }
        } else {
          dispatch({
            type: "PROFILE_LOAD_FAILURE",
            payload: response.error || "Failed to load user profile",
          });
        }
      }
    } catch (error: any) {
      dispatch({
        type: "PROFILE_LOAD_FAILURE",
        payload: error.message || "Failed to load user profile",
      });
    }
  }, []);

  const updateUserProfile = useCallback(async (userId: string, updates: any) => {
    try {
      // In development mode with mock user, try to create user first if update fails
      if (__DEV__ && userId === "dev-user-123") {
        try {
          const response = await apiService.updateUserProfile(userId, updates);
          if (response.success && response.data) {
            dispatch({
              type: "PROFILE_UPDATE_SUCCESS",
              payload: response.data.user,
            });
            return;
          }
        } catch (updateError) {
          // If update fails, try to create the user first
          console.log("Update failed, trying to create mock user in database");
          try {
            await apiService.createUser({
              id: userId,
              email: "test@eventsphereindia.com",
              name: "Test User",
              role: "user",
              ...updates,
            });
            
            // Now try to update again
            const retryResponse = await apiService.updateUserProfile(userId, updates);
            if (retryResponse.success && retryResponse.data) {
              dispatch({
                type: "PROFILE_UPDATE_SUCCESS",
                payload: retryResponse.data.user,
              });
              return;
            }
          } catch (createError) {
            console.log("Failed to create mock user:", createError);
          }
        }
      }

      const response = await apiService.updateUserProfile(userId, updates);
      if (response.success && response.data) {
        dispatch({
          type: "PROFILE_UPDATE_SUCCESS",
          payload: response.data.user,
        });
      } else {
        dispatch({
          type: "PROFILE_LOAD_FAILURE",
          payload: response.error || "Failed to update user profile",
        });
      }
    } catch (error: any) {
      dispatch({
        type: "PROFILE_LOAD_FAILURE",
        payload: error.message || "Failed to update user profile",
      });
    }
  }, []);

  const createUserProfile = useCallback(async (userData: any) => {
    try {
      const response = await apiService.createUser(userData);
      if (response.success && response.data) {
        dispatch({
          type: "PROFILE_LOAD_SUCCESS",
          payload: response.data.user,
        });
      } else {
        dispatch({
          type: "PROFILE_LOAD_FAILURE",
          payload: response.error || "Failed to create user profile",
        });
      }
    } catch (error: any) {
      dispatch({
        type: "PROFILE_LOAD_FAILURE",
        payload: error.message || "Failed to create user profile",
      });
    }
  }, []);

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(
    () => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      authLoading: state.authLoading,
      authError: state.authError,
      accessToken: state.accessToken,
      userProfile: state.userProfile,
      profileLoading: state.profileLoading,
      profileError: state.profileError,
      dispatch,
      login,
      register,
      logout,
      refreshToken,
      loadUserProfile,
      updateUserProfile,
      createUserProfile,
    }),
    [state, login, register, logout, refreshToken, loadUserProfile, updateUserProfile, createUserProfile]
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
