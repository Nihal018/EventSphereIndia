# Microsoft Entra External ID Setup for EventSphere India

## Overview

This guide walks you through setting up Microsoft Entra External ID for EventSphere India mobile app authentication.

## Prerequisites

- Azure subscription with active credits
- Existing EventSphere Azure resources (Function App, Cosmos DB, etc.)

## Step 1: Create External ID Tenant

1. **Navigate to Azure Portal**

   - Go to [Azure Portal](https://portal.azure.com)
   - Search for "Microsoft Entra External ID"

2. **Create New Tenant**

   - Click "Create a tenant"
   - Select "External identities" tenant type
   - Choose tenant name: `eventsphereindia`
   - Select region: `Central India` (same as your existing resources)
   - Complete creation (takes 2-3 minutes)

3. **Switch to New Tenant**
   - Use the directory switcher to switch to your new External ID tenant
   - URL will be: `https://eventsphereindia.ciamlogin.com/`

## Step 2: Register Mobile Application

1. **Navigate to App Registrations**

   - In your External ID tenant, go to "App registrations"
   - Click "New registration"

2. **Configure App Registration**

   - **Name**: `EventSphere India Mobile`
   - **Supported account types**: "Accounts in any identity provider or organizational directory (for authenticating users with user flows)"
   - **Redirect URI**:
     - Platform: `Public client (mobile & desktop)`
     - URI: `msauth://com.yourcompany.eventsphereindia/callback`
   - Click "Register"

3. **Note Application Details**
   - Copy the **Application (client) ID** - you'll need this
   - Copy the **Directory (tenant) ID**

## Step 3: Configure Authentication

1. **Add Redirect URIs**

   - Go to "Authentication" in your app registration
   - Add additional redirect URIs:
     - `msauth://com.yourcompany.eventsphereindia/callback`
     - `msauth://bundle.id.eventsphereindia/callback` (iOS)
   - Enable "Allow public client flows"

2. **Configure API Permissions**
   - Go to "API permissions"
   - Ensure these permissions are granted:
     - `openid` (sign users in)
     - `profile` (view users' basic profile)
     - `email` (view users' email address)

## Step 4: Set Up User Flows

1. **Create Sign-up/Sign-in User Flow**

   - Go to "User flows" in the External ID tenant
   - Click "New user flow"
   - Select "Sign up and sign in"
   - Choose "Recommended" version
   - Name: `B2C_1_signupsignin`

2. **Configure Identity Providers**

   - Select "Email signup" for local accounts
   - Optional: Add social providers (Google, Facebook, etc.)

3. **Configure User Attributes**
   - **Collect**: Display Name, Email Address
   - **Return**: Display Name, Email Addresses, User's Object ID
   - Save the user flow

## Step 5: Update Mobile App Configuration

1. **Update Azure Config File**

   ```typescript
   // src/config/azure.ts - Replace YOUR_CLIENT_ID with actual client ID from Step 2
   export const azureConfig = {
     auth: {
       clientId: "YOUR_CLIENT_ID_FROM_STEP_2", // Application (client) ID
       authority:
         "https://eventsphereindia.b2clogin.com/eventsphereindia.onmicrosoft.com/B2C_1_signupsignin",
     },
     cache: {
       cacheLocation: "sessionStorage",
     },
     api: {
       baseUrl: "https://eventsphereindia-api.azurewebsites.net",
       scopes: ["https://graph.microsoft.com/User.Read"],
     },
   };

   export const msalConfig = {
     auth: {
       clientId: azureConfig.auth.clientId,
       authority: azureConfig.auth.authority,
     },
   };

   export const loginRequest = {
     scopes: ["openid", "profile", "email"],
   };

   export const tokenRequest = {
     scopes: ["User.Read"],
     forceRefresh: false,
   };
   ```

2. **iOS Configuration (ios/EventSphereIndia/Info.plist)**

   ```xml
   <key>CFBundleURLTypes</key>
   <array>
     <dict>
       <key>CFBundleURLName</key>
       <string>com.yourcompany.eventsphereindia</string>
       <key>CFBundleURLSchemes</key>
       <array>
         <string>msauth.com.yourcompany.eventsphereindia</string>
       </array>
     </dict>
   </array>
   ```

3. **Android Configuration (android/app/src/main/AndroidManifest.xml)**
   ```xml
   <activity
     android:name="com.microsoft.identity.client.BrowserTabActivity">
     <intent-filter>
       <action android:name="android.intent.action.VIEW" />
       <category android:name="android.intent.category.DEFAULT" />
       <category android:name="android.intent.category.BROWSABLE" />
       <data android:scheme="msauth"
             android:host="com.yourcompany.eventsphereindia"
             android:path="/callback" />
     </intent-filter>
   </activity>
   ```

## Step 6: Test Authentication

1. **Build and Run the App**

   ```bash
   npx expo start
   # Or for development build
   npx expo run:ios
   npx expo run:android
   ```

2. **Test Login Flow**
   - Navigate to Login screen
   - Tap "Sign In with Microsoft"
   - Should redirect to External ID login page
   - Complete sign-up/sign-in process
   - Should return to app with user authenticated

## Step 7: Configure Token Management

1. **Set Token Lifetimes** (in External ID tenant)

   - Go to "Token configuration"
   - Configure access token lifetime: 60 minutes
   - Configure refresh token lifetime: 24 hours

2. **Add Custom Claims** (optional)
   - In user flow "User attributes"
   - Add custom attributes as needed for EventSphere

## Important Notes

- **Bundle ID**: Update `com.yourcompany.eventsphereindia` with your actual bundle ID
- **Redirect URIs**: Must match exactly between Azure config and app config
- **Testing**: Use a real device or iOS simulator for OAuth testing (Expo Go may not work)
- **Production**: Use different External ID tenant for production environment

## Quick Setup Checklist

- [ ] Create External ID tenant in Azure Portal
- [ ] Register mobile app with correct redirect URIs
- [ ] Create B2C_1_signupsignin user flow
- [ ] Update `src/config/azure.ts` with your client ID and authority
- [ ] Configure iOS Info.plist with URL schemes
- [ ] Configure Android AndroidManifest.xml
- [ ] Test authentication flow

## Troubleshooting

### Common Issues

1. **Redirect URI mismatch**

   - Ensure redirect URIs in Azure match your app configuration exactly

2. **Authority URL incorrect**

   - Format: `https://{tenant}.b2clogin.com/{tenant}.onmicrosoft.com/{user-flow}`
   - Example: `https://eventsphereindia.b2clogin.com/eventsphereindia.onmicrosoft.com/B2C_1_signupsignin`

3. **Bundle ID issues on iOS**

   - Ensure iOS bundle ID matches the redirect URI registered in Azure

4. **Android issues**

   - Verify AndroidManifest.xml activity configuration
   - Check package name matches registered redirect URI

5. **Expo Go limitations**
   - OAuth flows may not work in Expo Go
   - Use development build: `npx expo run:ios` or `npx expo run:android`

## Cost Considerations

- External ID Free Tier: 25,000 monthly active users
- Additional users: $0.00325 per MAU
- Fits well within your $200 Azure credit budget

## Next Steps

After authentication is working:

1. Integrate user profile data with Cosmos DB
2. Add authorization for Azure Function APIs
3. Implement user preferences and profile management
4. Set up analytics and monitoring

## Support

For issues with this setup:

1. Check Azure External ID documentation
2. Review react-native-msal GitHub issues
3. Test with Microsoft Graph Explorer for token validation
