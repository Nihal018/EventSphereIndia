import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NetInfo from "@react-native-community/netinfo";
import { RootStackParamList } from "../types";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import ErrorBoundary from "../components/common/ErrorBoundary";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import { useUI } from "../contexts/UIContext";
const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, authLoading } = useAuth();
  const { dispatch } = useUI();

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      dispatch({
        type: "SET_ONLINE_STATUS",
        payload: state.isConnected ?? false,
      });
    });

    return unsubscribe;
  }, [dispatch]);

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <ErrorBoundary>
        <LoadingSpinner
          text="Loading..."
          overlay
          style={{ backgroundColor: "#ffffff" }}
        />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
            animationDuration: 300,
          }}
        >
          {isAuthenticated ? (
            <Stack.Screen
              name="Main"
              component={MainNavigator}
              options={{
                animationTypeForReplace: "push",
              }}
            />
          ) : (
            <Stack.Screen
              name="Auth"
              component={AuthNavigator}
              options={{
                animationTypeForReplace: "pop",
              }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
};

export default AppNavigator;
