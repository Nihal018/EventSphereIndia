import React, { memo, useCallback, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Modal from "react-native-modal";
import Button from "./Button"; // Assuming Button component path
import { EventCategory } from "../../types"; // Assuming types path

interface FilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  onApply: (category: EventCategory | null, city: string | null) => void;
  onClearAll: () => void; // Callback for clearing all filters

  // Data for filter options
  categories: EventCategory[];
  cities: string[];
}

const FilterModal = memo<FilterModalProps>(
  ({ isVisible, onClose, onApply, onClearAll, categories, cities }) => {
    const [sCity, setSCity] = useState<string | null>("");
    const [sCategory, setSCategory] = useState<EventCategory | null>(null);
    // Handle apply button click
    const handleApply = useCallback(() => {
      onApply(sCategory, sCity); // Pass current local selections to parent
      onClose(); // Close the modal
    }, [onApply, sCategory, sCity, onClose]);

    // Handle clear all button click
    const handleClearAll = useCallback(() => {
      setSCategory(null); // Clear local category
      setSCity(null); // Clear local city
      onClearAll(); // Trigger parent's clear filters (which will update global state)
      onClose(); // Close the modal
    }, [setSCategory, setSCity, onClearAll, onClose]);

    return (
      <Modal
        isVisible={isVisible}
        onBackdropPress={onClose} // Close on backdrop press
        style={{ margin: 0, justifyContent: "flex-end" }}
        // Optional: Add animation timing if needed, though default is usually fine
        // animationIn="slideInUp"
        // animationOut="slideOutDown"
        // animationInTiming={300}
        // animationOutTiming={300}
        // backdropTransitionInTiming={300}
        // backdropTransitionOutTiming={300}
      >
        <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold">Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Category Filter Section */}
            <View className="mb-6">
              <Text className="text-lg font-semibold mb-3">Category</Text>
              <View className="flex-row flex-wrap gap-2">
                <TouchableOpacity
                  onPress={() => setSCategory(null)}
                  className={`px-4 py-2 rounded-full border ${
                    !sCategory
                      ? "bg-primary-500 border-primary-500"
                      : "border-gray-300"
                  }`}
                >
                  <Text className={!sCategory ? "text-white" : "text-gray-600"}>
                    All
                  </Text>
                </TouchableOpacity>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setSCategory(category)}
                    className={`px-4 py-2 rounded-full border ${
                      sCategory === category
                        ? "bg-primary-500 border-primary-500"
                        : "border-gray-300"
                    }`}
                  >
                    <Text
                      className={
                        sCategory === category ? "text-white" : "text-gray-600"
                      }
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* City Filter Section */}
            <View className="mb-6">
              <Text className="text-lg font-semibold mb-3">City</Text>
              <View className="flex-row flex-wrap gap-2">
                <TouchableOpacity
                  onPress={() => setSCity(null)}
                  className={`px-4 py-2 rounded-full border ${
                    !sCity
                      ? "bg-primary-500 border-primary-500"
                      : "border-gray-300"
                  }`}
                >
                  <Text className={!sCity ? "text-white" : "text-gray-600"}>
                    All Cities
                  </Text>
                </TouchableOpacity>
                {cities.map((city) => (
                  <TouchableOpacity
                    key={city}
                    onPress={() => setSCity(city)}
                    className={`px-4 py-2 rounded-full border ${
                      sCity === city
                        ? "bg-primary-500 border-primary-500"
                        : "border-gray-300"
                    }`}
                  >
                    <Text
                      className={
                        sCity === city ? "text-white" : "text-gray-600"
                      }
                    >
                      {city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View className="flex-row space-x-3 mt-4">
            <Button
              title="Clear All"
              onPress={handleClearAll} // Use local handler
              variant="outline"
              style={{ flex: 1 }}
            />
            <Button
              title="Apply"
              onPress={handleApply} // Use local handler
              gradient
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </Modal>
    );
  }
);

FilterModal.displayName = "FilterModal";

export default FilterModal;
