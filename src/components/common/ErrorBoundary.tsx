import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Button from "./Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Log error to crash analytics service
    // Analytics.logError(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-1 justify-center items-center px-6">
            <View className="items-center mb-8">
              <View className="w-24 h-24 bg-red-100 rounded-full items-center justify-center mb-6">
                <Ionicons name="warning-outline" size={48} color="#ef4444" />
              </View>

              <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
                Something went wrong
              </Text>

              <Text className="text-gray-600 text-center mb-6 leading-6">
                We're sorry for the inconvenience. The app encountered an
                unexpected error.
              </Text>
            </View>

            <View className="w-full space-y-4">
              <Button
                title="Try Again"
                onPress={this.handleRetry}
                gradient
                size="lg"
              />

              <Button
                title="Go to Home"
                onPress={() => {
                  this.handleRetry();
                  // Navigate to home screen
                }}
                variant="outline"
                size="lg"
              />
            </View>

            {__DEV__ && this.state.error && (
              <ScrollView className="w-full mt-8 max-h-40">
                <View className="bg-gray-100 rounded-lg p-4">
                  <Text className="text-red-600 font-mono text-xs">
                    {this.state.error.toString()}
                  </Text>
                  {this.state.errorInfo && (
                    <Text className="text-gray-600 font-mono text-xs mt-2">
                      {this.state.errorInfo.componentStack}
                    </Text>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
