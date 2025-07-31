import { Platform } from 'react-native';

// Azure Configuration for EventSphere India
export const azureConfig = {
  // Microsoft Entra External ID Configuration
  auth: {
    clientId: "870b0873-635d-4094-8266-4489abfe5493", // Replace with your External ID app registration client ID
    authority:
      "https://eventsphereindia.b2clogin.com/eventsphereindia.onmicrosoft.com/signupsignin",
  },
  cache: {
    cacheLocation: "sessionStorage",
  },
  // API Configuration
  api: {
    baseUrl: "https://eventsphereindia-api.azurewebsites.net",
    scopes: ["https://graph.microsoft.com/User.Read"],
  },
};

// MSAL Configuration for React Native
export const msalConfig = {
  auth: {
    clientId: azureConfig.auth.clientId,
    authority: azureConfig.auth.authority,
    // Add redirect URI for web
    ...(Platform.OS === 'web' && {
      redirectUri: 'http://localhost:8084', // Development redirect URI
    }),
  },
  ...(Platform.OS === 'web' && {
    cache: {
      cacheLocation: "sessionStorage",
      storeAuthStateInCookie: false,
    },
  }),
};

// Web-specific MSAL Configuration
export const webMsalConfig = {
  auth: {
    clientId: azureConfig.auth.clientId,
    authority: azureConfig.auth.authority,
    redirectUri: 'http://localhost:8084',
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

// Request configuration for different scenarios
export const loginRequest = {
  scopes: ["openid", "profile", "email"],
};

export const tokenRequest = {
  scopes: ["User.Read"],
  forceRefresh: false,
};
