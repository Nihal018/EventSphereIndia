import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradient?: boolean;
  fullWidth?: boolean;
  className?: string;
  textClassName?: string;
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full";
}

const Button: React.FC<ButtonProps> = ({
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
  fullWidth = false,
  className = "",
  textClassName = "",
  rounded = "lg",
}) => {
  // Size configurations
  const sizeConfigs = {
    xs: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      minHeight: 32,
    },
    sm: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      minHeight: 36,
    },
    md: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      minHeight: 44,
    },
    lg: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      minHeight: 48,
    },
    xl: {
      paddingHorizontal: 32,
      paddingVertical: 16,
      minHeight: 56,
    },
  };

  // Rounded configurations
  const roundedConfigs = {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 999,
  };

  // Variant configurations
  const variantConfigs = {
    primary: {
      backgroundColor: "#0ea5e9",
      borderColor: "#0ea5e9",
      borderWidth: 0,
      textColor: "#ffffff",
    },
    secondary: {
      backgroundColor: "#f37316",
      borderColor: "#f37316",
      borderWidth: 0,
      textColor: "#ffffff",
    },
    outline: {
      backgroundColor: "transparent",
      borderColor: "#0ea5e9",
      borderWidth: 2,
      textColor: "#0ea5e9",
    },
    ghost: {
      backgroundColor: "transparent",
      borderColor: "transparent",
      borderWidth: 0,
      textColor: "#0ea5e9",
    },
    destructive: {
      backgroundColor: "#ef4444",
      borderColor: "#ef4444",
      borderWidth: 0,
      textColor: "#ffffff",
    },
  };

  // Text size configurations
  const textSizeConfigs = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
  };

  // Gradient configurations
  const gradientConfigs = {
    primary: ["#0ea5e9", "#0284c7"],
    secondary: ["#f37316", "#e85d04"],
    destructive: ["#ef4444", "#dc2626"],
  };

  const sizeConfig = sizeConfigs[size];
  const variantConfig = variantConfigs[variant];
  const textSize = textSizeConfigs[size];
  const borderRadius = roundedConfigs[rounded];

  const isDisabled = disabled || loading;
  const opacity = isDisabled ? 0.6 : 1;

  // Combined button style - Fixed to use proper ViewStyle
  const buttonStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...sizeConfig,
    backgroundColor: variantConfig.backgroundColor,
    borderColor: variantConfig.borderColor,
    borderWidth: variantConfig.borderWidth,
    borderRadius,
    opacity,
    width: fullWidth ? "100%" : undefined,
    ...style,
  };

  // Combined text style
  const combinedTextStyle: TextStyle = {
    color: variantConfig.textColor,
    fontSize: textSize,
    fontWeight: "600",
    textAlign: "center",
    ...textStyle,
  };

  // Loading indicator color
  const getLoadingColor = () => {
    if (variant === "outline" || variant === "ghost") {
      return "#0ea5e9";
    }
    return "#ffffff";
  };

  // Render gradient button
  if (
    gradient &&
    (variant === "primary" ||
      variant === "secondary" ||
      variant === "destructive")
  ) {
    const gradientColors = gradientConfigs[variant] || gradientConfigs.primary;

    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        style={[buttonStyle, { backgroundColor: "transparent" }]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius,
          }}
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {loading && (
            <ActivityIndicator
              size="small"
              color="#ffffff"
              style={{ marginRight: leftIcon || title ? 8 : 0 }}
            />
          )}
          {leftIcon && !loading && (
            <View style={{ marginRight: 8 }}>{leftIcon}</View>
          )}
          <Text style={combinedTextStyle}>{title}</Text>
          {rightIcon && !loading && (
            <View style={{ marginLeft: 8 }}>{rightIcon}</View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // Render regular button
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={buttonStyle}
      activeOpacity={0.8}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={getLoadingColor()}
          style={{ marginRight: leftIcon || title ? 8 : 0 }}
        />
      )}
      {leftIcon && !loading && (
        <View style={{ marginRight: 8 }}>{leftIcon}</View>
      )}
      <Text style={combinedTextStyle}>{title}</Text>
      {rightIcon && !loading && (
        <View style={{ marginLeft: 8 }}>{rightIcon}</View>
      )}
    </TouchableOpacity>
  );
};

export default Button;
