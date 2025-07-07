import React, { memo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ViewStyle,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

import { format } from "date-fns";
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
      (e: any) => {
        e.stopPropagation();
        onLike?.(event.id);
      },
      [event.id, onLike]
    );

    const formatDate = useCallback((date: Date) => {
      return format(date, "MMM dd");
    }, []);

    const getAvailabilityInfo = useCallback(() => {
      const available = event.capacity - event.bookedCount;
      const percentage = (available / event.capacity) * 100;

      let color = "#10b981"; // green
      let text = "Available";

      if (available === 0) {
        color = "#ef4444"; // red
        text = "Sold Out";
      } else if (percentage <= 20) {
        color = "#ef4444"; // red
        text = `${available} left`;
      } else if (percentage <= 50) {
        color = "#f59e0b"; // yellow
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

    const PriceDisplay = memo(() => (
      <View>
        {event.isFree ? (
          <Text
            className={`font-bold ${
              variant === "featured"
                ? "text-white text-lg"
                : variant === "compact"
                ? "text-primary-500"
                : "text-primary-500 text-lg"
            }`}
          >
            Free
          </Text>
        ) : (
          <Text
            className={`font-bold ${
              variant === "featured"
                ? "text-white text-lg"
                : variant === "compact"
                ? "text-gray-900"
                : "text-gray-900 text-lg"
            }`}
          >
            ₹{event.price.min.toLocaleString()}
            {event.price.max > event.price.min && (
              <Text
                className={`text-sm font-normal ${
                  variant === "featured" ? "text-white/80" : "text-gray-500"
                }`}
              >
                {" "}
                onwards
              </Text>
            )}
          </Text>
        )}
      </View>
    ));

    const AvailabilityBadge = memo(() => (
      <View
        className={`px-2 py-1 rounded-full ${
          variant === "featured" ? "px-3" : ""
        }`}
        style={{ backgroundColor: `${availabilityColor}20` }}
      >
        <Text
          className={`text-xs font-medium ${
            variant === "featured" ? "text-white" : ""
          }`}
          style={{
            color: variant === "featured" ? "white" : availabilityColor,
          }}
        >
          {availabilityText}
        </Text>
      </View>
    ));

    if (variant === "featured") {
      return (
        <Pressable
          onPress={handlePress}
          style={[style, { marginBottom: 24 }]}
          android_ripple={{ color: "rgba(255,255,255,0.1)" }}
        >
          <View className="h-80 rounded-3xl overflow-hidden">
            <ImageBackground
              source={{ uri: event.images[0] }}
              className="flex-1"
              resizeMode="cover"
            >
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.8)"]}
                className="flex-1 justify-end p-6"
              >
                {/* Category Badge */}
                <View className="absolute top-4 left-4">
                  <BlurView
                    intensity={20}
                    tint="light"
                    className="rounded-full px-3 py-1"
                  >
                    <Text className="text-white text-xs font-medium">
                      {event.category}
                    </Text>
                  </BlurView>
                </View>

                {/* Like Button */}
                <View className="absolute top-4 right-4">
                  <LikeButton />
                </View>

                {/* Event Info */}
                <View className="space-y-2">
                  <Text
                    className="text-white text-2xl font-bold"
                    numberOfLines={2}
                  >
                    {event.title}
                  </Text>

                  <View className="flex-row items-center flex-wrap gap-4">
                    <View className="flex-row items-center">
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color="white"
                      />
                      <Text className="text-white text-sm ml-1">
                        {formatDate(event.date)}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <Ionicons name="time-outline" size={16} color="white" />
                      <Text className="text-white text-sm ml-1">
                        {event.time}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <Ionicons
                        name="location-outline"
                        size={16}
                        color="white"
                      />
                      <Text className="text-white text-sm ml-1">
                        {event.venue.city}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between mt-3">
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

    if (variant === "compact") {
      return (
        <Pressable
          onPress={handlePress}
          style={style}
          className="flex-row bg-white rounded-xl p-4 mb-3"
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

    // Default variant
    return (
      <Pressable
        onPress={handlePress}
        style={style}
        className="bg-white rounded-2xl overflow-hidden mb-4"
        android_ripple={{ color: "rgba(14, 165, 233, 0.1)" }}
      >
        <View
          className="h-48 relative"
          style={{
            elevation: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
        >
          <ImageBackground
            source={{ uri: event.images[0] }}
            className="flex-1"
            resizeMode="cover"
          >
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.3)"]}
              className="flex-1"
            />

            {/* Category Badge */}
            <View className="absolute top-3 left-3 bg-primary-500 rounded-full px-3 py-1">
              <Text className="text-white text-xs font-medium">
                {event.category}
              </Text>
            </View>

            {/* Like Button */}
            <View className="absolute top-3 right-3">
              <LikeButton />
            </View>

            {/* Rating */}
            <View className="absolute bottom-3 right-3 bg-white/90 rounded-full px-2 py-1 flex-row items-center">
              <Ionicons name="star" size={12} color="#f59e0b" />
              <Text className="text-gray-900 text-xs font-medium ml-1">
                {event.rating}
              </Text>
            </View>
          </ImageBackground>
        </View>

        <View className="p-4">
          <Text
            className="text-gray-900 font-bold text-lg mb-2"
            numberOfLines={2}
          >
            {event.title}
          </Text>

          <View className="flex-row items-center mb-2">
            <Ionicons name="calendar-outline" size={16} color="#6b7280" />
            <Text className="text-gray-500 text-sm ml-2">
              {formatDate(event.date)} • {event.time}
            </Text>
          </View>

          <View className="flex-row items-center mb-3">
            <Ionicons name="location-outline" size={16} color="#6b7280" />
            <Text className="text-gray-500 text-sm ml-2" numberOfLines={1}>
              {event.venue.name}, {event.venue.city}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <PriceDisplay />
            <AvailabilityBadge />
          </View>
        </View>
      </Pressable>
    );
  }
);

EventCard.displayName = "EventCard";

export default EventCard;
