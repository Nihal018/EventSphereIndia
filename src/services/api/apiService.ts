import { Platform } from "react-native";
import { Event, Booking, EventCategory } from "../../types";
import {
  API_CONFIG,
  getEndpointUrl,
  isLocalDevelopment,
} from "../../config/api";

// API Response types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface EventsResponse {
  events: Event[];
  count: number;
}

interface BookingsResponse {
  bookings: Booking[];
  upcomingBookings: Booking[];
  pastBookings: Booking[];
  totalBookings: number;
}

interface CreateBookingResponse {
  success: boolean;
  booking: Booking;
  message: string;
}

// HTTP Client with retry logic
class ApiClient {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = getEndpointUrl(endpoint);

    const defaultOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    const requestOptions = { ...defaultOptions, ...options };

    // In development mode with localhost, fail fast to avoid retry noise
    const isLocalhost = url.includes("localhost");
    const maxRetries =
      isLocalhost && API_CONFIG.CURRENT_ENV.ENABLE_MOCK_FALLBACK
        ? 1
        : API_CONFIG.REQUEST.RETRY_ATTEMPTS;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (API_CONFIG.CURRENT_ENV.LOG_API_CALLS) {
          console.log(`API Request (attempt ${attempt}):`, url, requestOptions);
        }

        const response = await fetch(url, requestOptions);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        if (API_CONFIG.CURRENT_ENV.LOG_API_CALLS) {
          console.log("API Response:", data);
        }

        return {
          success: true,
          data,
        };
      } catch (error) {
        const isNetworkError =
          error instanceof Error &&
          error.message.includes("Network request failed");

        // For localhost network failures, log less verbosely
        if (
          isLocalhost &&
          isNetworkError &&
          API_CONFIG.CURRENT_ENV.ENABLE_MOCK_FALLBACK
        ) {
          if (attempt === 1) {
            console.log("Local API unavailable, will use offline fallback");
          }
        } else {
          console.error(`API Error (attempt ${attempt}):`, error);
        }

        if (attempt === maxRetries) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Network error",
          };
        }

        // Skip delay for localhost network failures to fail fast
        if (!(isLocalhost && isNetworkError)) {
          await new Promise((resolve) =>
            setTimeout(resolve, API_CONFIG.REQUEST.RETRY_DELAY * attempt)
          );
        }
      }
    }

    return {
      success: false,
      error: "Max retry attempts reached",
    };
  }

  // GET request
  async get<T>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    let finalEndpoint = endpoint;

    if (params) {
      const url = new URL(`${API_CONFIG.AZURE_FUNCTIONS.BASE_URL}${endpoint}`);
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
      });
      finalEndpoint = endpoint + url.search;
    }

    return this.makeRequest(finalEndpoint, {
      method: "GET",
    });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest(endpoint, {
      method: "DELETE",
    });
  }
}

// API Service class
class EventSphereApiService {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient();
  }

  // Events API
  async getEvents(filters?: {
    category?: EventCategory;
    search?: string;
    city?: string;
  }): Promise<ApiResponse<EventsResponse>> {
    const params: Record<string, string> = {};

    if (filters?.category) params.category = filters.category;
    if (filters?.search) params.search = filters.search;
    if (filters?.city) params.city = filters.city;

    return this.client.get<EventsResponse>("/GetEvents", params);
  }

  async getEventById(eventId: string): Promise<ApiResponse<{ event: Event }>> {
    return this.client.get<{ event: Event }>(`/GetEventById?id=${eventId}`);
  }

  async getFeaturedEvents(): Promise<ApiResponse<EventsResponse>> {
    // You can add a specific endpoint for featured events
    // or filter from the main events endpoint
    return this.getEvents();
  }

  async searchEvents(query: string): Promise<ApiResponse<EventsResponse>> {
    return this.getEvents({ search: query });
  }

  async getEventsByCategory(
    category: EventCategory
  ): Promise<ApiResponse<EventsResponse>> {
    return this.getEvents({ category });
  }

  async getEventsByCity(city: string): Promise<ApiResponse<EventsResponse>> {
    return this.getEvents({ city });
  }

  // Bookings API
  async getUserBookings(
    userId: string
  ): Promise<ApiResponse<BookingsResponse>> {
    return this.client.get<BookingsResponse>(
      `/GetUserBookings?userId=${userId}`
    );
  }

  async createBooking(bookingData: {
    userId: string;
    eventId: string;
    quantity: number;
    userDetails: {
      name: string;
      email: string;
      phone: string;
    };
    ticketType?: "general" | "vip";
  }): Promise<ApiResponse<CreateBookingResponse>> {
    return this.client.post<CreateBookingResponse>(
      "/CreateBooking",
      bookingData
    );
  }

  // Utility methods
  async checkApiHealth(): Promise<
    ApiResponse<{ status: string; timestamp: string }>
  > {
    return this.client.get<{ status: string; timestamp: string }>("/health");
  }

  // Update the base URL (useful for switching between environments)
  updateBaseUrl(newBaseUrl: string): void {
    // This would require restructuring the API_CONFIG to be mutable
    console.log("Base URL update requested:", newBaseUrl);
  }
}

// Offline fallback with mock data
class OfflineApiService {
  // Import mock data when offline
  private async getMockEvents(): Promise<Event[]> {
    const { mockEvents } = await import("../../data/mockData");
    return mockEvents;
  }

