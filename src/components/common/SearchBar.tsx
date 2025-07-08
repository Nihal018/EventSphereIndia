import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSearch?: () => void;
  onFilter?: () => void;
  style?: ViewStyle;
  showFilter?: boolean;
  autoFocus?: boolean;
}

export default function SearchBar({
  placeholder = "Search events...",
  value,
  onChangeText,
  onSearch,
  onFilter,
  style,
  showFilter = true,
  autoFocus = false,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = () => {
    if (onSearch) {
      onSearch();
    }
  };

  const handleClear = () => {
    onChangeText("");
  };

  return (
    <View style={style} className="flex-row items-center space-x-3">
      {/* Search Input Container */}
      <View className="flex-1 flex-row items-center bg-white rounded-xl px-4 py-2 mt-4">
        <Ionicons name="search" size={20} color="#6b7280" className="mr-3" />

        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onSubmitEditing={handleSearch}
          autoFocus={autoFocus}
          returnKeyType="search"
          className="flex-1 text-base text-gray-900"
          placeholderTextColor="#9ca3af"
        />

        {value.length > 0 && (
          <TouchableOpacity onPress={handleClear} className="ml-2 p-1">
            <Ionicons name="close-circle" size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Button */}
      {showFilter && (
        <TouchableOpacity
          onPress={onFilter}
          className="bg-primary-500 rounded-xl p-3 ml-2 mt-4"
        >
          <Ionicons name="options" size={20} color="#ffffff" />
        </TouchableOpacity>
      )}
    </View>
  );
}
