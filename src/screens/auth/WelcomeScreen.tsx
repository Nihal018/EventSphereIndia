import React from "react";
import { View, Text, ImageBackground, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../types";
import Button from "../../components/common/Button";

type WelcomeScreenNavigationProp =
  NativeStackNavigationProp<AuthStackParamList>;

export default function WelcomeScreen() {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  const handleGetStarted = () => {
    navigation.navigate("Login");
  };

  const handleSignUp = () => {
    navigation.navigate("Register");
  };

  return (
    <View className="flex-1">
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=800&fit=crop",
        }}
        className="flex-1"
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.4)", "rgba(0,0,0,0.8)"]}
          className="flex-1"
        >
          <SafeAreaView className="flex-1 justify-between">
            {/* Header */}
            <View className="items-center pt-20">
              <Text className="text-white text-4xl font-bold text-center">
                EventSphere
              </Text>
              <Text className="text-white text-lg text-center mt-2 opacity-90">
                India
              </Text>
            </View>

            {/* Welcome Content */}
            <View className="px-8 pb-12">
              <Text className="text-white text-3xl font-bold text-center mb-4">
                Discover Amazing Events
              </Text>
              <Text className="text-white text-lg text-center mb-8 opacity-90 leading-6">
                Find concerts, workshops, festivals, and more happening around
                you. Book tickets instantly and never miss out!
              </Text>

              {/* Buttons */}
              <View className="space-y-4">
                <Button
                  title="Get Started"
                  style={{ marginBottom: 10 }}
                  onPress={handleGetStarted}
                  size="lg"
                />

                <Button
                  title="Sign Up"
                  onPress={handleSignUp}
                  variant="outline"
                  size="lg"
                  style={{
                    borderColor: "#ffffff",
                    backgroundColor: "rgba(255,255,255,0.1)",
                  }}
                  textStyle={{
                    color: "#ffffff",
                  }}
                />
              </View>

              {/* Features */}
              <View className="mt-12 space-y-3">
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-white rounded-full mr-3" />
                  <Text className="text-white opacity-90">
                    Discover events across India
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-white rounded-full mr-3" />
                  <Text className="text-white opacity-90">
                    Secure & instant booking
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-white rounded-full mr-3" />
                  <Text className="text-white opacity-90">
                    Digital tickets & QR codes
                  </Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}
