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

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error("Login failed:", error);
    }
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
            {/* Microsoft Authentication */}
            <View className="space-y-6">
              <View className="items-center mb-8">
                <Text className="text-lg text-gray-600 text-center mb-4">
                  Sign in with your Microsoft account to continue
                </Text>
                {authError && (
                  <Text className="text-red-500 text-sm text-center mb-4">
                    {authError}
                  </Text>
                )}
              </View>

              <Button
                title="Sign In with Microsoft"
                onPress={handleLogin}
                loading={authLoading}
                size="lg"
                leftIcon={
                  <Ionicons name="logo-microsoft" size={20} color="white" />
                }
              />
            </View>

            {/* Information */}
            <View className="mt-8 p-4 bg-blue-50 rounded-lg">
              <Text className="text-sm text-blue-800 text-center">
                New to EventSphere? You'll be able to create an account during the sign-in process.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
