import React, { memo, useCallback } from "react";
import {
  FlatList,
  View,
  Text,
  RefreshControl,
  ViewStyle,
  ListRenderItem,
  Dimensions, // Import Dimensions for dynamic width calculation
} from "react-native";
import { Event } from "../../types";
import EventCard from "./EventCard"; // Make sure EventCard can adapt its width
import LoadingSpinner from "../common/LoadingSpinner";

const { width: screenWidth } = Dimensions.get("window");

interface EventListProps {
  events: Event[];
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  onEventPress: (event: Event) => void;
  onLike?: (eventId: string) => void;
  isLiked?: (eventId: string) => boolean;
  style?: ViewStyle;
  variant?: "default" | "featured" | "compact";
  horizontal?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  numColumns?: number; // Can be 1, 2, 3, etc.
  emptyMessage?: string;
  // New prop for horizontal spacing between grid items
  itemHorizontalSpacing?: number;
  // New prop for vertical spacing between grid items
  itemVerticalSpacing?: number;
}

const EventList = memo<EventListProps>(
  ({
    events,
    loading = false,
    refreshing = false,
    onRefresh,
    onLoadMore,
    onEventPress,
    onLike,
    isLiked,
    style,
    variant = "default",
    horizontal = false,
    showsHorizontalScrollIndicator = false,
    numColumns = 1, // Default to 1
    emptyMessage = "No events found",
    itemHorizontalSpacing = 16, // Default spacing between columns
    itemVerticalSpacing = 16, // Default spacing between rows
  }) => {
    // Determine the effective number of columns
    const effectiveNumColumns = horizontal ? 1 : numColumns;

    // Calculate item width for grid columns
    const calculateGridItemWidth = useCallback(() => {
      if (horizontal) {
        // For horizontal lists, fixed width based on variant makes sense
        return variant === "featured" ? 260 : 200;
      }

      // For vertical grid:
      // screenWidth is the total width available
      // We subtract padding for the FlatList itself (e.g., if you have global screen padding)
      // and total spacing between columns.
      // Example: For 2 columns, there's 1 `itemHorizontalSpacing` in between items.
      // For 3 columns, there are 2 `itemHorizontalSpacing` in between items.
      // General formula: (numColumns - 1) * itemHorizontalSpacing

      const containerPadding = 20; // Assuming global screen padding or padding you want around the grid
      const totalSpacing = (effectiveNumColumns - 1) * itemHorizontalSpacing;
      const availableWidth = screenWidth - 2 * containerPadding - totalSpacing;
      return availableWidth / effectiveNumColumns;
    }, [horizontal, variant, effectiveNumColumns, itemHorizontalSpacing]);

    const renderEventCard: ListRenderItem<Event> = useCallback(
      ({ item, index }) => {
        const itemWidth = calculateGridItemWidth();

        // Adjust margin for grid items to avoid right/bottom margin on last items
        const isLastColumn = (index + 1) % effectiveNumColumns === 0;
        const isLastRow =
          Math.ceil((index + 1) / effectiveNumColumns) ===
          Math.ceil(events.length / effectiveNumColumns);

        return (
          <EventCard
            event={item}
            onPress={onEventPress}
            onLike={onLike}
            isLiked={isLiked?.(item.id)}
            variant={variant}
            style={{
              width: horizontal ? itemWidth : itemWidth, // Explicitly set width for grid
              // height: horizontal ? 200 : "auto",
              marginBottom:
                isLastRow && effectiveNumColumns > 1 ? 36 : itemVerticalSpacing,
              marginRight:
                horizontal || isLastColumn ? 20 : itemHorizontalSpacing,
            }}
          />
        );
      },
      [
        events.length, // Add events.length to dependencies for last row calculation
        variant,
        horizontal,
        onEventPress,
        onLike,
        isLiked,
        calculateGridItemWidth,
        effectiveNumColumns,
        itemVerticalSpacing,
        itemHorizontalSpacing,
      ]
    );

    const renderEmptyState = useCallback(() => {
      if (loading) {
        return (
          <View className="flex-1 justify-center items-center py-20">
            <LoadingSpinner text="Loading events..." />
          </View>
        );
      }

      return (
        <View className="flex-1 justify-center items-center py-20">
          <Text className="text-gray-500 text-lg font-medium mb-2">
            {emptyMessage}
          </Text>
          <Text className="text-gray-400 text-center px-8">
            Try adjusting your search or filter criteria
          </Text>
        </View>
      );
    }, [loading, emptyMessage]);

    const renderFooter = useCallback(() => {
      if (!loading || events.length === 0) return null;

      return (
        <View className="py-4">
          <LoadingSpinner size="small" text="Loading more..." />
        </View>
      );
    }, [loading, events.length]);

    const keyExtractor = useCallback((item: Event) => item.id, []);

    // columnWrapperStyle for grid layout
    const columnWrapperStyle =
      effectiveNumColumns > 1
        ? {
            justifyContent: "space-between" as "space-between",
            marginBottom: itemVerticalSpacing,
          }
        : undefined;

    return (
      <FlatList
        data={events}
        renderItem={renderEventCard}
        keyExtractor={keyExtractor}
        // getItemLayout removed for simplicity, less critical for basic grids
        style={style}
        horizontal={horizontal}
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        showsVerticalScrollIndicator={!horizontal}
        numColumns={effectiveNumColumns} // Use the effective number of columns
        contentContainerStyle={{
          // Apply horizontal padding here for the FlatList itself
          paddingHorizontal: 20, // Example padding for the entire grid
          paddingBottom: 2,
          marginBottom: effectiveNumColumns > 1 ? 0 : 0,
          // Add flexGrow: 1 and justifyContent: 'center' for ListEmptyComponent to center correctly
          flexGrow: 1,
        }}
        columnWrapperStyle={columnWrapperStyle} // Apply the column wrapper style here
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#0ea5e9"]}
              tintColor="#0ea5e9"
            />
          ) : undefined
        }
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        removeClippedSubviews={true} // Good for performance
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
        // maintainVisibleContentPosition generally not needed for vertical grids unless specific case
        maintainVisibleContentPosition={undefined}
      />
    );
  }
);

EventList.displayName = "EventList";

export default EventList;
