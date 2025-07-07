import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../types";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Header from "../../components/common/Header";

type ForgotPasswordScreenNavigationProp =
  NativeStackNavigationProp<AuthStackParamList>;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSendReset = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 2000);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleBackToLogin = () => {
    navigation.navigate("Login");
  };

  if (sent) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Header title="Check Your Email" showBack onLeftPress={handleBack} />

        <View className="flex-1 px-6 py-8">
          <View className="items-center">
            <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-6">
              <Ionicons name="mail-outline" size={40} color="#0ea5e9" />
            </View>

            <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
              Reset Link Sent!
            </Text>

            <Text className="text-gray-600 text-center mb-8 leading-6">
              We've sent a password reset link to{"\n"}
              <Text className="font-semibold text-gray-900">{email}</Text>
            </Text>

            <Text className="text-gray-500 text-center mb-8 text-sm">
              Please check your email and click the reset link to create a new
              password.
            </Text>

            <View className="w-full space-y-4">
              <Button
                title="Back to Login"
                onPress={handleBackToLogin}
                gradient
                size="lg"
              />

              <Button
                title="Resend Email"
                onPress={handleSendReset}
                variant="outline"
                size="lg"
                loading={loading}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header
        title="Forgot Password"
        subtitle="Reset your password"
        showBack
        onLeftPress={handleBack}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-6 py-8">
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-6">
              <Ionicons name="lock-closed-outline" size={40} color="#0ea5e9" />
            </View>

            <Text className="text-gray-600 text-center leading-6">
              Enter your email address and we'll send you a link to reset your
              password.
            </Text>
          </View>

          <View className="space-y-6">
            <Input
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={error}
              leftIcon={
                <Ionicons name="mail-outline" size={20} color="#6b7280" />
              }
            />

            <Button
              title="Send Reset Link"
              onPress={handleSendReset}
              loading={loading}
              gradient
              size="lg"
              style={{ marginTop: 20 }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
