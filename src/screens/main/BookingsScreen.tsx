import React, { useEffect, useCallback, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import Header from "../../components/common/Header";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { format, parseISO } from "date-fns";
import { useBookings } from "../../contexts/BookingsContext";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainTabParamList, MainStackParamList } from "../../types";

type BookingsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "Bookings">,
  NativeStackNavigationProp<MainStackParamList>
>;

const BookingsScreen: React.FC = () => {
  const navigation = useNavigation<BookingsScreenNavigationProp>();
  const {
    fetchBookings,
    upcomingBookings,
    pastBookings,
    bookingsLoading,
    bookingsError,
    cancelBooking,
  } = useBookings();
  const [selectedTab, setSelectedTab] = useState<"upcoming" | "past">(
    "upcoming"
  );

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Using upcomingBookings and pastBookings from context (already filtered by API)

  const handleBookingPress = useCallback(
    (booking: any) => {
      navigation.navigate("EventDetails", { eventId: booking.eventId });
    },
    [navigation]
  );

  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(
    null
  );

  const handleCancelBooking = useCallback(
    (bookingId: string, eventTitle: string) => {
      Alert.alert(
        "Cancel Booking",
        `Are you sure you want to cancel your booking for "${eventTitle}"?\n\nThis action cannot be undone.`,
        [
          { text: "Keep Booking", style: "cancel" },
          {
            text: "Cancel Booking",
            style: "destructive",
            onPress: async () => {
              try {
                setCancellingBookingId(bookingId);
                const success = await cancelBooking(bookingId);
                if (success) {
                  Alert.alert(
                    "Booking Cancelled",
                    "Your booking has been successfully cancelled. Any refund will be processed according to our cancellation policy.",
                    [{ text: "OK" }]
                  );
                }
              } catch (error: any) {
                Alert.alert(
                  "Cancellation Failed",
                  error.message ||
                    "Failed to cancel booking. Please try again.",
                  [{ text: "OK" }]
                );
              } finally {
                setCancellingBookingId(null);
              }
            },
          },
        ]
      );
    },
    [cancelBooking]
  );

  // Safe date formatting function
  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === "string" ? parseISO(date) : date;
      if (isNaN(dateObj.getTime())) return "Date unavailable";
      return format(dateObj, "MMM dd, yyyy");
    } catch (error) {
      return "Date unavailable";
    }
  };

  const BookingCard = ({ booking }: { booking: any }) => (
    <View
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <TouchableOpacity onPress={() => handleBookingPress(booking)}>
        {/* Main Content Row */}
        <View style={{ flexDirection: "row", marginBottom: 16 }}>
          {/* Event Image Placeholder */}
          <View
            style={{
              width: 80,
              height: 80,
              backgroundColor: "#e5e7eb",
              borderRadius: 8,
              marginRight: 16,
              flexShrink: 0,
            }}
          />

          {/* Event Details */}
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#111827",
                marginBottom: 8,
                lineHeight: 22,
              }}
              numberOfLines={2}
            >
              {booking.eventTitle}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <Ionicons name="calendar-outline" size={16} color="#6b7280" />
              <Text style={{ color: "#6b7280", fontSize: 14, marginLeft: 6 }}>
                {formatDate(booking.eventDate)}
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="location-outline" size={16} color="#6b7280" />
              <Text
                style={{
                  color: "#6b7280",
                  fontSize: 14,
                  marginLeft: 6,
                  flex: 1,
                }}
                numberOfLines={1}
              >
                {booking.eventVenue}
              </Text>
            </View>
          </View>
        </View>

        {/* Booking Info Row */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: "#9ca3af", marginBottom: 2 }}>
              Booking ID
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: "#374151",
                marginRight: 100,
              }}
            >
              #{booking.id}
            </Text>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 12, color: "#9ca3af", marginBottom: 2 }}>
              Total Amount
            </Text>
            <Text
              style={{ fontSize: 18, fontWeight: "bold", color: "#111827" }}
            >
              ₹{booking.totalAmount.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Status and Actions Row */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: "#f3f4f6",
          }}
        >
          {/* Status Badge */}
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              backgroundColor:
                booking.status === "confirmed"
                  ? "#dcfce7"
                  : booking.status === "pending"
                  ? "#fef3c7"
                  : "#fecaca",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color:
                  booking.status === "confirmed"
                    ? "#15803d"
                    : booking.status === "pending"
                    ? "#a16207"
                    : "#dc2626",
              }}
            >
              {booking.status.toUpperCase()}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Button
              title="View Details"
              onPress={() =>
                navigation.navigate("BookingDetails", { bookingId: booking.id })
              }
              variant="outline"
              size="sm"
              style={{ marginRight: 8 }}
            />
            {selectedTab === "upcoming" && booking.status !== "cancelled" && (
              <Button
                title={
                  cancellingBookingId === booking.id
                    ? "Cancelling..."
                    : "Cancel"
                }
                onPress={() =>
                  handleCancelBooking(booking.id, booking.eventTitle)
                }
                variant="ghost"
                size="sm"
                disabled={cancellingBookingId === booking.id}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  const EmptyState = ({ type }: { type: "upcoming" | "past" }) => (
    <View className="flex-1 justify-center items-center py-20">
      <Ionicons
        name={type === "upcoming" ? "calendar-outline" : "time-outline"}
        size={64}
        color="#d1d5db"
      />
      <Text className="text-lg font-medium text-gray-600 mt-4 mb-2">
        No {type} bookings
      </Text>
      <Text className="text-gray-400 text-center px-8">
        {type === "upcoming"
          ? "Book your first event to see it here"
          : "Your past bookings will appear here"}
      </Text>
      {type === "upcoming" && (
        <Button
          title="Explore Events"
          onPress={() => navigation.navigate("Home")}
          gradient
          size="lg"
          style={{ marginTop: 20 }}
        />
      )}
    </View>
  );

  // Loading state
  if (bookingsLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fafafa" }}>
        <Header title="My Bookings" />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <LoadingSpinner text="Loading bookings..." />
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (bookingsError) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fafafa" }}>
        <Header title="My Bookings" />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
          }}
        >
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text className="text-xl font-bold text-gray-900 mt-4 text-center">
            Failed to load bookings
          </Text>
          <Text className="text-gray-600 text-center mt-2">
            {bookingsError}
          </Text>
          <Button
            title="Retry"
            onPress={fetchBookings}
            gradient
            style={{ marginTop: 20 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Main content
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#fafafa", marginBottom: -30 }}
    >
      {/* <Header title="My Bookings" /> */}

      {/* Tab Selector */}
      <View className="px-5 py-4">
        <View className="flex-row bg-gray-100 rounded-xl p-1">
          <TouchableOpacity
            key="upcoming-tab"
            onPress={() => setSelectedTab("upcoming")}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 8,
              backgroundColor:
                selectedTab === "upcoming" ? "white" : "transparent",
              shadowColor: selectedTab === "upcoming" ? "#000" : "transparent",
              shadowOffset:
                selectedTab === "upcoming"
                  ? { width: 0, height: 1 }
                  : { width: 0, height: 0 },
              shadowOpacity: selectedTab === "upcoming" ? 0.1 : 0,
              shadowRadius: selectedTab === "upcoming" ? 2 : 0,
              elevation: selectedTab === "upcoming" ? 2 : 0,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "600",
                color: selectedTab === "upcoming" ? "#0ea5e9" : "#6b7280",
              }}
            >
              Upcoming ({upcomingBookings.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            key="past-tab"
            onPress={() => setSelectedTab("past")}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 8,
              backgroundColor: selectedTab === "past" ? "white" : "transparent",
              shadowColor: selectedTab === "past" ? "#000" : "transparent",
              shadowOffset:
                selectedTab === "past"
                  ? { width: 0, height: 1 }
                  : { width: 0, height: 0 },
              shadowOpacity: selectedTab === "past" ? 0.1 : 0,
              shadowRadius: selectedTab === "past" ? 2 : 0,
              elevation: selectedTab === "past" ? 2 : 0,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "600",
                color: selectedTab === "past" ? "#0ea5e9" : "#6b7280",
              }}
            >
              Past ({pastBookings.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1, backgroundColor: "#fafafa" }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 8,
          marginTop: 4,

          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        {selectedTab === "upcoming" ? (
          upcomingBookings.length > 0 ? (
            upcomingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          ) : (
            <EmptyState type="upcoming" />
          )
        ) : pastBookings.length > 0 ? (
          pastBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))
        ) : (
          <EmptyState type="past" />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default React.memo(BookingsScreen);
