import React from "react";
import { InteractionManager } from "react-native";
// @ts-ignore - For React Native's internal unstable_batchedUpdates
import * as ReactNative from "react-native";

/**
 * Utility to defer expensive operations until after interactions complete
 */
export const runAfterInteractions = (callback: () => void): void => {
  InteractionManager.runAfterInteractions(callback);
};

/**
 * Debounce function for search inputs
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function for scroll events
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Lazy component loader
 */
export const lazy = <T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> => {
  return React.lazy(factory);
};

/**
 * Image cache utility
 */
export const preloadImage = (uri: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = reject;
    image.src = uri;
  });
};

/**
 * Memory usage monitoring (development only)
 */
export const logMemoryUsage = (): void => {
  if (__DEV__) {
    // @ts-ignore
    if (global.performance && global.performance.memory) {
      // @ts-ignore
      const memory = global.performance.memory;
      console.log("Memory Usage:", {
        used: `${Math.round(memory.usedJSHeapSize / 1048576)} MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1048576)} MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)} MB`,
      });
    }
  }
};

/**
 * Performance marker for measuring render times
 */
export const measureRender = (componentName: string) => {
  if (__DEV__) {
    const startTime = Date.now();

    return {
      end: () => {
        const endTime = Date.now();
        console.log(`${componentName} render time: ${endTime - startTime}ms`);
      },
    };
  }

  return { end: () => {} };
};

/**
 * Batch updates for better performance
 */
export const batchUpdates = (callback: () => void): void => {
  // Use React's unstable_batchedUpdates for better performance
  try {
    if (
      typeof ReactNative !== "undefined" &&
      (ReactNative as any).unstable_batchedUpdates
    ) {
      (ReactNative as any).unstable_batchedUpdates(callback);
    } else {
      callback();
    }
  } catch (error) {
    // Fallback if unstable_batchedUpdates is not available
    callback();
  }
};

/**
 * Virtualization helpers
 */
export const getItemLayout =
  (itemHeight: number) => (data: any[] | null | undefined, index: number) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  });

/**
 * Optimize images for better performance
 */
export const optimizeImageUri = (
  uri: string,
  width: number,
  height: number
): string => {
  // Add image optimization parameters if using a CDN
  // This is a placeholder - implement based on your image service
  return `${uri}?w=${width}&h=${height}&fit=cover&auto=format`;
};
