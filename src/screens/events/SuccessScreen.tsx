import React, { useCallback, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  CompositeNavigationProp,
  useNavigation,
  useRoute,
  RouteProp,
} from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { format } from "date-fns";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  MainStackParamList,
  MainTabParamList,
  Event,
  Booking,
} from "../../types";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useEvents } from "../../hooks/useEvents";

type SuccessScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<MainStackParamList, "Success">,
  BottomTabNavigationProp<MainTabParamList>
>;

type SuccessScreenRouteProp = RouteProp<MainStackParamList, "Success">;

const SuccessScreen: React.FC = () => {
  const navigation = useNavigation<SuccessScreenNavigationProp>();
  const route = useRoute<SuccessScreenRouteProp>();
  const { bookingId, eventId, amount } = route.params as {
    bookingId: string;
    eventId: string;
    amount: number;
  };

  const { getEventById } = useEvents();
  const event: Event | undefined = getEventById(eventId);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleViewBookings = useCallback(() => {
    navigation.navigate("MainTabs", { screen: "Bookings" });
  }, [navigation]);

  const handleGoHome = useCallback(() => {
    navigation.navigate("MainTabs");
  }, [navigation]);

  const handleDownloadTicket = useCallback(() => {
    console.log("Download ticket for booking ID:", bookingId);
  }, [bookingId]);

  const handleShare = useCallback(() => {
    console.log("Share booking ID:", bookingId);
  }, [bookingId]);

  // Fixed date and time formatting
  const formatEventDate = (date: Date | string | undefined): string => {
    if (!date) return "N/A";
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return "N/A";
      return format(dateObj, "EEEE, MMMM dd, yyyy");
    } catch (error) {
      console.error("Date formatting error:", error);
      return "N/A";
    }
  };

  const formatEventTime = (time: string | undefined): string => {
    if (!time) return "N/A";
    try {
      // Handle different time formats
      if (time.includes(":")) {
        // If time is already in HH:MM format, just return it
        return time;
      }
      // If time needs to be converted to 12-hour format
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
      console.error("Time formatting error:", error);
      return time; // Return original time if formatting fails
    }
  };

  const formattedDate = formatEventDate(event?.date);
  const formattedTime = formatEventTime(event?.time);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fafafa" }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 24,
          paddingBottom: 50, // Extra padding for bottom action bar
        }}
      >
        {/* Success Header */}
        <View className="items-center mb-8">
          <LinearGradient
            colors={["#10b981", "#059669"]}
            className="w-24 h-24 rounded-full items-center justify-center mb-6"
          >
            <Ionicons name="checkmark" size={48} color="white" />
          </LinearGradient>

          <Text className="text-3xl font-bold text-gray-900 text-center mb-2">
            Booking Confirmed!
          </Text>

          <Text className="text-gray-600 text-center leading-6">
            Your tickets have been booked successfully. You'll receive a
            confirmation email shortly.
          </Text>
        </View>

        {/* Booking Details */}
        <Card className="mb-6">
          <View className="items-center mb-4">
            <Text className="text-gray-500 text-sm">Booking ID</Text>
            <Text className="text-xl font-bold text-gray-900">
              #{bookingId}
            </Text>
          </View>

          <View className="border-t border-gray-100 pt-4">
            <Text className="font-bold text-lg text-gray-900 mb-3">
              {event?.title || "Event Title"}
            </Text>

            <View className="space-y-7">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={18} color="#6b7280" />
                <Text className="text-gray-600 ml-3 text-lg">
                  {formattedDate} at {formattedTime}
                </Text>
              </View>

              <View className="flex-row items-center">
                <Ionicons name="location-outline" size={18} color="#6b7280" />
                <Text className="text-gray-600 ml-3 text-lg">
                  {event?.venue?.name || "Venue"},{" "}
                  {event?.venue?.city || "City"}
                </Text>
              </View>

              <View className="flex-row items-center">
                <Ionicons name="card-outline" size={18} color="#6b7280" />
                <Text className="text-gray-600 ml-3 text-lg">
                  Amount Paid: ₹{amount?.toLocaleString() || "0"}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <Card className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4 ">
            Quick Actions
          </Text>

          <View className="space-y-3">
            <Button
              title="Download Ticket"
              onPress={handleDownloadTicket}
              variant="outline"
              style={{ marginBottom: 12 }}
              leftIcon={
                <Ionicons name="download-outline" size={20} color="#0ea5e9" />
              }
            />

            <Button
              title="Share with Friends"
              onPress={handleShare}
              variant="outline"
              leftIcon={
                <Ionicons name="share-outline" size={20} color="#0ea5e9" />
              }
            />
          </View>
        </Card>

        {/* Important Information */}
        <Card className="mb-6 ">
          <Text className="text-lg font-bold text-gray-900 mb-4 ml-2">
            Important Information
          </Text>

          <View className="">
            <View className="flex-row items-start mb-3 text-start">
              <Ionicons
                name="information-circle-outline"
                size={22}
                color="#3b82f6"
              />
              <Text className="text-gray-600 ml-3 flex-1 ">
                Please arrive 30 minutes before the event starts
              </Text>
            </View>

            <View className="flex-row items-start mb-3 text-start">
              <Ionicons
                name="document-text-outline"
                size={22}
                style={{ marginBottom: 0 }}
                color="#3b82f6"
              />
              <Text className="text-gray-600 ml-3 flex-1 ">
                Bring a valid ID for verification at the venue
              </Text>
            </View>

            <View className="flex-row items-start mb-3 text-start">
              <Ionicons
                name="phone-portrait-outline"
                size={22}
                color="#3b82f6"
              />
              <Text className="text-gray-600 ml-3 flex-1 ">
                Show your digital ticket at the entrance
              </Text>
            </View>
          </View>
        </Card>

        {/* QR Code Placeholder */}
        <Card className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4 text-center">
            Your Entry Ticket
          </Text>

          <View className="items-center">
            <View className="w-48 h-48 bg-gray-100 rounded-xl items-center justify-center mb-4">
              <Ionicons name="qr-code-outline" size={80} color="#6b7280" />
            </View>

            <Text className="text-gray-600 text-center text-sm">
              Show this QR code at the venue entrance
            </Text>
          </View>
        </Card>

        {/* Next Steps */}
        <View className="bg-blue-50 p-4 rounded-xl mb-6">
          <View className="flex-row items-center mb-3">
            <Ionicons name="bulb-outline" size={20} color="#3b82f6" />
            <Text className="text-blue-700 font-semibold ml-2">
              What's Next?
            </Text>
          </View>

          <View className="space-y-2">
            <Text className="text-blue-600 text-md">
              • Check your email for detailed booking confirmation
            </Text>
            <Text className="text-blue-600 text-md">
              • Add the event to your calendar
            </Text>
            <Text className="text-blue-600 text-md">
              • Follow the event organizer for updates
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar - Fixed positioning */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          paddingHorizontal: 20,
          paddingVertical: 16,
          paddingBottom: 32,
        }}
      >
        <View className="flex-row space-x-3">
          <Button
            title="View My Bookings"
            onPress={handleViewBookings}
            variant="outline"
            style={{ flex: 1 }}
          />

          <Button
            title="Explore More Events"
            onPress={handleGoHome}
            gradient
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default React.memo(SuccessScreen);
