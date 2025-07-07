import React from "react";
import { View, ActivityIndicator, Text, ViewStyle } from "react-native";

interface LoadingSpinnerProps {
  size?: "small" | "large";
  color?: string;
  text?: string;
  style?: ViewStyle;
  overlay?: boolean;
}

export default function LoadingSpinner({
  size = "large",
  color = "#0ea5e9",
  text,
  style,
  overlay = false,
}: LoadingSpinnerProps) {
  const SpinnerContent = () => (
    <View
      style={style}
      className={`items-center justify-center ${overlay ? "flex-1" : ""}`}
    >
      <ActivityIndicator size={size} color={color} />
      {text && <Text className="text-gray-600 mt-3 text-base">{text}</Text>}
    </View>
  );

  if (overlay) {
    return (
      <View className="absolute inset-0 bg-white/90 z-50">
        <SpinnerContent />
      </View>
    );
  }

  return <SpinnerContent />;
}
