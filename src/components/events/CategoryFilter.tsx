import React from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EventCategory } from "../../types";

interface CategoryFilterProps {
  categories: EventCategory[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  style?: ViewStyle;
  showAllOption?: boolean;
}

const categoryIcons: Record<EventCategory, keyof typeof Ionicons.glyphMap> = {
  Music: "musical-notes",
  Technology: "laptop",
  Business: "briefcase",
  Arts: "color-palette",
  Sports: "football",
  Food: "restaurant",
  Health: "fitness",
  Education: "school",
  Entertainment: "film",
  Comedy: "happy",
  Theatre: "musical-notes", // replaced with a valid Ionicons icon name
  Workshop: "construct",
};

export default function CategoryFilter({
  categories,
  selectedCategory,
  onCategorySelect,
  style,
  showAllOption = true,
}: CategoryFilterProps) {
  const handleCategoryPress = (category: string | null) => {
    onCategorySelect(category);
  };

  const CategoryChip = ({
    category,
    isSelected,
  }: {
    category: string | null;
    isSelected: boolean;
  }) => {
    const displayText = category || "All";
    const iconName = category
      ? categoryIcons[category as EventCategory]
      : "apps";

    return (
      <TouchableOpacity
        onPress={() => handleCategoryPress(category)}
        className={`flex-row items-center px-4 py-2 rounded-full mr-3 ${
          isSelected ? "bg-primary-500" : "bg-gray-100 border border-gray-200"
        }`}
      >
        <Ionicons
          name={iconName}
          size={16}
          color={isSelected ? "#ffffff" : "#6b7280"}
          style={{ marginRight: 6 }}
        />
        <Text
          className={`text-sm font-medium ${
            isSelected ? "text-white" : "text-gray-600"
          }`}
        >
          {displayText}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={style}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 10,
        }}
      >
        {showAllOption && (
          <CategoryChip
            category={null}
            isSelected={selectedCategory === null}
          />
        )}

        {categories.map((category) => (
          <CategoryChip
            key={category}
            category={category}
            isSelected={selectedCategory === category}
          />
        ))}
      </ScrollView>
    </View>
  );
}
