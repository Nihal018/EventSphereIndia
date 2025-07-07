import React from "react";
import { View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import clsx from "clsx"; // Import clsx for robust class name concatenation

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  className?: string; // Add className prop for external NativeWind classes
  padding?: "none" | "sm" | "md" | "lg";
  shadow?: boolean;
  gradient?: boolean;
  gradientColors?: [string, string, ...string[]];
  borderRadius?: "sm" | "md" | "lg" | "xl";
}

export default function Card({
  children,
  style,
  className, // Receive the className prop
  padding = "md",
  shadow = true,
  gradient = false,
  gradientColors = ["#ffffff", "#f8fafc"],
  borderRadius = "lg",
}: CardProps) {
  // Helper function to get padding classes based on prop
  const getPaddingClasses = () => {
    const paddingClasses = {
      none: "",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    };
    return paddingClasses[padding];
  };

  // Helper function to get border-radius classes based on prop
  const getBorderRadiusClasses = () => {
    const borderRadiusClasses = {
      sm: "rounded-lg",
      md: "rounded-xl",
      lg: "rounded-2xl",
      xl: "rounded-3xl",
    };
    return borderRadiusClasses[borderRadius];
  };

  // Helper function to get shadow classes based on prop
  // NativeWind's shadow classes include color and opacity by default.
  // 'shadow-lg' is a good general-purpose shadow.
  const getShadowClasses = () => {
    return shadow ? "shadow-lg" : "";
  };

  // Combine all internally generated NativeWind classes
  const internalCardClasses = clsx(
    getPaddingClasses(),
    getBorderRadiusClasses(),
    getShadowClasses()
  );

  // Combine internal classes with any external classes passed via the className prop
  const finalCardClasses = clsx(internalCardClasses, className);

  if (gradient) {
    return (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        // The 'style' prop from the user is merged here.
        // The 'className' prop handles all NativeWind styling.
        style={style}
        className={finalCardClasses} // Use the combined finalCardClasses
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View
      // The 'style' prop from the user is merged here.
      // The 'className' prop handles all NativeWind styling, including background and shadow.
      style={style}
      className={clsx(finalCardClasses, "bg-white")} // Add bg-white for non-gradient cards and use combined classes
    >
      {children}
    </View>
  );
}
