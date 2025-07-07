import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../types";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Header from "../../components/common/Header";
import { useAuth } from "../../contexts/AuthContext";

type RegisterScreenNavigationProp =
  NativeStackNavigationProp<AuthStackParamList>;

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { register, authLoading, authError } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!agreeToTerms) {
      newErrors.terms = "Please agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await register(formData);
    } catch (error) {
      throw new Error(authError ? authError : "");
    }
  };

  const handleLogin = () => {
    navigation.navigate("Login");
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const updateFormData = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  return (
    <SafeAreaView className="flex-1  bg-white">
      <Header title="Create Account" showBack onLeftPress={handleBack} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="h-screen bg-white"
      >
        <ScrollView
          className="flex-1 px-6 "
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 8 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="py-8">
            <View className="space-y-6">
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                style={{ marginBottom: 10 }}
                onChangeText={(value) => updateFormData("name", value)}
                error={errors.name}
                leftIcon={
                  <Ionicons name="person-outline" size={20} color="#6b7280" />
                }
              />

              <Input
                label="Email Address"
                placeholder="Enter your email"
                style={{ marginVertical: 6 }}
                value={formData.email}
                onChangeText={(value) => updateFormData("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
                leftIcon={
                  <Ionicons name="mail-outline" size={20} color="#6b7280" />
                }
              />

              <Input
                label="Phone Number"
                placeholder="Enter your phone number"
                value={formData.phone}
                style={{ marginVertical: 6 }}
                onChangeText={(value) => updateFormData("phone", value)}
                keyboardType="phone-pad"
                error={errors.phone}
                leftIcon={
                  <Ionicons name="call-outline" size={20} color="#6b7280" />
                }
              />

              <Input
                label="Password"
                placeholder="Create a password"
                value={formData.password}
                style={{ marginVertical: 6 }}
                onChangeText={(value) => updateFormData("password", value)}
                secureTextEntry
                error={errors.password}
                leftIcon={
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#6b7280"
                  />
                }
              />

              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                style={{ marginVertical: 6 }}
                onChangeText={(value) =>
                  updateFormData("confirmPassword", value)
                }
                secureTextEntry
                error={errors.confirmPassword}
                leftIcon={
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#6b7280"
                  />
                }
              />

              <View className="flex-row items-start space-x-3 mt-3 pl-1">
                <TouchableOpacity
                  onPress={() => setAgreeToTerms(!agreeToTerms)}
                  className={`w-6 h-6 rounded border-2 items-center justify-center ${
                    agreeToTerms
                      ? "bg-primary-500 border-primary-500"
                      : "border-gray-300"
                  }`}
                >
                  {agreeToTerms && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </TouchableOpacity>
                <View className="flex-1 ml-2">
                  <Text className="text-gray-600 text-sm leading-5">
                    I agree to the{" "}
                    <Text className="text-primary-500 font-semibold">
                      Terms of Service
                    </Text>{" "}
                    and{" "}
                    <Text className="text-primary-500 font-semibold">
                      Privacy Policy
                    </Text>
                  </Text>
                  {errors.terms && (
                    <Text className="text-red-500 text-sm mt-1">
                      {errors.terms}
                    </Text>
                  )}
                </View>
              </View>

              <Button
                title="Create Account"
                onPress={handleRegister}
                loading={loading}
                size="lg"
                style={{ marginTop: 20 }}
              />
            </View>

            <View className="flex-row items-center my-8">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="mx-4 text-gray-500">or</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            <View className="space-y-4">
              <Button
                title="Continue with Google"
                onPress={() => {}}
                style={{ marginBottom: 16 }}
                variant="outline"
                size="lg"
                leftIcon={
                  <Ionicons name="logo-google" size={20} color="#4285f4" />
                }
              />

              <Button
                title="Continue with Phone"
                onPress={() => {}}
                variant="outline"
                style={{ marginBottom: 16 }}
                size="lg"
                leftIcon={
                  <Ionicons name="call-outline" size={20} color="#0ea5e9" />
                }
              />
            </View>

            <View className="flex-row justify-center items-center mt-8">
              <Text className="text-gray-600">Already have an account? </Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text className="text-primary-500 font-semibold">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
