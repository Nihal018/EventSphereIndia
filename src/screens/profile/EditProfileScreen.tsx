import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Header from "../../components/common/Header";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { useAuth } from "../../contexts/AuthContext";
import { MainStackParamList } from "../../types";

type EditProfileScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'EditProfile'
>;

const EditProfileScreen: React.FC = () => {
  const { 
    user, 
    userProfile, 
    profileLoading, 
    profileError, 
    updateUserProfile,
    loadUserProfile 
  } = useAuth();
  const navigation = useNavigation<EditProfileScreenNavigationProp>();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    state: "",
    preferences: [] as string[],
  });
  const [saving, setSaving] = useState(false);

  // Load user profile on mount
  useEffect(() => {
    if (user?.id && !userProfile) {
      loadUserProfile(user.id);
    }
  }, [user?.id, userProfile, loadUserProfile]);

  // Update form data when profile loads
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        phone: userProfile.phone || "",
        city: userProfile.city || "",
        state: userProfile.state || "",
        preferences: userProfile.preferences || [],
      });
    } else if (user) {
      setFormData({
        name: user.name || "",
        phone: "",
        city: "",
        state: "",
        preferences: [],
      });
    }
  }, [userProfile, user]);

  const handleSave = async () => {
    if (!user?.id) {
      Alert.alert("Error", "User not found");
      return;
    }

    if (!formData.name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile(user.id, {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        preferences: formData.preferences,
      });

      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceToggle = (preference: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: prev.preferences.includes(preference)
        ? prev.preferences.filter(p => p !== preference)
        : [...prev.preferences, preference],
    }));
  };

  const availablePreferences = [
    "Music", "Sports", "Technology", "Arts", "Food", "Travel",
    "Business", "Health", "Education", "Entertainment", "Fashion", "Gaming"
  ];

  if (profileLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fafafa" }}>
        <Header 
          title="Edit Profile" 
          showBackButton 
          onLeftPress={() => {
            navigation.goBack();
          }} 
        />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={{ marginTop: 16, color: "#6b7280" }}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (profileError) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fafafa" }}>
        <Header 
          title="Edit Profile" 
          showBackButton 
          onLeftPress={() => {
            navigation.goBack();
          }} 
        />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text style={{ 
            marginTop: 16, 
            color: "#ef4444", 
            fontSize: 16, 
            fontWeight: "600",
            textAlign: "center" 
          }}>
            Failed to load profile
          </Text>
          <Text style={{ 
            marginTop: 8, 
            color: "#6b7280", 
            textAlign: "center" 
          }}>
            {profileError}
          </Text>
          <Button
            title="Retry"
            onPress={() => user?.id && loadUserProfile(user.id)}
            style={{ marginTop: 16 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fafafa" }}>
      <Header 
        title="Edit Profile" 
        showBackButton 
        onLeftPress={() => {
          navigation.goBack();
        }} 
      />
      
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Basic Information */}
        <Card style={{ marginBottom: 20 }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: "600", 
            color: "#1f2937", 
            marginBottom: 16 
          }}>
            Basic Information
          </Text>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ 
              fontSize: 14, 
              fontWeight: "500", 
              color: "#374151", 
              marginBottom: 8 
            }}>
              Full Name *
            </Text>
            <TextInput
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              style={{
                borderWidth: 1,
                borderColor: "#d1d5db",
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                backgroundColor: "#ffffff",
              }}
              placeholder="Enter your full name"
              autoCapitalize="words"
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ 
              fontSize: 14, 
              fontWeight: "500", 
              color: "#374151", 
              marginBottom: 8 
            }}>
              Email
            </Text>
            <TextInput
              value={user?.email || ""}
              editable={false}
              style={{
                borderWidth: 1,
                borderColor: "#d1d5db",
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                backgroundColor: "#f9fafb",
                color: "#6b7280",
              }}
            />
            <Text style={{ 
              fontSize: 12, 
              color: "#6b7280", 
              marginTop: 4 
            }}>
              Email cannot be changed
            </Text>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ 
              fontSize: 14, 
              fontWeight: "500", 
              color: "#374151", 
              marginBottom: 8 
            }}>
              Phone Number
            </Text>
            <TextInput
              value={formData.phone}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
              style={{
                borderWidth: 1,
                borderColor: "#d1d5db",
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                backgroundColor: "#ffffff",
              }}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>
        </Card>

        {/* Location Information */}
        <Card style={{ marginBottom: 20 }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: "600", 
            color: "#1f2937", 
            marginBottom: 16 
          }}>
            Location
          </Text>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ 
              fontSize: 14, 
              fontWeight: "500", 
              color: "#374151", 
              marginBottom: 8 
            }}>
              City
            </Text>
            <TextInput
              value={formData.city}
              onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
              style={{
                borderWidth: 1,
                borderColor: "#d1d5db",
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                backgroundColor: "#ffffff",
              }}
              placeholder="Enter your city"
              autoCapitalize="words"
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ 
              fontSize: 14, 
              fontWeight: "500", 
              color: "#374151", 
              marginBottom: 8 
            }}>
              State
            </Text>
            <TextInput
              value={formData.state}
              onChangeText={(text) => setFormData(prev => ({ ...prev, state: text }))}
              style={{
                borderWidth: 1,
                borderColor: "#d1d5db",
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                backgroundColor: "#ffffff",
              }}
              placeholder="Enter your state"
              autoCapitalize="words"
            />
          </View>
        </Card>

        {/* Preferences */}
        <Card style={{ marginBottom: 20 }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: "600", 
            color: "#1f2937", 
            marginBottom: 8 
          }}>
            Event Preferences
          </Text>
          <Text style={{ 
            fontSize: 14, 
            color: "#6b7280", 
            marginBottom: 16 
          }}>
            Select your interests to get personalized event recommendations
          </Text>

          <View style={{ 
            flexDirection: "row", 
            flexWrap: "wrap", 
            marginHorizontal: -4 
          }}>
            {availablePreferences.map((preference) => (
              <TouchableOpacity
                key={preference}
                onPress={() => handlePreferenceToggle(preference)}
                style={{
                  backgroundColor: formData.preferences.includes(preference) 
                    ? "#0ea5e9" 
                    : "#f3f4f6",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 16,
                  margin: 4,
                }}
              >
                <Text style={{
                  color: formData.preferences.includes(preference) 
                    ? "#ffffff" 
                    : "#374151",
                  fontSize: 14,
                  fontWeight: "500",
                }}>
                  {preference}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Profile Stats */}
        {userProfile?.stats && (
          <Card style={{ marginBottom: 20 }}>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: "600", 
              color: "#1f2937", 
              marginBottom: 16 
            }}>
              Your Activity
            </Text>

            <View style={{ 
              flexDirection: "row", 
              justifyContent: "space-between",
              flexWrap: "wrap" 
            }}>
              <View style={{ alignItems: "center", marginBottom: 16 }}>
                <Text style={{ 
                  fontSize: 24, 
                  fontWeight: "bold", 
                  color: "#0ea5e9" 
                }}>
                  {userProfile.stats.totalBookings || 0}
                </Text>
                <Text style={{ 
                  fontSize: 14, 
                  color: "#6b7280", 
                  textAlign: "center" 
                }}>
                  Total{"\n"}Bookings
                </Text>
              </View>

              <View style={{ alignItems: "center", marginBottom: 16 }}>
                <Text style={{ 
                  fontSize: 24, 
                  fontWeight: "bold", 
                  color: "#10b981" 
                }}>
                  {userProfile.stats.confirmedBookings || 0}
                </Text>
                <Text style={{ 
                  fontSize: 14, 
                  color: "#6b7280", 
                  textAlign: "center" 
                }}>
                  Confirmed{"\n"}Events
                </Text>
              </View>

              <View style={{ alignItems: "center", marginBottom: 16 }}>
                <Text style={{ 
                  fontSize: 24, 
                  fontWeight: "bold", 
                  color: "#f59e0b" 
                }}>
                  ₹{userProfile.stats.totalSpent || 0}
                </Text>
                <Text style={{ 
                  fontSize: 14, 
                  color: "#6b7280", 
                  textAlign: "center" 
                }}>
                  Total{"\n"}Spent
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Save Button */}
        <Button
          title={saving ? "Saving..." : "Save Changes"}
          onPress={handleSave}
          disabled={saving || !formData.name.trim()}
          style={{ marginBottom: 20 }}
          leftIcon={saving ? 
            <ActivityIndicator size="small" color="#ffffff" /> : 
            <Ionicons name="checkmark" size={20} color="#ffffff" />
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default React.memo(EditProfileScreen);