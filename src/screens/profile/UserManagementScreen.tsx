import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Header from "../../components/common/Header";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api/apiService";
import { ProfileStackParamList } from "../../types";

type UserManagementScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'UserManagement'
>;

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  city?: string;
  state?: string;
  createdAt: string;
  metadata?: {
    lastLoginAt?: string;
    loginCount?: number;
    emailVerified?: boolean;
  };
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  organizerUsers: number;
  regularUsers: number;
}

const UserManagementScreen: React.FC = () => {
  const { user, userProfile } = useAuth();
  const navigation = useNavigation<UserManagementScreenNavigationProp>();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  // Check if user has admin privileges
  const isAdmin = userProfile?.role === "admin" || user?.email?.includes("admin");

  const loadUsers = useCallback(async (reset = false) => {
    if (!user?.id || !isAdmin) return;

    try {
      const currentOffset = reset ? 0 : offset;
      
      const response = await apiService.getUsers(user.id, {
        limit,
        offset: currentOffset,
        search: searchQuery || undefined,
        role: selectedRole === "all" ? undefined : selectedRole,
      });

      if (response.success && response.data) {
        const newUsers = response.data.users || [];
        
        if (reset) {
          setUsers(newUsers);
          setOffset(newUsers.length);
        } else {
          setUsers(prev => [...prev, ...newUsers]);
          setOffset(prev => prev + newUsers.length);
        }
        
        setStats(response.data.stats || null);
        setHasMore(response.data.pagination?.hasMore || false);
      } else {
        Alert.alert("Error", response.error || "Failed to load users");
      }
    } catch (error) {
      console.error("Error loading users:", error);
      Alert.alert("Error", "Failed to load users");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, isAdmin, searchQuery, selectedRole, offset, limit]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setOffset(0);
    loadUsers(true);
  }, [loadUsers]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadUsers(false);
    }
  }, [loading, hasMore, loadUsers]);

  const handleSearch = useCallback(() => {
    setOffset(0);
    setLoading(true);
    loadUsers(true);
  }, [loadUsers]);

  const handleRoleFilter = useCallback((role: string) => {
    setSelectedRole(role);
    setOffset(0);
    setLoading(true);
    loadUsers(true);
  }, [loadUsers]);

  useEffect(() => {
    if (isAdmin) {
      loadUsers(true);
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Unknown";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "#ef4444";
      case "organizer": return "#f59e0b";
      default: return "#6b7280";
    }
  };

  const getRoleBadge = (role: string) => {
    const color = getRoleColor(role);
    return (
      <View style={{
        backgroundColor: `${color}20`,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: color,
      }}>
        <Text style={{
          color: color,
          fontSize: 12,
          fontWeight: "600",
          textTransform: "capitalize",
        }}>
          {role}
        </Text>
      </View>
    );
  };

  const renderUserItem = ({ item }: { item: UserItem }) => (
    <Card style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <View style={{
              width: 40,
              height: 40,
              backgroundColor: "#dbeafe",
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}>
              <Text style={{
                color: "#0ea5e9",
                fontSize: 16,
                fontWeight: "bold",
              }}>
                {item.name?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: 2,
              }}>
                {item.name}
              </Text>
              <Text style={{
                fontSize: 14,
                color: "#6b7280",
              }}>
                {item.email}
              </Text>
            </View>
          </View>

          <View style={{ 
            flexDirection: "row", 
            alignItems: "center", 
            justifyContent: "space-between",
            marginBottom: 8 
          }}>
            {getRoleBadge(item.role)}
            <View style={{
              backgroundColor: item.isActive ? "#10b98120" : "#ef444420",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: item.isActive ? "#10b981" : "#ef4444",
            }}>
              <Text style={{
                color: item.isActive ? "#10b981" : "#ef4444",
                fontSize: 12,
                fontWeight: "600",
              }}>
                {item.isActive ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>

          {(item.city || item.state) && (
            <Text style={{
              fontSize: 14,
              color: "#6b7280",
              marginBottom: 8,
            }}>
              📍 {[item.city, item.state].filter(Boolean).join(", ")}
            </Text>
          )}

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{
              fontSize: 12,
              color: "#9ca3af",
            }}>
              Joined: {formatDate(item.createdAt)}
            </Text>
            {item.metadata?.loginCount && (
              <Text style={{
                fontSize: 12,
                color: "#9ca3af",
              }}>
                {item.metadata.loginCount} logins
              </Text>
            )}
          </View>
        </View>
      </View>
    </Card>
  );

  if (!isAdmin) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fafafa" }}>
        <Header title="User Management" showBackButton />
        <View style={{ 
          flex: 1, 
          justifyContent: "center", 
          alignItems: "center", 
          padding: 20 
        }}>
          <Ionicons name="shield-outline" size={64} color="#ef4444" />
          <Text style={{
            fontSize: 18,
            fontWeight: "600",
            color: "#ef4444",
            marginTop: 16,
            textAlign: "center",
          }}>
            Access Denied
          </Text>
          <Text style={{
            fontSize: 14,
            color: "#6b7280",
            marginTop: 8,
            textAlign: "center",
          }}>
            You need admin privileges to access this feature
          </Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 16 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fafafa" }}>
      <Header title="User Management" showBackButton />
      
      {/* Stats Cards */}
      {stats && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16 }}
        >
          <Card style={{ marginRight: 12, padding: 16, minWidth: 120 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#0ea5e9" }}>
              {stats.totalUsers}
            </Text>
            <Text style={{ fontSize: 12, color: "#6b7280" }}>Total Users</Text>
          </Card>
          
          <Card style={{ marginRight: 12, padding: 16, minWidth: 120 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#10b981" }}>
              {stats.activeUsers}
            </Text>
            <Text style={{ fontSize: 12, color: "#6b7280" }}>Active Users</Text>
          </Card>
          
          <Card style={{ marginRight: 12, padding: 16, minWidth: 120 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#ef4444" }}>
              {stats.adminUsers}
            </Text>
            <Text style={{ fontSize: 12, color: "#6b7280" }}>Admins</Text>
          </Card>
          
          <Card style={{ marginRight: 12, padding: 16, minWidth: 120 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#f59e0b" }}>
              {stats.organizerUsers}
            </Text>
            <Text style={{ fontSize: 12, color: "#6b7280" }}>Organizers</Text>
          </Card>
        </ScrollView>
      )}

      {/* Search and Filters */}
      <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
        <View style={{ 
          flexDirection: "row", 
          alignItems: "center", 
          marginBottom: 12 
        }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search users..."
              style={{
                borderWidth: 1,
                borderColor: "#d1d5db",
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                backgroundColor: "#ffffff",
              }}
              onSubmitEditing={handleSearch}
            />
          </View>
          <TouchableOpacity
            onPress={handleSearch}
            style={{
              backgroundColor: "#0ea5e9",
              padding: 12,
              borderRadius: 8,
            }}
          >
            <Ionicons name="search" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 4 }}
        >
          {["all", "user", "organizer", "admin"].map((role) => (
            <TouchableOpacity
              key={role}
              onPress={() => handleRoleFilter(role)}
              style={{
                backgroundColor: selectedRole === role ? "#0ea5e9" : "#f3f4f6",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 16,
                marginRight: 8,
              }}
            >
              <Text style={{
                color: selectedRole === role ? "#ffffff" : "#374151",
                fontSize: 14,
                fontWeight: "500",
                textTransform: "capitalize",
              }}>
                {role === "all" ? "All Users" : `${role}s`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Users List */}
      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#0ea5e9"]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          loading ? (
            <View style={{ 
              flex: 1, 
              justifyContent: "center", 
              alignItems: "center", 
              paddingVertical: 40 
            }}>
              <ActivityIndicator size="large" color="#0ea5e9" />
              <Text style={{ marginTop: 16, color: "#6b7280" }}>
                Loading users...
              </Text>
            </View>
          ) : (
            <View style={{ 
              flex: 1, 
              justifyContent: "center", 
              alignItems: "center", 
              paddingVertical: 40 
            }}>
              <Ionicons name="people-outline" size={64} color="#9ca3af" />
              <Text style={{
                fontSize: 16,
                color: "#6b7280",
                marginTop: 16,
                textAlign: "center",
              }}>
                No users found
              </Text>
              <Text style={{
                fontSize: 14,
                color: "#9ca3af",
                marginTop: 8,
                textAlign: "center",
              }}>
                Try adjusting your search or filters
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          loading && users.length > 0 ? (
            <View style={{ paddingVertical: 16, alignItems: "center" }}>
              <ActivityIndicator size="small" color="#0ea5e9" />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default React.memo(UserManagementScreen);