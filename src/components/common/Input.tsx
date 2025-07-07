import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  error?: string;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  multiline?: boolean;
  numberOfLines?: number;
}

export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  error,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  inputStyle,
  multiline = false,
  numberOfLines = 1,
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const getContainerClasses = () => {
    const baseClasses = "border rounded-xl px-4 py-3";
    const focusClasses = isFocused
      ? "border-primary-500 bg-primary-50"
      : "border-gray-300 bg-white";
    const errorClasses = error ? "border-red-500" : "";
    const disabledClasses = disabled ? "bg-gray-100 border-gray-200" : "";

    return `${baseClasses} ${focusClasses} ${errorClasses} ${disabledClasses}`;
  };

  const getInputClasses = () => {
    const baseClasses = "text-base text-gray-900 flex-1";
    const disabledClasses = disabled ? "text-gray-500" : "";

    return `${baseClasses} ${disabledClasses}`;
  };

  return (
    <View style={style}>
      {label && (
        <Text className="text-md font-medium text-gray-700 mb-2">{label}</Text>
      )}

      <View className={getContainerClasses()}>
        <View className="flex-row items-center">
          {leftIcon && <View className="mr-3">{leftIcon}</View>}

          <TextInput
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry && !isPasswordVisible}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            editable={!disabled}
            multiline={multiline}
            numberOfLines={numberOfLines}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={getInputClasses()}
            style={inputStyle}
            placeholderTextColor="#9ca3af"
          />

          {secureTextEntry && (
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              className="ml-3"
            >
              <Ionicons
                name={isPasswordVisible ? "eye-off" : "eye"}
                size={20}
                color="#6b7280"
              />
            </TouchableOpacity>
          )}

          {rightIcon && !secureTextEntry && (
            <View className="ml-3">{rightIcon}</View>
          )}
        </View>
      </View>

      {error && <Text className="text-sm text-red-500 mt-1">{error}</Text>}
    </View>
  );
}
