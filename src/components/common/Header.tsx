// Header.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ViewStyle,
  Platform, // Import Platform
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface HeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  gradient?: boolean;
  style?: ViewStyle;
  transparent?: boolean;
  showBack?: boolean;
}

export default function Header({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  gradient = false,
  style,
  transparent = false,
  showBack = false,
}: HeaderProps) {
  const insets = useSafeAreaInsets();

  const headerPaddingTop =
    Platform.OS === "android"
      ? StatusBar.currentHeight ?? insets.top ?? 0
      : insets.top ?? 0;

  const HeaderContent = () => (
    <View
      style={[
        {
          // If transparent, we need to account for status bar.
          // Otherwise, SafeAreaView on the screen handles it, and we just add regular top padding.
          paddingTop: transparent ? headerPaddingTop + 10 : 10,
          paddingBottom: 15,
          paddingHorizontal: 20,
        },
        style,
      ]}
      className={transparent ? "" : "bg-white border-b border-gray-100"}
    >
      <View className="flex-row items-center justify-between">
        {/* Left Side */}
        <View className="flex-row items-center flex-1">
          {(leftIcon || showBack) && (
            <TouchableOpacity onPress={onLeftPress} className="mr-4 p-2 -ml-2">
              <Ionicons
                name={leftIcon || "chevron-back"}
                size={24}
                color={transparent ? "#ffffff" : "#1f2937"}
              />
            </TouchableOpacity>
          )}

          <View className="flex-1">
            <Text
              className={`text-lg font-bold ${
                transparent ? "text-white" : "text-gray-900"
              }`}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                className={`text-sm ${
                  transparent ? "text-white/80" : "text-gray-500"
                }`}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {/* Right Side */}
        {rightIcon && (
          <TouchableOpacity onPress={onRightPress} className="p-2 -mr-2">
            <Ionicons
              name={rightIcon}
              size={24}
              color={transparent ? "#ffffff" : "#1f2937"}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (gradient) {
    return (
      <>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <LinearGradient
          colors={["#0ea5e9", "#0284c7"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <HeaderContent />
        </LinearGradient>
      </>
    );
  }

  return (
    <>
      <StatusBar
        barStyle={transparent ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      <HeaderContent />
    </>
  );
}
