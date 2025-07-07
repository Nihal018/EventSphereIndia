import { AccessibilityInfo } from "react-native";

/**
 * Check if screen reader is enabled
 */
export const isScreenReaderEnabled = (): Promise<boolean> => {
  return AccessibilityInfo.isScreenReaderEnabled();
};

/**
 * Announce message to screen reader
 */
export const announceForAccessibility = (message: string): void => {
  AccessibilityInfo.announceForAccessibility(message);
};

/**
 * Set accessibility focus
 */
export const setAccessibilityFocus = (reactTag: number): void => {
  AccessibilityInfo.setAccessibilityFocus(reactTag);
};

/**
 * Generate accessibility label for events
 */
export const generateEventAccessibilityLabel = (event: {
  title: string;
  date: Date;
  venue: { name: string; city: string };
  price: { min: number; max: number };
  isFree: boolean;
}): string => {
  const dateStr = event.date.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const priceStr = event.isFree
    ? "Free event"
    : `Starting from ${event.price.min} rupees`;

  return `${event.title}, ${dateStr}, at ${event.venue.name}, ${event.venue.city}, ${priceStr}`;
};

/**
 * Generate accessibility hint for buttons
 */
export const generateButtonAccessibilityHint = (action: string): string => {
  return `Double tap to ${action}`;
};

/**
 * Accessibility roles for different components
 */
export const AccessibilityRoles = {
  BUTTON: "button" as const,
  LINK: "link" as const,
  IMAGE: "image" as const,
  TEXT: "text" as const,
  HEADER: "header" as const,
  SEARCH: "search" as const,
  TAB: "tab" as const,
  TABLIST: "tablist" as const,
  LIST: "list" as const,
  LISTITEM: "listitem" as const,
} as const;

/**
 * Common accessibility states
 */
export const AccessibilityStates = {
  SELECTED: { selected: true },
  DISABLED: { disabled: true },
  EXPANDED: { expanded: true },
  COLLAPSED: { expanded: false },
  CHECKED: { checked: true },
  UNCHECKED: { checked: false },
} as const;

/**
 * Accessibility traits for iOS
 */
export const AccessibilityTraits = {
  BUTTON: ["button"] as const,
  LINK: ["link"] as const,
  HEADER: ["header"] as const,
  SEARCH_FIELD: ["search"] as const,
  SELECTED: ["selected"] as const,
  DISABLED: ["disabled"] as const,
  PLAYS_SOUND: ["playsSound"] as const,
  STARTS_MEDIA: ["startsMediaSession"] as const,
} as const;

/**
 * Generate accessibility props for touchable elements
 */
export const generateTouchableAccessibilityProps = (
  label: string,
  hint?: string,
  role: keyof typeof AccessibilityRoles = "BUTTON"
) => ({
  accessible: true,
  accessibilityLabel: label,
  accessibilityHint: hint,
  accessibilityRole: AccessibilityRoles[role],
});

/**
 * Generate accessibility props for images
 */
export const generateImageAccessibilityProps = (
  altText: string,
  decorative: boolean = false
) => ({
  accessible: !decorative,
  accessibilityLabel: decorative ? undefined : altText,
  accessibilityRole: AccessibilityRoles.IMAGE,
});

/**
 * Generate accessibility props for text elements
 */
export const generateTextAccessibilityProps = (
  text: string,
  isHeader: boolean = false
) => ({
  accessible: true,
  accessibilityLabel: text,
  accessibilityRole: isHeader
    ? AccessibilityRoles.HEADER
    : AccessibilityRoles.TEXT,
});

/**
 * Check if reduce motion is enabled
 */
export const isReduceMotionEnabled = (): Promise<boolean> => {
  return AccessibilityInfo.isReduceMotionEnabled();
};

/**
 * Check if reduce transparency is enabled
 */
export const isReduceTransparencyEnabled = (): Promise<boolean> => {
  return AccessibilityInfo.isReduceTransparencyEnabled();
};

/**
 * Format currency for accessibility
 */
export const formatCurrencyForAccessibility = (amount: number): string => {
  return `${amount} rupees`;
};

/**
 * Format date for accessibility
 */
export const formatDateForAccessibility = (date: Date): string => {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format time for accessibility
 */
export const formatTimeForAccessibility = (time: string): string => {
  // Convert 24-hour to 12-hour format with AM/PM
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minutes} ${ampm}`;
};
