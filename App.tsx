import "./global.css";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppNavigator from "./src/navigation/AppNavigator";
import ErrorBoundary from "./src/components/common/ErrorBoundary";
import { AuthProvider } from "./src/contexts/AuthContext";
import { UIProvider } from "./src/contexts/UIContext";
import { EventsProvider } from "./src/contexts/EventsContext";
import { BookingsProvider } from "./src/contexts/BookingsContext";
import { FiltersProvider } from "./src/contexts/FiltersContext";

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AuthProvider>
            <UIProvider>
              <EventsProvider>
                <BookingsProvider>
                  <FiltersProvider>
                    <AppNavigator />
                    <StatusBar style="auto" />
                  </FiltersProvider>
                </BookingsProvider>
              </EventsProvider>
            </UIProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
