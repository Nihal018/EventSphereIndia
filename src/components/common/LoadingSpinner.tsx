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
      <View style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
        zIndex: 50,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <SpinnerContent />
      </View>
    );
  }

  return <SpinnerContent />;
}
