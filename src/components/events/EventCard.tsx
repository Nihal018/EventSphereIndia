import React, { memo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ViewStyle,
  Pressable,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

import { format, parseISO } from "date-fns";
import { Event } from "../../types";

interface EventCardProps {
  event: Event;
  onPress: (event: Event) => void;
  onLike?: (eventId: string) => void;
  style?: ViewStyle;
  variant?: "default" | "featured" | "compact";
  isLiked?: boolean;
}

const EventCard = memo<EventCardProps>(
  ({ event, onPress, onLike, style, variant = "default", isLiked = false }) => {
    const handlePress = useCallback(() => {
      onPress(event);
    }, [event, onPress]);

    const handleLike = useCallback(
      (e: import("react-native").GestureResponderEvent) => {
        e.stopPropagation();
        onLike?.(event.id);
      },
      [event.id, onLike]
    );

    const formatDate = useCallback((date: Date | string) => {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return format(dateObj, "MMM dd");
    }, []);

    const getAvailabilityInfo = useCallback(() => {
      const available = event.capacity - event.bookedCount;
      const percentage = (available / event.capacity) * 100;

      let color = "#10b981";
      let text = "Available";

      if (available === 0) {
        color = "#ef4444";
        text = "Sold Out";
      } else if (percentage <= 20) {
        color = "#ef4444";
        text = `${available} left`;
      } else if (percentage <= 50) {
        color = "#f59e0b";
        text = `${available} left`;
      }

      return { color, text };
    }, [event.capacity, event.bookedCount]);

    const { color: availabilityColor, text: availabilityText } =
      getAvailabilityInfo();

    const LikeButton = memo(() => (
      <Pressable
        onPress={handleLike}
        className={`rounded-full p-2 ${
          variant === "featured" ? "bg-white/20" : "bg-white/90"
        }`}
        style={({ pressed }) => ({
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Ionicons
          name={isLiked ? "heart" : "heart-outline"}
          size={variant === "featured" ? 20 : 18}
          color={
            isLiked ? "#ef4444" : variant === "featured" ? "white" : "#1f2937"
          }
        />
      </Pressable>
    ));

    const PriceDisplay = memo(() => {
      const isFeatured = variant === "featured";
      const isDefault = variant === "default";
      
      return (
        <View>
          {event.isFree ? (
            <Text
              className={`font-bold ${
                isFeatured
                  ? "text-white text-lg"
                  : isDefault
                  ? "text-primary-500 text-sm"
                  : "text-primary-500 text-lg"
              }`}
            >
              Free
            </Text>
          ) : (
            <Text
              className={`font-bold ${
                isFeatured
                  ? "text-white text-lg"
                  : isDefault
                  ? "text-gray-900 text-sm"
                  : "text-gray-900 text-lg"
              }`}
            >
              ₹{event.price.min.toLocaleString()}
              {event.price.max > event.price.min && (
                <Text
                  className={`text-xs font-normal ${
                    isFeatured ? "text-white/80" : "text-gray-500"
                  }`}
                >
                  {isDefault ? "+" : " onwards"}
                </Text>
              )}
            </Text>
          )}
        </View>
      );
    });

    const AvailabilityBadge = memo(() => {
      const isFeatured = variant === "featured";
      const isDefault = variant === "default";
      
      return (
        <View
          className={`rounded-full ${
            isFeatured ? "px-3 py-1" : isDefault ? "px-1.5 py-0.5" : "px-2 py-1"
          }`}
          style={{ backgroundColor: `${availabilityColor}${isFeatured ? "20" : "15"}` }}
        >
          <Text
            className={`font-medium ${
              isFeatured ? "text-xs text-white" : isDefault ? "text-xs" : "text-xs"
            }`}
            style={{
              color: isFeatured ? "white" : availabilityColor,
              fontSize: isDefault ? 10 : 12,
            }}
          >
            {isDefault && availabilityText.includes(" left") 
              ? availabilityText.replace(" left", "")
              : availabilityText
            }
          </Text>
        </View>
      );
    });

    // Compact variant (unchanged)
    if (variant === "compact") {
      return (
        <Pressable
          onPress={handlePress}
          style={[style]}
          className="flex-row bg-white rounded-xl p-4 shadow-md"
          android_ripple={{ color: "rgba(14, 165, 233, 0.1)" }}
        >
          <View className="w-20 h-20 rounded-xl overflow-hidden mr-4">
            <ImageBackground
              source={{ uri: event.images[0] }}
              className="flex-1"
              resizeMode="cover"
            />
          </View>

          <View className="flex-1">
            <Text
              className="text-gray-900 font-semibold text-base"
              numberOfLines={1}
            >
              {event.title}
            </Text>

            <View className="flex-row items-center mt-1">
              <Ionicons name="calendar-outline" size={14} color="#6b7280" />
              <Text className="text-gray-500 text-sm ml-1">
                {formatDate(event.date)} • {event.time}
              </Text>
            </View>

            <View className="flex-row items-center mt-1">
              <Ionicons name="location-outline" size={14} color="#6b7280" />
              <Text className="text-gray-500 text-sm ml-1" numberOfLines={1}>
                {event.venue.name}
              </Text>
            </View>

            <View className="flex-row items-center justify-between mt-2">
              <PriceDisplay />
              <AvailabilityBadge />
            </View>
          </View>
        </Pressable>
      );
    }

    // FIXED Featured variant
    if (variant === "featured") {
      return (
        <Pressable
          onPress={handlePress}
          style={[style]}
          className="bg-transparent"
          android_ripple={{ color: "rgba(255,255,255,0.1)" }}
        >
          <View
            className="h-72 rounded-3xl overflow-hidden"
            style={{
              // Ensure proper clipping on iOS
              ...Platform.select({
                ios: {
                  backgroundColor: "transparent",
                },
              }),
            }}
          >
            <ImageBackground
              source={{ uri: event.images[0] }}
              className="flex-1"
              resizeMode="cover"
              // Add imageStyle for better iOS handling
              imageStyle={{
                borderRadius: 24, // Match rounded-3xl
              }}
            >
              {/* Enhanced gradient for better iOS visibility */}
              <LinearGradient
                colors={[
                  "transparent",
                  "rgba(0,0,0,0.1)",
                  "rgba(0,0,0,0.6)",
                  "rgba(0,0,0,0.8)",
                ]}
                locations={[0, 0.3, 0.7, 1]}
                className="flex-1 justify-end"
                style={{
                  paddingBottom: 24,
                  paddingLeft: 24,
                  paddingRight: 24,
                  paddingTop: 24,
                }}
              >
                {/* Category Badge - Fixed positioning */}
                <View
                  style={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    zIndex: 10,
                  }}
                >
                  <BlurView
                    intensity={Platform.OS === "ios" ? 25 : 20}
                    tint="light"
                    style={{
                      borderRadius: 20,
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      // iOS-specific blur background
                      ...Platform.select({
                        ios: {
                          backgroundColor: "rgba(255, 255, 255, 0.25)",
                        },
                        android: {
                          backgroundColor: "rgba(255, 255, 255, 0.15)",
                        },
                      }),
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 12,
                        fontWeight: "500",
                        textShadowColor: "rgba(0, 0, 0, 0.3)",
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      }}
                    >
                      {event.category}
                    </Text>
                  </BlurView>
                </View>

                {/* Like Button - Fixed positioning */}
                <View
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    zIndex: 10,
                  }}
                >
                  <LikeButton />
                </View>

                {/* Event Info - Better spacing and text shadows */}
                <View style={{ gap: 8, marginTop: 16 }}>
                  <Text
                    style={{
                      color: "white",
                      fontSize: 24,
                      fontWeight: "bold",
                      lineHeight: 28,
                      textShadowColor: "rgba(0, 0, 0, 0.5)",
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 4,
                    }}
                    numberOfLines={2}
                  >
                    {event.title}
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 16,
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color="white"
                        style={{
                          textShadowColor: "rgba(0, 0, 0, 0.5)",
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 2,
                        }}
                      />
                      <Text
                        style={{
                          color: "white",
                          fontSize: 14,
                          marginLeft: 4,
                          textShadowColor: "rgba(0, 0, 0, 0.5)",
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 2,
                        }}
                      >
                        {formatDate(event.date)}
                      </Text>
                    </View>

                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Ionicons
                        name="time-outline"
                        size={16}
                        color="white"
                        style={{
                          textShadowColor: "rgba(0, 0, 0, 0.5)",
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 2,
                        }}
                      />
                      <Text
                        style={{
                          color: "white",
                          fontSize: 14,
                          marginLeft: 4,
                          textShadowColor: "rgba(0, 0, 0, 0.5)",
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 2,
                        }}
                      >
                        {event.time}
                      </Text>
                    </View>

                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Ionicons
                        name="location-outline"
                        size={16}
                        color="white"
                        style={{
                          textShadowColor: "rgba(0, 0, 0, 0.5)",
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 2,
                        }}
                      />
                      <Text
                        style={{
                          color: "white",
                          fontSize: 14,
                          marginLeft: 4,
                          textShadowColor: "rgba(0, 0, 0, 0.5)",
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 2,
                        }}
                      >
                        {event.venue.city}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 12,
                    }}
                  >
                    <PriceDisplay />
                    <AvailabilityBadge />
                  </View>
                </View>
              </LinearGradient>
            </ImageBackground>
          </View>
        </Pressable>
      );
    }

    // Optimized Default variant for grid layout
    return (
      <Pressable
        onPress={handlePress}
        style={[style]}
        className="bg-white rounded-2xl overflow-hidden"
        android_ripple={{ color: "rgba(14, 165, 233, 0.1)" }}
      >
        <View
          style={{
            // Responsive height based on screen width for better grid aspect ratio
            height: style?.width ? (style.width as number) * 0.75 : 160,
            backgroundColor: "#f3f4f6",
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 3,
          }}
        >
          <ImageBackground
            source={{ uri: event.images[0] }}
            className="flex-1"
            resizeMode="cover"
            imageStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
          >
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.4)"]}
              className="flex-1"
            />

            <View className="absolute top-2 left-2 bg-primary-500 rounded-lg px-2 py-1">
              <Text className="text-white text-xs font-medium">
                {event.category}
              </Text>
            </View>

            <View className="absolute top-2 right-2">
              <LikeButton />
            </View>

            <View className="absolute bottom-2 right-2 bg-white/95 rounded-lg px-2 py-1 flex-row items-center">
              <Ionicons name="star" size={11} color="#f59e0b" />
              <Text className="text-gray-900 text-xs font-medium ml-1">
                {event.rating}
              </Text>
            </View>
          </ImageBackground>
        </View>

        <View className="p-3" style={{ minHeight: 120 }}>
          <Text
            className="text-gray-900 font-bold text-base leading-tight mb-2"
            numberOfLines={2}
            style={{ fontSize: 15, lineHeight: 18 }}
          >
            {event.title}
          </Text>

          <View className="flex-row items-center mb-1.5">
            <Ionicons name="calendar-outline" size={13} color="#6b7280" />
            <Text className="text-gray-500 text-xs ml-1.5 flex-1" numberOfLines={1}>
              {formatDate(event.date)} • {event.time}
            </Text>
          </View>

          <View className="flex-row items-center mb-2.5">
            <Ionicons name="location-outline" size={13} color="#6b7280" />
            <Text className="text-gray-500 text-xs ml-1.5 flex-1" numberOfLines={1}>
              {event.venue.city}
            </Text>
          </View>

          <View className="flex-row items-center justify-between mt-auto">
            <View className="flex-1 mr-2">
              <PriceDisplay />
            </View>
            <AvailabilityBadge />
          </View>
        </View>
      </Pressable>
    );
  }
);

EventCard.displayName = "EventCard";

export default EventCard;
