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

  const handleCancelBooking = useCallback((bookingId: string) => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => {
            console.log("Cancelling booking:", bookingId);
          },
        },
      ]
    );
  }, []);

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
    <Card className="mb-4">
      <TouchableOpacity onPress={() => handleBookingPress(booking)}>
        <View className="flex-row">
          <View className="w-20 h-20 bg-gray-200 rounded-lg mr-4" />
          <View className="flex-1">
            <Text className="font-bold text-lg text-gray-900" numberOfLines={2}>
              {booking.eventTitle}
            </Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name="calendar-outline" size={14} color="#6b7280" />
              <Text className="text-gray-500 text-sm ml-1">
                {formatDate(booking.eventDate)}
              </Text>
            </View>
            <View className="flex-row items-center mt-1">
              <Ionicons name="location-outline" size={14} color="#6b7280" />
              <Text className="text-gray-500 text-sm ml-1">
                {booking.eventVenue}
              </Text>
            </View>
            <View className="flex-row items-center justify-between mt-3">
              <View>
                <Text className="text-xs text-gray-400">Booking ID</Text>
                <Text className="text-sm font-medium">#{booking.id}</Text>
              </View>
              <View className="items-end">
                <Text className="text-xs text-gray-400">Total</Text>
                <Text className="text-lg font-bold text-gray-900">
                  ₹{booking.totalAmount.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <View
            className={`px-3 py-1 rounded-full ${
              booking.status === "confirmed" ? "bg-green-100" : "bg-red-100"
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                booking.status === "confirmed"
                  ? "text-green-700"
                  : "text-red-700"
              }`}
            >
              {booking.status.toUpperCase()}
            </Text>
          </View>

          <View className="flex-row space-x-2">
            <Button
              title="View Ticket"
              onPress={() => {}}
              variant="outline"
              size="sm"
            />
            {selectedTab === "upcoming" && (
              <Button
                title="Cancel"
                onPress={() => handleCancelBooking(booking.id)}
                variant="ghost"
                size="sm"
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Card>
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
