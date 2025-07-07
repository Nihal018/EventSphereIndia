import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradient?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  gradient = false,
}: ButtonProps) {
  const getButtonClasses = () => {
    const baseClasses = "flex-row items-center justify-center rounded-xl";

    const sizeClasses = {
      sm: "px-4 py-2 h-10",
      md: "px-6 py-3 h-12",
      lg: "px-8 py-2 h-14",
    };

    const variantClasses = {
      primary: "bg-primary-500",
      secondary: "bg-accent-500",
      outline: "border-2 border-primary-500 bg-transparent",
      ghost: "bg-transparent",
    };

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`;
  };

  const getTextClasses = () => {
    const baseClasses = "font-semibold text-center";

    const sizeClasses = {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    };

    const variantClasses = {
      primary: "text-white",
      secondary: "text-white",
      outline: "text-primary-500",
      ghost: "text-primary-500",
    };

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`;
  };

  const buttonClass = getButtonClasses();
  const textClass = getTextClasses();

  const isDisabled = disabled || loading;
  const opacity = isDisabled ? 0.5 : 1;

  if (gradient && (variant === "primary" || variant === "secondary")) {
    const gradientColors: [string, string] =
      variant === "primary" ? ["#0ea5e9", "#0284c7"] : ["#f37316", "#e85d04"];

    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        style={[{ opacity }, style]}
        className={buttonClass
          .replace("bg-primary-500", "")
          .replace("bg-accent-500", "")}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="flex-1 flex-row items-center justify-center rounded-xl"
        >
          {loading && (
            <ActivityIndicator size="small" color="white" className="mr-2" />
          )}
          {leftIcon && !loading && <>{leftIcon}</>}
          <Text className={textClass} style={textStyle}>
            {title}
          </Text>
          {rightIcon && !loading && <>{rightIcon}</>}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[{ opacity }, style]}
      className={buttonClass}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={
            variant === "outline" || variant === "ghost" ? "#0ea5e9" : "white"
          }
          className="mr-2"
        />
      )}
      {leftIcon && !loading && <>{leftIcon}</>}
      <Text className={textClass} style={textStyle}>
        {title}
      </Text>
      {rightIcon && !loading && <>{rightIcon}</>}
    </TouchableOpacity>
  );
}
