import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { format, parseISO } from "date-fns";
import Header from "../../components/common/Header";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useBookings } from "../../contexts/BookingsContext";
import { MainStackParamList } from "../../types";
import { Booking } from "../../types";

type BookingDetailsScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  "BookingDetails"
>;

type BookingDetailsScreenRouteProp = RouteProp<
  MainStackParamList,
  "BookingDetails"
>;

const BookingDetailsScreen: React.FC = () => {
  const navigation = useNavigation<BookingDetailsScreenNavigationProp>();
  const route = useRoute<BookingDetailsScreenRouteProp>();
  const { bookingId } = route.params;

  const { getBookingByIdFromApi, cancelBooking } = useBookings();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchBookingDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getBookingByIdFromApi(bookingId);
      
      if (result) {
        setBooking(result.booking);
        setEvent(result.event);
      } else {
        setError("Booking not found");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load booking details");
    } finally {
      setLoading(false);
    }
  }, [bookingId, getBookingByIdFromApi]);

  useEffect(() => {
    fetchBookingDetails();
  }, [fetchBookingDetails]);

  const handleCancelBooking = useCallback(() => {
    if (!booking) return;

    Alert.alert(
      "Cancel Booking",
      `Are you sure you want to cancel your booking for "${booking.eventTitle}"?\n\nThis action cannot be undone.`,
      [
        { text: "Keep Booking", style: "cancel" },
        {
          text: "Cancel Booking",
          style: "destructive",
          onPress: async () => {
            try {
              setCancelling(true);
              const success = await cancelBooking(booking.id);
              if (success) {
                Alert.alert(
                  "Booking Cancelled",
                  "Your booking has been successfully cancelled. Any refund will be processed according to our cancellation policy.",
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        // Refresh booking details to show updated status
                        fetchBookingDetails();
                      },
                    },
                  ]
                );
              }
            } catch (error: any) {
              Alert.alert(
                "Cancellation Failed",
                error.message || "Failed to cancel booking. Please try again.",
                [{ text: "OK" }]
              );
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  }, [booking, cancelBooking, fetchBookingDetails]);

  const handleShareBooking = useCallback(async () => {
    if (!booking) return;

    try {
      const shareContent = {
        message: `🎟️ My Event Booking\n\n📅 Event: ${booking.eventTitle}\n📍 Venue: ${booking.eventVenue}\n📋 Booking ID: #${booking.id}\n\nBooked via EventSphere India`,
        title: "Event Booking Details",
      };

      await Share.share(shareContent);
    } catch (error) {
      console.error("Error sharing booking:", error);
    }
  }, [booking]);

  const handleViewEvent = useCallback(() => {
    if (booking?.eventId) {
      navigation.navigate("EventDetails", { eventId: booking.eventId });
    }
  }, [booking?.eventId, navigation]);

  // Safe date formatting function
  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === "string" ? parseISO(date) : date;
      if (isNaN(dateObj.getTime())) return "Date unavailable";
      return format(dateObj, "MMM dd, yyyy 'at' h:mm a");
    } catch (error) {
      return "Date unavailable";
    }
  };

  const formatDateOnly = (date: Date | string) => {
    try {
      const dateObj = typeof date === "string" ? parseISO(date) : date;
      if (isNaN(dateObj.getTime())) return "Date unavailable";
      return format(dateObj, "MMM dd, yyyy");
    } catch (error) {
      return "Date unavailable";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return { bg: "bg-green-100", text: "text-green-700" };
      case "pending":
        return { bg: "bg-yellow-100", text: "text-yellow-700" };
      case "cancelled":
        return { bg: "bg-red-100", text: "text-red-700" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700" };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fafafa" }}>
        <Header title="Booking Details" showBackButton />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <LoadingSpinner text="Loading booking details..." />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !booking) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fafafa" }}>
        <Header title="Booking Details" showBackButton />
        <View style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
        }}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text className="text-xl font-bold text-gray-900 mt-4 text-center">
            {error || "Booking not found"}
          </Text>
          <Text className="text-gray-600 text-center mt-2">
            Unable to load booking details. Please try again.
          </Text>
          <Button
            title="Retry"
            onPress={fetchBookingDetails}
            gradient
            style={{ marginTop: 20 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const statusColors = getStatusColor(booking.status);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fafafa" }}>
      <Header title="Booking Details" showBackButton />
      
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Booking Card */}
        <Card className="mb-6">
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900 mb-2">
                {booking.eventTitle}
              </Text>
              <View className={`self-start px-3 py-1 rounded-full ${statusColors.bg}`}>
                <Text className={`text-xs font-medium ${statusColors.text}`}>
                  {booking.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleShareBooking} className="p-2">
              <Ionicons name="share-outline" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Event Image Placeholder */}
          <View className="w-full h-40 bg-gray-200 rounded-lg mb-4" />

          {/* Event Details */}
          <View className="space-y-3">
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={20} color="#6b7280" />
              <Text className="text-gray-600 ml-3 flex-1">
                {formatDate(booking.eventDate)}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={20} color="#6b7280" />
              <Text className="text-gray-600 ml-3 flex-1">
                {booking.eventVenue}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="ticket-outline" size={20} color="#6b7280" />
              <Text className="text-gray-600 ml-3 flex-1">
                {booking.quantity} {booking.quantity === 1 ? "Ticket" : "Tickets"}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="card-outline" size={20} color="#6b7280" />
              <Text className="text-gray-600 ml-3 flex-1">
                ₹{booking.totalAmount.toLocaleString()}
              </Text>
            </View>
          </View>
        </Card>

        {/* Booking Information */}
        <Card className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Booking Information
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Booking ID</Text>
              <Text className="font-medium">#{booking.id}</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-600">Booking Date</Text>
              <Text className="font-medium">
                {formatDateOnly(booking.bookingDate || booking.createdAt || new Date())}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-600">Status</Text>
              <Text className={`font-medium ${statusColors.text}`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Text>
            </View>

            <View className="border-t border-gray-100 pt-3">
              <Text className="text-gray-600 mb-2">Attendee Details</Text>
              <Text className="font-medium">{booking.userDetails.name}</Text>
              <Text className="text-gray-600">{booking.userDetails.email}</Text>
              <Text className="text-gray-600">{booking.userDetails.phone}</Text>
            </View>
          </View>
        </Card>

        {/* QR Code Section (if available) */}
        {booking.qrCode && booking.status === "confirmed" && (
          <Card className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-4 text-center">
              Entry QR Code
            </Text>
            <View className="items-center">
              <View className="w-48 h-48 bg-gray-200 rounded-lg mb-4 items-center justify-center">
                <Ionicons name="qr-code-outline" size={64} color="#6b7280" />
                <Text className="text-gray-500 mt-2">QR Code</Text>
              </View>
              <Text className="text-gray-600 text-center text-sm">
                Show this QR code at the event entrance
              </Text>
            </View>
          </Card>
        )}

        {/* Action Buttons */}
        <View className="space-y-3 mb-8">
          <Button
            title="View Event Details"
            onPress={handleViewEvent}
            variant="outline"
            leftIcon={<Ionicons name="information-circle-outline" size={20} color="#0ea5e9" />}
          />

          {booking.status !== "cancelled" && (
            <Button
              title={cancelling ? "Cancelling..." : "Cancel Booking"}
              onPress={handleCancelBooking}
              variant="ghost"
              disabled={cancelling}
              leftIcon={<Ionicons name="close-circle-outline" size={20} color="#0ea5e9" />}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BookingDetailsScreen;