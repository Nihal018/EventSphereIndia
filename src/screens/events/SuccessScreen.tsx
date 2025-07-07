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
// Ensure all necessary types are imported from your types file
import {
  MainStackParamList,
  MainTabParamList,
  Event,
  Booking,
} from "../../types"; // No need for BookingsStackParamList if it's not a nested stack
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

// Define the Navigation Prop type for SuccessScreen
// It can navigate within its parent stack (MainStackParamList)
// and also to other tabs within the MainTabParamList (via the 'MainTabs' screen)
type SuccessScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<MainStackParamList, "Success">, // Current screen's direct navigator
  BottomTabNavigationProp<MainTabParamList> // To navigate to other tabs
>;

// Define the Route Prop type for SuccessScreen to access its parameters
type SuccessScreenRouteProp = RouteProp<MainStackParamList, "Success">;

const SuccessScreen: React.FC = () => {
  const navigation = useNavigation<SuccessScreenNavigationProp>();
  const route = useRoute<SuccessScreenRouteProp>(); // Use the specific route prop type
  // Ensure route.params matches the type defined in MainStackParamList for 'Success'
  const { bookingId, event, amount } = route.params as {
    bookingId: string;
    event: any;
    amount: number;
  };

  useEffect(() => {
    // Trigger haptic feedback on component mount for success
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []); // Empty dependency array ensures this runs only once

  // Callback to handle navigation to the Bookings tab
  const handleViewBookings = useCallback(() => {
    // Navigate to the 'MainTabs' screen (which is your BottomTabNavigator within MainNavigator)
    // Then, specify the 'Bookings' screen within that tab navigator.
    navigation.navigate("MainTabs", { screen: "Bookings" });
  }, [navigation]);

  // Callback to handle navigation back to the Home tab
  const handleGoHome = useCallback(() => {
    // Navigate to the 'MainTabs' screen and then specifically to the 'Home' tab
    navigation.navigate("MainTabs");
  }, [navigation]);

  // Placeholder for download ticket logic
  const handleDownloadTicket = useCallback(() => {
    console.log("Download ticket for booking ID:", bookingId);
    // Implement actual ticket download logic here (e.g., open URL, share file)
  }, [bookingId]);

  // Placeholder for share booking logic
  const handleShare = useCallback(() => {
    console.log("Share booking ID:", bookingId);
    // Implement actual sharing functionality here (e.g., using Share API)
  }, [bookingId]);

  // Format event date and time for display
  // Ensure event.date is a valid date string/object before formatting
  const formattedDate = event?.date
    ? format(new Date(event.date), "EEEE, MMMM dd,yyyy")
    : "N/A";
  // Assuming event.time is a string like "HH:MM"
  const formattedTime = event?.time
    ? format(new Date(`2000-01-01T${event.time}`), "hh:mm a")
    : "N/A";

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingVertical: 24,
        }} // Added padding for better layout
      >
        {/* Success Header */}
        <View className="items-center mb-8">
          <LinearGradient
            colors={["#10b981", "#059669"]} // Green gradient for success
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
              {event?.title || "N/A"}
            </Text>
          </View>
          <View className="space-y-3">
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={18} color="#6b7280" />
              <Text className="text-gray-600 ml-3">
                {formattedDate} at {formattedTime}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={18} color="#6b7280" />
              <Text className="text-gray-600 ml-3">
                {event?.venue?.name || "N/A"}, {event?.venue?.city || "N/A"}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="card-outline" size={18} color="#6b7280" />
              <Text className="text-gray-600 ml-3">
                Amount Paid: ₹{amount?.toLocaleString() || "0.00"}
              </Text>
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <Card className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Quick Actions
          </Text>

          <View className="space-y-3">
            <Button
              title="Download Ticket"
              onPress={handleDownloadTicket}
              variant="outline"
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
        <Card className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Important Information
          </Text>

          <View className="space-y-4">
            <View className="flex-row items-start">
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#3b82f6"
              />
              <Text className="text-gray-600 ml-3 flex-1">
                Please arrive 30 minutes before the event starts
              </Text>
            </View>

            <View className="flex-row items-start">
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#3b82f6"
              />
              <Text className="text-gray-600 ml-3 flex-1">
                Bring a valid ID for verification at the venue
              </Text>
            </View>

            <View className="flex-row items-start">
              <Ionicons
                name="phone-portrait-outline"
                size={20}
                color="#3b82f6"
              />
              <Text className="text-gray-600 ml-3 flex-1">
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
            <Text className="text-blue-600 text-sm">
              • Check your email for detailed booking confirmation
            </Text>
            <Text className="text-blue-600 text-sm">
              • Add the event to your calendar
            </Text>
            <Text className="text-blue-600 text-sm">
              • Follow the event organizer for updates
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="bg-white border-t border-gray-100 px-5 py-4">
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
