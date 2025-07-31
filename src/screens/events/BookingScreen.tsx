import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import Header from "../../components/common/Header";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { Event, MainStackParamList } from "../../types";
import { format } from "date-fns";
import { useAuth } from "../../contexts/AuthContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack/lib/typescript/src/types";
import { useEvents } from "../../hooks/useEvents";

type BookingScreenNavigationProp =
  NativeStackNavigationProp<MainStackParamList>;

const BookingScreen: React.FC = () => {
  const navigation = useNavigation<BookingScreenNavigationProp>();
  const route = useRoute();
  const { eventId } = route.params as { eventId: string };
  const { getEventById, eventsError, eventsLoading } = useEvents();
  const { user } = useAuth();

  const event = getEventById(eventId);

  const [quantity, setQuantity] = useState(1);
  const [selectedTicketType, setSelectedTicketType] = useState("general");
  const [userInfo, setUserInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  if (!event) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fafafa" }}>
        <Header
          title="Book Tickets"
          showBack
          onLeftPress={() => navigation.goBack()}
        />
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ fontSize: 18, color: "#6b7280" }}>
            Event not found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const ticketTypes = [
    {
      id: "general",
      name: "General Admission",
      price: event.price.min,
      description: "Standard entry ticket",
    },
    {
      id: "vip",
      name: "VIP",
      price: event.price.max,
      description: "Premium experience with exclusive access",
    },
  ];

  const selectedTicket = ticketTypes.find((t) => t.id === selectedTicketType);
  const totalAmount = (selectedTicket?.price || event.price.min) * quantity;
  const platformFee = Math.round(totalAmount * 0.02);
  const finalAmount = totalAmount + platformFee;

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleQuantityChange = useCallback(
    (change: number) => {
      const newQuantity = quantity + change;
      if (newQuantity >= 1 && newQuantity <= 10) {
        setQuantity(newQuantity);
      }
    },
    [quantity]
  );

  const handleProceedToPayment = useCallback(() => {
    if (!userInfo.name || !userInfo.email) {
      Alert.alert("Missing Information", "Please fill in all required fields");
      return;
    }

    const bookingData = {
      eventId,
      quantity,
      ticketType: selectedTicketType,
      userInfo,
      totalAmount: finalAmount,
    };

    navigation.navigate("Payment", { booking: bookingData });
  }, [navigation, event, quantity, selectedTicketType, userInfo, finalAmount]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fafafa" }}>
      <Header title="Book Tickets" showBack onLeftPress={handleBack} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Event Info */}
        <Card className="mb-6 mt-6">
          <View className="flex-row">
            <View className="w-20 h-20 bg-gray-200 rounded-lg mr-4" />
            <View className="flex-1">
              <Text
                className="font-bold text-lg text-gray-900"
                numberOfLines={2}
              >
                {event.title}
              </Text>
              <View className="flex-row items-center mt-1">
                <Ionicons name="calendar-outline" size={14} color="#6b7280" />
                <Text className="text-gray-500 text-sm ml-1">
                  {format(event.date, "MMM dd, yyyy")} • {event.time}
                </Text>
              </View>
              <View className="flex-row items-center mt-1">
                <Ionicons name="location-outline" size={14} color="#6b7280" />
                <Text className="text-gray-500 text-sm ml-1">
                  {event.venue.name}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Ticket Type Selection */}
        <Card className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Select Ticket Type
          </Text>
          {ticketTypes.map((ticket) => (
            <TouchableOpacity
              key={ticket.id}
              onPress={() => setSelectedTicketType(ticket.id)}
              className={`p-4 rounded-xl border-2 mb-3 ${
                selectedTicketType === ticket.id
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200"
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900">
                    {ticket.name}
                  </Text>
                  <Text className="text-gray-600 text-sm mt-1">
                    {ticket.description}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="font-bold text-lg text-gray-900">
                    ₹{ticket.price.toLocaleString()}
                  </Text>
                  {selectedTicketType === ticket.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#0ea5e9"
                    />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Quantity Selection */}
        <Card className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Number of Tickets
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600">Quantity</Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => handleQuantityChange(-1)}
                className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                disabled={quantity <= 1}
              >
                <Ionicons
                  name="remove"
                  size={20}
                  color={quantity <= 1 ? "#d1d5db" : "#374151"}
                />
              </TouchableOpacity>

              <Text className="mx-6 text-xl font-bold text-gray-900">
                {quantity}
              </Text>

              <TouchableOpacity
                onPress={() => handleQuantityChange(1)}
                className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                disabled={quantity >= 10}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={quantity >= 10 ? "#d1d5db" : "#374151"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* User Information */}
        <Card className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Contact Information
          </Text>
          <View className="space-y-4">
            <Input
              label="Full Name *"
              placeholder="Enter your full name"
              value={userInfo.name}
              onChangeText={(text) =>
                setUserInfo((prev) => ({ ...prev, name: text }))
              }
              leftIcon={
                <Ionicons name="person-outline" size={20} color="#6b7280" />
              }
            />

            <Input
              label="Email Address *"
              placeholder="Enter your email"
              value={userInfo.email}
              onChangeText={(text) =>
                setUserInfo((prev) => ({ ...prev, email: text }))
              }
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={
                <Ionicons name="mail-outline" size={20} color="#6b7280" />
              }
            />

            <Input
              label="Phone Number"
              placeholder="Enter your phone number"
              value={userInfo.phone}
              onChangeText={(text) =>
                setUserInfo((prev) => ({ ...prev, phone: text }))
              }
              keyboardType="phone-pad"
              leftIcon={
                <Ionicons name="call-outline" size={20} color="#6b7280" />
              }
            />
          </View>
        </Card>

        {/* Order Summary */}
        <Card className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Order Summary
          </Text>
          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">
                {selectedTicket?.name} × {quantity}
              </Text>
              <Text className="font-semibold text-gray-900">
                ₹{totalAmount.toLocaleString()}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-600">Platform Fee</Text>
              <Text className="font-semibold text-gray-900">
                ₹{platformFee.toLocaleString()}
              </Text>
            </View>

            <View className="border-t border-gray-200 pt-3">
              <View className="flex-row justify-between">
                <Text className="text-lg font-bold text-gray-900">Total</Text>
                <Text className="text-lg font-bold text-primary-500">
                  ₹{finalAmount.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Bottom Action Bar - Positioned absolutely */}
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
          paddingBottom: 32, // Extra padding for safe area
        }}
      >
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-gray-500">Total Amount</Text>
          <Text className="text-xl font-bold text-gray-900">
            ₹{finalAmount.toLocaleString()}
          </Text>
        </View>

        <Button
          title="Proceed to Payment"
          onPress={handleProceedToPayment}
          gradient
          style={{ width: "70%", alignSelf: "center" }}
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
};

export default React.memo(BookingScreen);
