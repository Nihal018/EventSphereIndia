import React, { useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Header from "../../components/common/Header";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { useAuth } from "../../contexts/AuthContext";
import { MainStackParamList } from "../../types";

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'MainTabs'
>;

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  const handleLogout = useCallback(() => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  }, [logout]);

  const menuItems = [
    { icon: "person-outline", title: "Edit Profile", onPress: () => {} },
    { 
      icon: "calendar-outline", 
      title: "My Events", 
      onPress: () => navigation.navigate('MyEvents'),
    },
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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#fafafa" }}
      edges={["left", "right", "bottom"]}
    >
      <ScrollView
        style={{ flex: 1, marginTop: 20, marginBottom: -36 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 30,
          paddingTop: 44,
        }}
      >
        {/* Profile Header */}
        <Card style={{ alignItems: "center", padding: 24, marginBottom: 24 }}>
          <View
            style={{
              width: 96,
              height: 96,
              backgroundColor: "#dbeafe",
              borderRadius: 48,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: "#0ea5e9",
                fontSize: 32,
                fontWeight: "bold",
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "#1f2937",
              marginBottom: 4,
            }}
          >
            {user?.name || "User"}
          </Text>
          <Text
            style={{
              color: "#6b7280",
              marginBottom: 16,
            }}
          >
            {user?.email || "user@example.com"}
          </Text>
          <Button
            title="Edit Profile"
            onPress={() => {}}
            variant="outline"
            size="sm"
          />
        </Card>

        {/* Menu Items */}
        <Card style={{ marginBottom: 24 }}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.title}
              onPress={item.onPress}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 16,
                borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
                borderBottomColor: "#f3f4f6",
              }}
            >
              <Ionicons name={item.icon as any} size={24} color="#6b7280" />
              <Text
                style={{
                  flex: 1,
                  color: "#1f2937",
                  fontWeight: "500",
                  marginLeft: 16,
                }}
              >
                {item.title}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </Card>

        {/* App Info */}
        <Card style={{ marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#f3f4f6",
            }}
          >
            <Text style={{ color: "#1f2937", fontWeight: "500" }}>Version</Text>
            <Text style={{ color: "#6b7280" }}>1.0.0</Text>
          </View>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#f3f4f6",
            }}
          >
            <Text style={{ color: "#1f2937", fontWeight: "500" }}>
              Terms & Conditions
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 16,
            }}
          >
            <Text style={{ color: "#1f2937", fontWeight: "500" }}>
              Privacy Policy
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </Card>

        {/* Logout Button */}
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          style={{
            borderColor: "#ef4444",
            width: "50%",
            alignSelf: "center",
            marginTop: 8,
            marginBottom: 22,
          }}
          textStyle={{ color: "#ef4444" }}
          leftIcon={
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default React.memo(ProfileScreen);
