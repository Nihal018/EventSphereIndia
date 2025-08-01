// API Configuration for EventSphere India
export const API_CONFIG = {
  // Azure Functions Configuration
  AZURE_FUNCTIONS: {
    // Local development URL (when running Azure Functions locally)
    LOCAL_URL: "http://localhost:7071/api",

    // Production Azure Functions URL
    PRODUCTION_URL: "https://eventsphereindia-api.azurewebsites.net/api",

    // Current environment URL
    get BASE_URL() {
      return this.PRODUCTION_URL;
    },
  },

  // Request Configuration
  REQUEST: {
    TIMEOUT: 10000, // 10 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second base delay
  },

  // Azure Cosmos DB Configuration (if needed for direct calls)
  COSMOS_DB: {
    DATABASE_NAME: "EventSphereDB",
    CONTAINERS: {
      EVENTS: "EventsAndUsers",
      BOOKINGS: "Bookings",
    },
  },

  // API Endpoints
  ENDPOINTS: {
    // Events
    GET_EVENTS: "/GetEvents",
    GET_EVENT_BY_ID: "/GetEventById",

    // Bookings
    CREATE_BOOKING: "/CreateBooking",
    GET_USER_BOOKINGS: "/GetUserBookings",
    CANCEL_BOOKING: "/CancelBooking",
    GET_BOOKING_BY_ID: "/GetBookingById",

    // Health check (if you add one)
    HEALTH: "/health",
  },

  // Environment-specific settings
  DEVELOPMENT: {
    ENABLE_LOGGING: true,
    ENABLE_MOCK_FALLBACK: true,
    LOG_API_CALLS: true,
  },

  PRODUCTION: {
    ENABLE_LOGGING: false,
    ENABLE_MOCK_FALLBACK: false,
    LOG_API_CALLS: false,
  },

  // Current environment settings
  get CURRENT_ENV() {
    return __DEV__ ? this.DEVELOPMENT : this.PRODUCTION;
  },
};

// Helper function to get full endpoint URL
export const getEndpointUrl = (endpoint: string): string => {
  return `${API_CONFIG.AZURE_FUNCTIONS.BASE_URL}${endpoint}`;
};

// Helper function to update production URL (useful for deployment)
export const updateProductionUrl = (newUrl: string): void => {
  API_CONFIG.AZURE_FUNCTIONS.PRODUCTION_URL = newUrl;
  console.log("Production URL updated to:", newUrl);
};

// Export specific URLs for easy access
export const AZURE_FUNCTION_URLS = {
  GET_EVENTS: getEndpointUrl(API_CONFIG.ENDPOINTS.GET_EVENTS),
  GET_EVENT_BY_ID: getEndpointUrl(API_CONFIG.ENDPOINTS.GET_EVENT_BY_ID),
  CREATE_BOOKING: getEndpointUrl(API_CONFIG.ENDPOINTS.CREATE_BOOKING),
  GET_USER_BOOKINGS: getEndpointUrl(API_CONFIG.ENDPOINTS.GET_USER_BOOKINGS),
  CANCEL_BOOKING: getEndpointUrl(API_CONFIG.ENDPOINTS.CANCEL_BOOKING),
  GET_BOOKING_BY_ID: getEndpointUrl(API_CONFIG.ENDPOINTS.GET_BOOKING_BY_ID),
  HEALTH: getEndpointUrl(API_CONFIG.ENDPOINTS.HEALTH),
};

// Environment check helper
export const isLocalDevelopment = (): boolean => {
  return (
    __DEV__ &&
    API_CONFIG.AZURE_FUNCTIONS.BASE_URL === API_CONFIG.AZURE_FUNCTIONS.LOCAL_URL
  );
};

export const isProduction = (): boolean => {
  return !__DEV__;
};

// Configuration validation
export const validateApiConfig = (): { valid: boolean; issues: string[] } => {
  const issues: string[] = [];

  if (
    !API_CONFIG.AZURE_FUNCTIONS.PRODUCTION_URL.includes("azurewebsites.net")
  ) {
    issues.push(
      "Production URL should point to Azure Functions (.azurewebsites.net)"
    );
  }

  if (API_CONFIG.REQUEST.TIMEOUT < 5000) {
    issues.push("Timeout should be at least 5 seconds for Azure Functions");
  }

  if (API_CONFIG.REQUEST.RETRY_ATTEMPTS < 1) {
    issues.push("Should have at least 1 retry attempt");
  }

  return {
    valid: issues.length === 0,
    issues,
  };
};