  async getEvents(filters?: {
    category?: EventCategory;
    search?: string;
    city?: string;
  }): Promise<ApiResponse<EventsResponse>> {
    try {
      let events = await this.getMockEvents();

      // Apply filters
      if (filters?.category) {
        events = events.filter((event) => event.category === filters.category);
      }

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        events = events.filter(
          (event) =>
            event.title.toLowerCase().includes(searchLower) ||
            event.description.toLowerCase().includes(searchLower) ||
            event.venue.city.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.city) {
        events = events.filter(
          (event) =>
            event.venue.city.toLowerCase() === filters.city!.toLowerCase()
        );
      }

      return {
        success: true,
        data: {
          events,
          count: events.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to load offline data",
      };
    }
  }

  async getEventById(eventId: string): Promise<ApiResponse<{ event: Event }>> {
    try {
      const events = await this.getMockEvents();
      const event = events.find((e) => e.id === eventId);

      if (!event) {
        return {
          success: false,
          error: "Event not found",
        };
      }

      return {
        success: true,
        data: { event },
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to load offline data",
      };
    }
  }

  async createBooking(): Promise<ApiResponse<CreateBookingResponse>> {
    return {
      success: false,
      error: "Booking creation not available offline",
    };
  }

  async getUserBookings(): Promise<ApiResponse<BookingsResponse>> {
    return {
      success: false,
      error: "User bookings not available offline",
    };
  }
}

// Main API service with online/offline detection
class EventSphereApi {
  private onlineService: EventSphereApiService;
  private offlineService: OfflineApiService;
  private isOnline: boolean = true;

  constructor() {
    this.onlineService = new EventSphereApiService();
    this.offlineService = new OfflineApiService();

    // Set up network status monitoring
    this.setupNetworkMonitoring();
  }

  private setupNetworkMonitoring(): void {
    // For React Native, you would use @react-native-community/netinfo
    // For now, we'll assume online and fallback on errors
    this.isOnline = true;
  }

  private async withFallback<T>(
    onlineOperation: () => Promise<ApiResponse<T>>,
    offlineOperation?: () => Promise<ApiResponse<T>>
  ): Promise<ApiResponse<T>> {
    if (!this.isOnline && offlineOperation) {
      if (API_CONFIG.CURRENT_ENV.ENABLE_LOGGING) {
        console.log("Using offline mode");
      }
      return offlineOperation();
    }

    const result = await onlineOperation();

    // If online operation fails and we have offline fallback
    if (!result.success && offlineOperation) {
      if (API_CONFIG.CURRENT_ENV.ENABLE_LOGGING) {
        console.log("API unavailable, using offline fallback");
      }
      this.isOnline = false;
      return offlineOperation();
    }

    return result;
  }

  // Public API methods
  async getEvents(filters?: {
    category?: EventCategory;
    search?: string;
    city?: string;
  }): Promise<ApiResponse<EventsResponse>> {
    return this.withFallback(
      () => this.onlineService.getEvents(filters),
      () => this.offlineService.getEvents(filters)
    );
  }

  async getEventById(eventId: string): Promise<ApiResponse<{ event: Event }>> {
    return this.withFallback(
      () => this.onlineService.getEventById(eventId),
      () => this.offlineService.getEventById(eventId)
    );
  }

  async getFeaturedEvents(): Promise<ApiResponse<EventsResponse>> {
    return this.withFallback(
      () => this.onlineService.getFeaturedEvents(),
      () => this.offlineService.getEvents()
    );
  }

  async searchEvents(query: string): Promise<ApiResponse<EventsResponse>> {
    return this.withFallback(
      () => this.onlineService.searchEvents(query),
      () => this.offlineService.getEvents({ search: query })
    );
  }

  async getEventsByCategory(
    category: EventCategory
  ): Promise<ApiResponse<EventsResponse>> {
    return this.withFallback(
      () => this.onlineService.getEventsByCategory(category),
      () => this.offlineService.getEvents({ category })
    );
  }

  async getEventsByCity(city: string): Promise<ApiResponse<EventsResponse>> {
    return this.withFallback(
      () => this.onlineService.getEventsByCity(city),
      () => this.offlineService.getEvents({ city })
    );
  }

  async getUserBookings(
    userId: string
  ): Promise<ApiResponse<BookingsResponse>> {
    return this.withFallback(
      () => this.onlineService.getUserBookings(userId),
      () => this.offlineService.getUserBookings()
    );
  }

  async createBooking(bookingData: {
    userId: string;
    eventId: string;
    quantity: number;
    userDetails: {
      name: string;
      email: string;
      phone: string;
    };
    ticketType?: "general" | "vip";
  }): Promise<ApiResponse<CreateBookingResponse>> {
    // Booking creation should only work online
    return this.onlineService.createBooking(bookingData);
  }

  // Utility methods
  setOnlineStatus(status: boolean): void {
    this.isOnline = status;
  }

  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  async checkApiHealth(): Promise<
    ApiResponse<{ status: string; timestamp: string }>
  > {
    return this.onlineService.checkApiHealth();
  }
}

// Export singleton instance
export const apiService = new EventSphereApi();

// Export types for use in contexts
export type {
  ApiResponse,
  EventsResponse,
  BookingsResponse,
  CreateBookingResponse,
};
