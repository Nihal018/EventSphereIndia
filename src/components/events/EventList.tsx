import React, { memo, useCallback } from "react";
import {
  FlatList,
  View,
  Text,
  RefreshControl,
  ViewStyle,
  ListRenderItem,
} from "react-native";
import { Event } from "../../types";
import EventCard from "./EventCard";
import LoadingSpinner from "../common/LoadingSpinner";

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
  numColumns?: number;
  emptyMessage?: string;
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
    numColumns = 1,
    emptyMessage = "No events found",
  }) => {
    const renderEventCard: ListRenderItem<Event> = useCallback(
      ({ item }) => (
        <EventCard
          event={item}
          onPress={onEventPress}
          onLike={onLike}
          isLiked={isLiked?.(item.id)}
          variant={variant}
          style={horizontal ? { marginRight: 16 } : undefined}
        />
      ),
      [variant, horizontal, onEventPress, onLike, isLiked]
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

    const getItemLayout = useCallback(
      (data: ArrayLike<Event> | null | undefined, index: number) => {
        if (horizontal) {
          const itemWidth = variant === "featured" ? 280 : 200;
          return { length: itemWidth, offset: itemWidth * index, index };
        }
        return { length: 200, offset: 200 * index, index }; // Approximate height
      },
      [horizontal, variant]
    );

    return (
      <FlatList
        data={events}
        renderItem={renderEventCard}
        keyExtractor={keyExtractor}
        getItemLayout={horizontal ? getItemLayout : undefined}
        style={style}
        horizontal={horizontal}
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        showsVerticalScrollIndicator={!horizontal}
        numColumns={horizontal ? 1 : numColumns}
        contentContainerStyle={{
          paddingHorizontal: horizontal ? 20 : 0,
          paddingBottom: horizontal ? 0 : 20,
        }}
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
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
        maintainVisibleContentPosition={
          horizontal
            ? {
                minIndexForVisible: 0,
                autoscrollToTopThreshold: 100,
              }
            : undefined
        }
      />
    );
  }
);

EventList.displayName = "EventList";

export default EventList;
