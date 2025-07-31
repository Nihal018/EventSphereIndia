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

  const handleRegister = async () => {
    try {
      await register();
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const handleLogin = () => {
    navigation.navigate("Login");
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1  bg-white">
      <Header title="Create Account" showBack onLeftPress={handleBack} />

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
          <View className="py-8">
            {/* Microsoft Authentication */}
            <View className="space-y-6">
              <View className="items-center mb-8">
                <Text className="text-lg text-gray-600 text-center mb-4">
                  Create your account with Microsoft
                </Text>
                <Text className="text-sm text-gray-500 text-center mb-4">
                  Your account will be created automatically when you sign in
                  for the first time
                </Text>
                {authError && (
                  <Text className="text-red-500 text-sm text-center mb-4">
                    {authError}
                  </Text>
                )}
              </View>

              <Button
                title="Sign Up with Microsoft"
                onPress={handleRegister}
                loading={authLoading}
                size="lg"
                leftIcon={
                  <Ionicons name="logo-microsoft" size={20} color="white" />
                }
              />
            </View>

            {/* Information */}
            <View className="mt-8 p-4 bg-blue-50 rounded-lg">
              <Text className="text-sm text-blue-800 text-center mb-2">
                By signing up, you agree to our Terms of Service and Privacy
                Policy
              </Text>
            </View>

            {/* Login Link */}
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
