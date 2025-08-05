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
  showBackButton?: boolean;
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
  showBackButton = false,
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
          paddingTop: transparent ? headerPaddingTop + 10 : 10,
          paddingBottom: 15,
          paddingHorizontal: 20,
          backgroundColor: transparent ? "transparent" : "#ffffff",
          borderBottomWidth: transparent ? 0 : 1,
          borderBottomColor: transparent ? "transparent" : "#f3f4f6",
        },
        style,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        {/* Left Side */}
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          {(leftIcon || showBack || showBackButton) && (
            <TouchableOpacity 
              onPress={onLeftPress} 
              style={{
                marginRight: 16,
                padding: 8,
                marginLeft: -8,
              }}
            >
              <Ionicons
                name={leftIcon || "chevron-back"}
                size={24}
                color={transparent ? "#ffffff" : "#1f2937"}
              />
            </TouchableOpacity>
          )}

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: transparent ? "#ffffff" : "#1f2937",
              }}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={{
                  fontSize: 14,
                  color: transparent ? "#ffffff80" : "#6b7280",
                }}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {/* Right Side */}
        {rightIcon && (
          <TouchableOpacity 
            onPress={onRightPress} 
            style={{
              padding: 8,
              marginRight: -8,
            }}
          >
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
