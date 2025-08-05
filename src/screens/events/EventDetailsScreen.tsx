import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Linking,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEvents } from "../../contexts/EventsContext";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import { format, parseISO } from "date-fns";
import { MainStackParamList, Event } from "../../types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

const { width: screenWidth } = Dimensions.get("window");
type EventDetailsScreenNavigationProp =
  NativeStackNavigationProp<MainStackParamList>;

const EventDetailsScreen: React.FC = () => {
  const navigation = useNavigation<EventDetailsScreenNavigationProp>();
  const route = useRoute();
  const { eventId } = route.params as { eventId: string };
  const { getEventById, isEventLiked, toggleLikeEvent, events } = useEvents();
  const [selectedImage, setSelectedImage] = useState(0);
  const [event, setEvent] = useState<Event | null>(null);

  // Find event in current events list or fetch it
  React.useEffect(() => {
    const foundEvent = events.find((e) => e.id === eventId);
    if (foundEvent) {
      setEvent(foundEvent);
    } else {
      // If not found in current list, try to fetch it
      getEventById(eventId).then((fetchedEvent) => {
        if (fetchedEvent) {
          setEvent(fetchedEvent);
        }
      });
    }
  }, [eventId, events, getEventById]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleBookNow = useCallback(() => {
    if (event) {
      navigation.navigate("Booking", { eventId: eventId });
    }
  }, [navigation, event]);

  const handleGetDirections = useCallback(() => {
    if (event && event.venue) {
      const { latitude, longitude } = event.venue;
      if (latitude && longitude) {
        const url = `https://maps.google.com/?q=${latitude},${longitude}`;
        Linking.openURL(url);
      }
    }
  }, [event]);

  const handleShare = useCallback(() => {
    console.log("Share event");
  }, []);

  if (!event) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-500">Event not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View className="h-80 relative">
          <ImageBackground
            source={{
              uri:
                event?.images?.[selectedImage] ||
                "https://via.placeholder.com/400x300",
            }}
            className="flex-1"
            resizeMode="cover"
          >
            <LinearGradient
              colors={["rgba(0,0,0,0.3)", "transparent", "rgba(0,0,0,0.7)"]}
              className="flex-1"
            >
              {/* Navigation Header */}
              <View className="flex-row justify-between items-center px-5 pt-4">
                <TouchableOpacity
                  onPress={handleBack}
                  className="bg-gray-100 rounded-full p-2 hover:opacity-80"
                >
                  <Ionicons name="chevron-back" size={24} color="#1f2937" />
                </TouchableOpacity>

                <View className="flex-row space-x-3">
                  <TouchableOpacity
                    onPress={() => event?.id && toggleLikeEvent(event.id)}
                    className="bg-white/90 rounded-full p-2 shadow-sm"
                  >
                    <Ionicons
                      name={
                        event?.id && isEventLiked(event.id)
                          ? "heart"
                          : "heart-outline"
                      }
                      size={24}
                      color={
                        event?.id && isEventLiked(event.id)
                          ? "#ef4444"
                          : "#1f2937"
                      }
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleShare}
                    className="bg-white/90 rounded-full p-2 shadow-sm"
                  >
                    <Ionicons name="share-outline" size={24} color="#1f2937" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Image Indicators */}
              {(event?.images?.length || 0) > 1 && (
                <View className="absolute bottom-4 left-0 right-0">
                  <View className="flex-row justify-center space-x-2">
                    {event?.images?.map((_: string, index: number) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => setSelectedImage(index)}
                        className={`w-2 h-2 rounded-full ${
                          selectedImage === index ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </View>
                </View>
              )}
            </LinearGradient>
          </ImageBackground>
        </View>

        <View className="px-5 py-6">
          {/* Event Header */}
          <View className="mb-6">
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-1 mr-4">
                <Text className="text-2xl font-bold text-gray-900 mb-2">
                  {event?.title || "Event Title"}
                </Text>
                <View className="flex-row items-center">
                  <View className="bg-primary-100 px-3 py-1 rounded-full mr-2">
                    <Text className="text-primary-700 text-sm font-medium">
                      {event?.category || "Category"}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={16} color="#f59e0b" />
                    <Text className="text-gray-600 ml-1">
                      {event?.rating || 0} ({event?.reviewCount || 0} reviews)
                    </Text>
                  </View>
                </View>
              </View>

              <View className="items-end">
                {event?.isFree ? (
                  <Text className="text-2xl font-bold text-primary-500">
                    Free
                  </Text>
                ) : (
                  <>
                    <Text className="text-2xl font-bold text-gray-900">
                      ₹{event?.price?.min?.toLocaleString() || "0"}
                    </Text>
                    {(event?.price?.max || 0) > (event?.price?.min || 0) && (
                      <Text className="text-gray-500">onwards</Text>
                    )}
                  </>
                )}
              </View>
            </View>
          </View>

          {/* Event Info Cards */}
          <View className="space-y-4 mb-6">
            <Card className="mb-3">
              <View className="flex-row items-center">
                <Ionicons name="calendar" size={28} color="#0ea5e9" />
                <View className="ml-4">
                  <Text className="text-gray-500 text-sm">Date & Time</Text>
                  <Text className="text-gray-900 font-semibold">
                    {event?.date
                      ? format(
                          typeof event.date === "string"
                            ? parseISO(event.date)
                            : event.date,
                          "EEEE, MMMM dd, yyyy"
                        )
                      : "Date not set"}
                  </Text>
                  <Text className="text-gray-700">
                    {event?.time || "Time not set"}
                  </Text>
                </View>
              </View>
            </Card>

            <Card className="mb-3">
              <View className="flex-row items-center">
                <Ionicons name="location" size={28} color="#f37316" />
                <View className="ml-4 flex-1">
                  <Text className="text-gray-500 text-sm">Location</Text>
                  <Text className="text-gray-900 font-semibold">
                    {event?.venue?.name || "Venue not specified"}
                  </Text>
                  <Text className="text-gray-700">
                    {event?.venue?.address || ""}
                    {event?.venue?.address && event?.venue?.city ? ", " : ""}
                    {event?.venue?.city || ""}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleGetDirections}
                  className="bg-accent-100 px-3 py-1 rounded-lg justify-self-start"
                >
                  <Text className="text-accent-700 text-sm font-medium">
                    Get Directions
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>

            <Card className="mb-8 ">
              <View className="flex-row items-center">
                <Ionicons name="people" size={28} color="#10b981" />
                <View className="ml-4">
                  <Text className="text-gray-500 text-sm">Organizer</Text>
                  <Text className="text-gray-900 font-semibold">
                    {event?.organizer?.name || "Organizer not specified"}
                  </Text>
                </View>
              </View>
            </Card>
          </View>

          {/* Description */}
          <Card className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-3">
              About This Event
            </Text>
            <Text className="text-gray-700 leading-6">
              {event?.description || "No description available"}
            </Text>
          </Card>

          {/* Tags */}
          {(event?.tags?.length || 0) > 0 && (
            <Card className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-3">Tags</Text>
              <View className="flex-row flex-wrap gap-2">
                {event?.tags?.map((tag: string, index: number) => (
                  <View
                    key={index}
                    className="bg-gray-100 px-3 py-1 rounded-full"
                  >
                    <Text className="text-gray-600 text-sm">#{tag}</Text>
                  </View>
                ))}
              </View>
            </Card>
          )}

          {/* Availability */}
          <Card className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-3">
              Availability
            </Text>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-gray-500 text-sm">Tickets Available</Text>
                <Text className="text-gray-900 font-semibold">
                  {(event?.capacity || 0) - (event?.bookedCount || 0)} of{" "}
                  {event?.capacity || 0}
                </Text>
              </View>
              <View className="bg-green-100 px-3 py-1 rounded-full">
                <Text className="text-green-700 text-sm font-medium">
                  {Math.round(
                    (((event?.capacity || 0) - (event?.bookedCount || 0)) /
                      (event?.capacity || 1)) *
                      100
                  )}
                  % Available
                </Text>
              </View>
            </View>
          </Card>
        </View>
        <View className="bg-white border-t border-gray-100 px-5 py-4">
          <View className="flex-row items-center justify-between ml-4">
            <View>
              <Text className="text-gray-500 text-sm">Starting from</Text>
              <Text className="text-xl font-bold text-gray-900">
                {event?.isFree
                  ? "Free"
                  : `₹${event?.price?.min?.toLocaleString() || "0"}`}
              </Text>
            </View>

            <Button
              title="Book Now"
              onPress={handleBookNow}
              gradient
              size="lg"
              style={{
                flex: 1,
                marginLeft: 36,
                // width: "60%",
                // alignSelf: "center",
              }}
              disabled={
                (event?.capacity || 0) - (event?.bookedCount || 0) === 0
              }
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
    </SafeAreaView>
  );
};

export default React.memo(EventDetailsScreen);
