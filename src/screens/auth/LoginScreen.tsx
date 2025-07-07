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

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login, authLoading, authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login(email, password);
    } catch (error) {
      throw new Error(authError ? authError : "");
    }
    //
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  const handleSignUp = () => {
    navigation.navigate("Register");
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header
        title="Welcome Back"
        subtitle="Sign in to your account"
        showBack
        onLeftPress={handleBack}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="h-screen bg-white"
      >
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 8 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="py-6">
            {/* Login Form */}
            <View className="space-y-6">
              <Input
                label="Email Address"
                placeholder="Enter your email"
                value={email}
                style={{ marginBottom: 10 }}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
                leftIcon={
                  <Ionicons name="mail-outline" size={20} color="#6b7280" />
                }
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                style={{ marginVertical: 6 }}
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

              <TouchableOpacity
                onPress={handleForgotPassword}
                className="self-end mt-2"
              >
                <Text className="text-primary-500 font-semibold">
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={authLoading}
                size="sm"
                style={{ marginTop: 20 }}
              />
            </View>

            {/* Divider */}
            <View className="flex-row items-center my-8">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="mx-4 text-gray-500">or</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* Social Login */}
            <View className="space-y-4 ">
              <Button
                title="Continue with Google"
                onPress={() => {}}
                variant="outline"
                size="lg"
                style={{ marginBottom: 10 }}
                leftIcon={
                  <Ionicons name="logo-google" size={20} color="#4285f4" />
                }
              />

              <Button
                title="Continue with Phone"
                onPress={() => {}}
                variant="outline"
                size="lg"
                leftIcon={
                  <Ionicons name="call-outline" size={20} color="#0ea5e9" />
                }
              />
            </View>

            {/* Sign Up Link */}
            <View className="flex-row justify-center items-center mt-8">
              <Text className="text-gray-600">Don't have an account? </Text>
              <TouchableOpacity onPress={handleSignUp}>
                <Text className="text-primary-500 font-semibold">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
