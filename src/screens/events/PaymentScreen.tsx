import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import Header from "../../components/common/Header";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useBookings } from "../../contexts/BookingsContext";
import { useAuth } from "../../contexts/AuthContext";
import { Booking, MainStackParamList } from "../../types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEvents } from "../../hooks/useEvents";

type PaymentScreenNavigationProp =
  NativeStackNavigationProp<MainStackParamList>;

const PaymentScreen: React.FC = () => {
  const navigation = useNavigation<PaymentScreenNavigationProp>();
  const route = useRoute<RouteProp<MainStackParamList, "Payment">>();
  const params = route.params as { booking?: Booking } | undefined;
  const booking: Booking | undefined = params?.booking;
  const { createBooking } = useBookings();
  const { user } = useAuth();
  const { getEventById } = useEvents();

  const event = booking?.eventId ? getEventById(booking.eventId) : undefined;

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");
  const [processing, setProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });
  const [upiId, setUpiId] = useState("");

  const paymentMethods = [
    { id: "card", name: "Credit/Debit Card", icon: "card-outline" },
    { id: "upi", name: "UPI Payment", icon: "phone-portrait-outline" },
    { id: "netbanking", name: "Net Banking", icon: "globe-outline" },
    { id: "wallet", name: "Digital Wallet", icon: "wallet-outline" },
  ];

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handlePayment = useCallback(async () => {
    if (selectedPaymentMethod === "card") {
      if (
        !cardDetails.number ||
        !cardDetails.expiry ||
        !cardDetails.cvv ||
        !cardDetails.name
      ) {
        Alert.alert("Missing Information", "Please fill in all card details");
        return;
      }
    }

    setProcessing(true);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Ensure booking and booking.event are defined
      if (!booking || !event || !booking.eventId) {
        Alert.alert("Booking Error", "Booking information is missing.");
        setProcessing(false);
        return;
      }

      // Create booking
      const userDetails = {
        name: (user as any)?.displayName || user?.name || 'User',
        email: user?.email || '',
        phone: (user as any)?.phoneNumber || user?.phone || '',
      };
      await createBooking(booking.eventId, booking.quantity ?? 1, userDetails);

      // Navigate to success screen
      navigation.navigate("Success", {
        bookingId: Date.now().toString(),
        eventId: event.id,
        amount: booking.totalAmount,
      });
    } catch (error) {
      Alert.alert(
        "Payment Failed",
        "There was an error processing your payment. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  }, [
    selectedPaymentMethod,
    cardDetails,
    navigation,
    booking,
    createBooking,
    event,
  ]);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, "");
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(" ") : cleaned;
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length <= 2) return cleaned;
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
  };

  if (!booking || !event) {
    console.log("Booking information not found: ", booking);
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
        <Header title="Payment" showBack onLeftPress={handleBack} />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: "#ef4444", fontSize: 18 }}>
            Booking information not found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (processing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <LoadingSpinner size="large" text="Processing Payment..." />
          <Text className="text-gray-600 mt-4 text-center px-8">
            Please don't close the app or go back
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fafafa" }}>
      <Header title="Payment" showBack onLeftPress={handleBack} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Summary */}
        <Card className="mb-6 mt-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Order Summary
          </Text>
          <View className="flex-row">
            <View className="w-16 h-16 bg-gray-200 rounded-lg mr-4" />
            <View className="flex-1">
              <Text className="font-semibold text-gray-900" numberOfLines={2}>
                {event.title}
              </Text>
              <Text className="text-gray-600 text-sm mt-1">
                {booking.quantity} x tickets
              </Text>
              <Text className="text-xl font-bold text-primary-500 mt-2">
                ₹{booking.totalAmount.toLocaleString()}
              </Text>
            </View>
          </View>
        </Card>

        {/* Payment Methods */}
        <Card className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Payment Method
          </Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              onPress={() => setSelectedPaymentMethod(method.id)}
              className={`flex-row items-center p-4 rounded-xl border mb-3 ${
                selectedPaymentMethod === method.id
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200"
              }`}
            >
              <Ionicons
                name={method.icon as any}
                size={24}
                color={
                  selectedPaymentMethod === method.id ? "#0ea5e9" : "#6b7280"
                }
              />
              <Text
                className={`ml-3 flex-1 font-medium ${
                  selectedPaymentMethod === method.id
                    ? "text-primary-700"
                    : "text-gray-900"
                }`}
              >
                {method.name}
              </Text>
              {selectedPaymentMethod === method.id && (
                <Ionicons name="checkmark-circle" size={20} color="#0ea5e9" />
              )}
            </TouchableOpacity>
          ))}
        </Card>

        {/* Card Details Form */}
        {selectedPaymentMethod === "card" && (
          <Card className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Card Details
            </Text>
            <View className="space-y-4">
              <Input
                label="Card Number"
                placeholder="1234 5678 9012 3456"
                value={cardDetails.number}
                onChangeText={(text) =>
                  setCardDetails((prev) => ({
                    ...prev,
                    number: formatCardNumber(text).slice(0, 19),
                  }))
                }
                keyboardType="numeric"
                leftIcon={
                  <Ionicons name="card-outline" size={20} color="#6b7280" />
                }
              />

              <View className="flex-row space-x-4">
                <Input
                  label="Expiry Date"
                  placeholder="MM/YY"
                  value={cardDetails.expiry}
                  onChangeText={(text) =>
                    setCardDetails((prev) => ({
                      ...prev,
                      expiry: formatExpiry(text).slice(0, 5),
                    }))
                  }
                  keyboardType="numeric"
                  style={{ flex: 1 }}
                />

                <Input
                  label="CVV"
                  placeholder="123"
                  value={cardDetails.cvv}
                  onChangeText={(text) =>
                    setCardDetails((prev) => ({
                      ...prev,
                      cvv: text.replace(/\D/g, "").slice(0, 4),
                    }))
                  }
                  keyboardType="numeric"
                  secureTextEntry
                  style={{ flex: 1 }}
                />
              </View>

              <Input
                label="Cardholder Name"
                placeholder="John Doe"
                value={cardDetails.name}
                onChangeText={(text) =>
                  setCardDetails((prev) => ({ ...prev, name: text }))
                }
                autoCapitalize="words"
                leftIcon={
                  <Ionicons name="person-outline" size={20} color="#6b7280" />
                }
              />
            </View>
          </Card>
        )}

        {/* UPI Payment */}
        {selectedPaymentMethod === "upi" && (
          <Card className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              UPI Payment
            </Text>
            <View className="space-y-4">
              <Input
                label="UPI ID"
                placeholder="your-upi-id@bank"
                keyboardType="email-address"
                autoCapitalize="none"
                value={upiId}
                onChangeText={setUpiId}
                leftIcon={
                  <Ionicons
                    name="phone-portrait-outline"
                    size={20}
                    color="#6b7280"
                  />
                }
              />
            </View>
          </Card>
        )}

        {/* Security Notice */}
        <View className="bg-green-50 p-4 rounded-xl mb-6">
          <View className="flex-row items-center">
            <Ionicons name="shield-checkmark" size={20} color="#10b981" />
            <Text className="text-green-700 font-medium ml-2">
              Secure Payment
            </Text>
          </View>
          <Text className="text-green-600 text-sm mt-1">
            Your payment information is encrypted and secure
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Action Bar - Fixed positioning */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#f8f9fa",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          paddingHorizontal: 20,
          paddingVertical: 16,
          paddingBottom: 32, // Extra padding for safe area
        }}
      >
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-gray-500">Amount to Pay</Text>
          <Text className="text-xl font-bold text-gray-900">
            ₹{booking.totalAmount.toLocaleString()}
          </Text>
        </View>

        <Button
          title={`Pay ₹${booking.totalAmount.toLocaleString()}`}
          onPress={handlePayment}
          gradient
          size="lg"
          style={{ width: "70%", alignSelf: "center" }}
          loading={processing}
        />
      </View>
    </SafeAreaView>
  );
};

export default React.memo(PaymentScreen);
