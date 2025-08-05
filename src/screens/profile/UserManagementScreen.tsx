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
import Modal from "react-native-modal";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Header from "../../components/common/Header";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import SearchBar from "../../components/common/SearchBar";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api/apiService";
import { MainStackParamList } from "../../types";

type UserManagementScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  "UserManagement"
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
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [tempRole, setTempRole] = useState<string>("all");
  const [tempActiveFilter, setTempActiveFilter] = useState<string>("all");
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  // Check if user has admin privileges
  const isAdmin =
    userProfile?.role === "admin" || user?.email?.includes("admin");

  const loadUsers = useCallback(
    async (reset = false) => {
      if (!user?.id || !isAdmin) return;

      try {
        const currentOffset = reset ? 0 : offset;

        const response = await apiService.getUsers(user.id, {
          limit,
          offset: currentOffset,
          search: searchQuery || undefined,
          role: selectedRole === "all" ? undefined : selectedRole,
          isActive:
            activeFilter === "all"
              ? undefined
              : activeFilter === "active"
              ? true
              : false,
        });

        if (response.success && response.data) {
          const newUsers = response.data.users || [];

          if (reset) {
            setUsers(newUsers);
            setOffset(newUsers.length);
          } else {
            setUsers((prev) => [...prev, ...newUsers]);
            setOffset((prev) => prev + newUsers.length);
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
    },
    [user?.id, isAdmin, searchQuery, selectedRole, offset, limit]
  );

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

  // Real-time search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setOffset(0);
      setLoading(true);
      loadUsers(true);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedRole, activeFilter]);

  const handleRoleFilter = useCallback(
    (role: string) => {
      setSelectedRole(role);
      setOffset(0);
      setLoading(true);
      loadUsers(true);
    },
    [loadUsers]
  );

  const handleActiveFilter = useCallback(
    (filter: string) => {
      setActiveFilter(filter);
      setOffset(0);
      setLoading(true);
      loadUsers(true);
    },
    [loadUsers]
  );

  const clearAllFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedRole("all");
    setActiveFilter("all");
    setOffset(0);
    setLoading(true);
    loadUsers(true);
  }, [loadUsers]);

  const toggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
    if (!showFilters) {
      setTempRole(selectedRole);
      setTempActiveFilter(activeFilter);
    }
  }, [showFilters, selectedRole, activeFilter]);

  const handleApplyFilters = useCallback(() => {
    setSelectedRole(tempRole);
    setActiveFilter(tempActiveFilter);
    setOffset(0);
    setLoading(true);
    loadUsers(true);
    setShowFilters(false);
  }, [tempRole, tempActiveFilter, loadUsers]);

  const handleClearFilters = useCallback(() => {
    setTempRole("all");
    setTempActiveFilter("all");
    setSelectedRole("all");
    setActiveFilter("all");
    setSearchQuery("");
    setOffset(0);
    setLoading(true);
    loadUsers(true);
    setShowFilters(false);
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
      case "admin":
        return "#ef4444";
      case "organizer":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getRoleBadge = (role: string) => {
    const color = getRoleColor(role);
    return (
      <View
        style={{
          backgroundColor: `${color}20`,
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: color,
        }}
      >
        <Text
          style={{
            color: color,
            fontSize: 12,
            fontWeight: "600",
            textTransform: "capitalize",
          }}
        >
          {role}
        </Text>
      </View>
    );
  };

  const handleUserAction = (
    action: string,
    userId: string,
    userName: string
  ) => {
    switch (action) {
      case "view":
        Alert.alert("User Details", `Viewing details for ${userName}`);
        break;
      case "edit":
        Alert.alert(
          "Edit User",
          `Edit functionality for ${userName} not implemented yet`
        );
        break;
      case "disable":
        Alert.alert(
          "Disable User",
          `Are you sure you want to disable ${userName}?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Disable",
              style: "destructive",
              onPress: () => {
                Alert.alert(
                  "Info",
                  "User disable functionality not implemented yet"
                );
              },
            },
          ]
        );
        break;
      default:
        break;
    }
  };

  const renderUserItem = ({ item }: { item: UserItem }) => (
    <Card style={{ marginBottom: 12 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                backgroundColor: "#dbeafe",
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Text
                style={{
                  color: "#0ea5e9",
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                {item.name?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#1f2937",
                  marginBottom: 2,
                }}
              >
                {item.name}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#6b7280",
                }}
              >
                {item.email}
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            {getRoleBadge(item.role)}
            <View
              style={{
                backgroundColor: item.isActive ? "#10b98120" : "#ef444420",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: item.isActive ? "#10b981" : "#ef4444",
              }}
            >
              <Text
                style={{
                  color: item.isActive ? "#10b981" : "#ef4444",
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {item.isActive ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>

          {(item.city || item.state) && (
            <Text
              style={{
                fontSize: 14,
                color: "#6b7280",
                marginBottom: 8,
              }}
            >
              📍 {[item.city, item.state].filter(Boolean).join(", ")}
            </Text>
          )}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: "#9ca3af",
              }}
            >
              Joined: {formatDate(item.createdAt)}
            </Text>
            {item.metadata?.loginCount !== undefined && (
              <Text
                style={{
                  fontSize: 12,
                  color: "#9ca3af",
                }}
              >
                {item.metadata.loginCount} logins
              </Text>
            )}
          </View>

          {/* User Actions */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              marginTop: 8,
            }}
          >
            <TouchableOpacity
              onPress={() => handleUserAction("view", item.id, item.name)}
              style={{
                backgroundColor: "#f0f9ff",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
                marginRight: 8,
                borderWidth: 1,
                borderColor: "#0ea5e9",
              }}
            >
              <Text
                style={{
                  color: "#0ea5e9",
                  fontSize: 12,
                  fontWeight: "500",
                }}
              >
                View
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleUserAction("edit", item.id, item.name)}
              style={{
                backgroundColor: "#fffbeb",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
                marginRight: 8,
                borderWidth: 1,
                borderColor: "#f59e0b",
              }}
            >
              <Text
                style={{
                  color: "#f59e0b",
                  fontSize: 12,
                  fontWeight: "500",
                }}
              >
                Edit
              </Text>
            </TouchableOpacity>

            {item.isActive && (
              <TouchableOpacity
                onPress={() => handleUserAction("disable", item.id, item.name)}
                style={{
                  backgroundColor: "#fef2f2",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: "#ef4444",
                }}
              >
                <Text
                  style={{
                    color: "#ef4444",
                    fontSize: 12,
                    fontWeight: "500",
                  }}
                >
                  Disable
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Card>
  );

  if (!isAdmin) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fafafa" }}>
        <Header
          title="User Management"
          showBackButton
          onLeftPress={() => {
            navigation.goBack();
          }}
        />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Ionicons name="shield-outline" size={64} color="#ef4444" />
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#ef4444",
              marginTop: 16,
              textAlign: "center",
            }}
          >
            Access Denied
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#6b7280",
              marginTop: 8,
              textAlign: "center",
            }}
          >
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
      <Header
        title="User Management"
        showBackButton
        onLeftPress={() => {
          console.log("UserManagement: Back button pressed");
          navigation.goBack();
        }}
      />

      {/* Stats Cards
      {stats && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16 }}
        >
          <Card style={{ marginRight: 12, padding: 16, minWidth: 120 }}>
            <Text
              style={{ fontSize: 24, fontWeight: "bold", color: "#0ea5e9" }}
            >
              {stats.totalUsers}
            </Text>
            <Text style={{ fontSize: 12, color: "#6b7280" }}>Total Users</Text>
          </Card>

          <Card style={{ marginRight: 12, padding: 16, minWidth: 120 }}>
            <Text
              style={{ fontSize: 24, fontWeight: "bold", color: "#10b981" }}
            >
              {stats.activeUsers}
            </Text>
            <Text style={{ fontSize: 12, color: "#6b7280" }}>Active Users</Text>
          </Card>

          <Card style={{ marginRight: 12, padding: 16, minWidth: 120 }}>
            <Text
              style={{ fontSize: 24, fontWeight: "bold", color: "#ef4444" }}
            >
              {stats.adminUsers}
            </Text>
            <Text style={{ fontSize: 12, color: "#6b7280" }}>Admins</Text>
          </Card>

          <Card style={{ marginRight: 12, padding: 16, minWidth: 120 }}>
            <Text
              style={{ fontSize: 24, fontWeight: "bold", color: "#f59e0b" }}
            >
              {stats.organizerUsers}
            </Text>
            <Text style={{ fontSize: 12, color: "#6b7280" }}>Organizers</Text>
          </Card>
        </ScrollView>
      )} */}

      {/* Compact Search and Filter */}
      <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFilter={toggleFilters}
          placeholder="Search users by name or email..."
          showFilter={true}
        />

        {/* Active Filters Summary */}
        {(searchQuery || selectedRole !== "all" || activeFilter !== "all") && (
          <View
            style={{
              backgroundColor: "#f0f9ff",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#bfdbfe",
              marginTop: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: "#1e40af",
                fontWeight: "500",
                flex: 1,
              }}
            >
              Active Filters:{" "}
              {[
                searchQuery && `Search: "${searchQuery}"`,
                selectedRole !== "all" && `Role: ${selectedRole}`,
                activeFilter !== "all" && `Status: ${activeFilter}`,
              ]
                .filter(Boolean)
                .join(" • ")}
            </Text>
            <TouchableOpacity
              onPress={clearAllFilters}
              style={{
                marginLeft: 8,
                padding: 4,
              }}
            >
              <Ionicons name="close-circle" size={16} color="#1e40af" />
            </TouchableOpacity>
          </View>
        )}
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
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingVertical: 40,
              }}
            >
              <ActivityIndicator size="large" color="#0ea5e9" />
              <Text style={{ marginTop: 16, color: "#6b7280" }}>
                Loading users...
              </Text>
            </View>
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingVertical: 40,
              }}
            >
              <Ionicons name="people-outline" size={64} color="#9ca3af" />
              <Text
                style={{
                  fontSize: 16,
                  color: "#6b7280",
                  marginTop: 16,
                  textAlign: "center",
                }}
              >
                No users found
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#9ca3af",
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
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

      {/* Filter Modal */}
      <Modal
        isVisible={showFilters}
        onBackdropPress={() => setShowFilters(false)}
        style={{ margin: 0, justifyContent: "flex-end" }}
      >
        <View
          style={{
            backgroundColor: "#ffffff",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            maxHeight: "80%",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#1f2937",
              }}
            >
              Filter Users
            </Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Role Filter Section */}
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: 12,
                }}
              >
                Filter by Role
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {["all", "user", "organizer", "admin"].map((role) => (
                  <TouchableOpacity
                    key={role}
                    onPress={() => setTempRole(role)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 1,
                      backgroundColor:
                        tempRole === role ? "#0ea5e9" : "#ffffff",
                      borderColor: tempRole === role ? "#0ea5e9" : "#d1d5db",
                    }}
                  >
                    <Text
                      style={{
                        color: tempRole === role ? "#ffffff" : "#374151",
                        fontSize: 14,
                        fontWeight: "500",
                        textTransform: "capitalize",
                      }}
                    >
                      {role === "all" ? "All Roles" : `${role}s`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Status Filter Section */}
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: 12,
                }}
              >
                Filter by Status
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {["all", "active", "inactive"].map((status) => (
                  <TouchableOpacity
                    key={status}
                    onPress={() => setTempActiveFilter(status)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 1,
                      backgroundColor:
                        tempActiveFilter === status ? "#10b981" : "#ffffff",
                      borderColor:
                        tempActiveFilter === status ? "#10b981" : "#d1d5db",
                    }}
                  >
                    <Text
                      style={{
                        color:
                          tempActiveFilter === status ? "#ffffff" : "#374151",
                        fontSize: 14,
                        fontWeight: "500",
                        textTransform: "capitalize",
                      }}
                    >
                      {status === "all" ? "All Status" : status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              marginTop: 16,
            }}
          >
            <Button
              title="Clear All"
              onPress={handleClearFilters}
              variant="outline"
              style={{ flex: 1 }}
            />
            <Button
              title="Apply Filters"
              onPress={handleApplyFilters}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default React.memo(UserManagementScreen);
