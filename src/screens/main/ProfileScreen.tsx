import React, { useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/common/Header";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { useAuth } from "../../contexts/AuthContext";

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = useCallback(() => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  }, [logout]);

  const menuItems = [
    { icon: "person-outline", title: "Edit Profile", onPress: () => {} },
    { icon: "heart-outline", title: "Favorite Events", onPress: () => {} },
    {
      icon: "notifications-outline",
      title: "Notifications",
      onPress: () => {},
    },
    { icon: "card-outline", title: "Payment Methods", onPress: () => {} },
    { icon: "help-circle-outline", title: "Help & Support", onPress: () => {} },
    { icon: "settings-outline", title: "Settings", onPress: () => {} },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Header title="Profile" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-6">
          {/* Profile Header */}
          <Card className="items-center p-6 mb-6">
            <View className="w-24 h-24 bg-primary-100 rounded-full items-center justify-center mb-4">
              <Text className="text-primary-500 text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-1">
              {user?.name || "User"}
            </Text>
            <Text className="text-gray-500 mb-4">{user?.email}</Text>
            <Button
              title="Edit Profile"
              onPress={() => {}}
              variant="outline"
              size="sm"
            />
          </Card>

          {/* Menu Items */}
          <Card style={{ marginBottom: 12 }}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.title}
                onPress={item.onPress}
                className={`flex-row items-center py-4 ${
                  index < menuItems.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <Ionicons name={item.icon as any} size={24} color="#6b7280" />
                <Text className="flex-1 text-gray-900 font-medium ml-4">
                  {item.title}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </Card>

          {/* App Info */}
          <Card className="mb-6">
            <View className="flex-row items-center justify-between py-4 border-b border-gray-100">
              <Text className="text-gray-900 font-medium">Version</Text>
              <Text className="text-gray-500">1.0.0</Text>
            </View>
            <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-gray-100">
              <Text className="text-gray-900 font-medium">
                Terms & Conditions
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center justify-between py-4">
              <Text className="text-gray-900 font-medium">Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </Card>

          {/* Logout Button */}
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            style={{ borderColor: "#ef4444" }}
            textStyle={{ color: "#ef4444" }}
            leftIcon={
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default React.memo(ProfileScreen);
