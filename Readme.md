# EventSphereIndia - Event Booking Mobile App

A mobile application for discovering and booking events across India, inspired by platforms like BookMyShow and Eventbrite. The app allows users to browse events, view details, and book tickets seamlessly.

**Repository:** [https://github.com/Nihal018/EventSphereIndia](https://github.com/Nihal018/EventSphereIndia)

## Project Overview

EventSphereIndia is a mobile application designed to simplify event discovery and ticket booking. Users can explore various events happening in their city, view event details, and make bookings through an intuitive mobile interface. The project demonstrates modern mobile app development with cloud backend integration.

## Current Status

✅ **Frontend Development - Complete**
- Full mobile UI/UX implementation
- All screens and navigation flows
- Responsive layouts for different screen sizes

🔧 **Backend Integration - In Progress**
- Azure Functions implementation
- Cloud services integration
- Database connectivity

## Features Implemented

### User Interface
- **Home Screen**: Browse featured and upcoming events
- **Event Discovery**: Search and filter events by category, date, and location
- **Event Details**: Comprehensive event information including venue, timing, and pricing
- **Booking Flow**: Step-by-step ticket booking interface
- **User Profile**: Personal profile and booking history view
- **Categories**: Events organized by type (concerts, workshops, sports, etc.)

### Core Functionality
- **Event Listing**: Display of all available events with key information
- **Search Feature**: Find events by name, venue, or keyword
- **Filter Options**: Sort by date, price, category, and location
- **Event Details View**: Full event description, images, and booking options
- **Ticket Selection**: Choose ticket types and quantities
- **Booking Summary**: Review booking details before confirmation

### Design Features
- Modern, clean UI design
- Intuitive navigation patterns
- Smooth transitions and animations
- Consistent color scheme and typography
- Mobile-optimized layouts

## Tech Stack

### Frontend (Mobile App)
- **Framework**: React Native 
- **State Management**: Context API 
- **Navigation**: React Navigation 
- **UI Components**: Custom components with native feel
- **Styling**: StyleSheet 

### Backend (In Development)
- **Cloud Platform**: Microsoft Azure
- **Serverless Functions**: Azure Functions
- **Database**: Azure Cosmos DB / SQL Database
- **Authentication**: Azure Active Directory B2C
- **Storage**: Azure Blob Storage for images

### Development Tools
- **IDE**: Android Studio / VS Code
- **Version Control**: Git & GitHub
- **Testing**: Device emulators and physical devices

## Project Structure

```
EventSphereIndia/
├── src/
│   ├── components/         # Reusable UI components
│   ├── screens/           # App screens
│   │   ├── HomeScreen/
│   │   ├── EventDetails/
│   │   ├── BookingScreen/
│   │   ├── ProfileScreen/
│   │   └── SearchScreen/
│   ├── navigation/        # Navigation configuration
│   ├── services/          # API and backend services
│   ├── utils/             # Helper functions
│   └── assets/            # Images, fonts, icons
├── azure/                 # Azure Functions code
│   ├── functions/
│   └── config/
└── package.json          # Dependencies
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Android Studio / Xcode (for emulators)
- Azure account (for backend services)

### Steps to Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/Nihal018/EventSphereIndia.git
   cd EventSphereIndia
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   Create `.env` file with Azure configurations:
   ```
   AZURE_FUNCTION_URL=your_azure_function_url
   AZURE_STORAGE_URL=your_storage_url
   API_KEY=your_api_key
   ```

4. **Run the application**
   
   For Android:
   ```bash
   npm run android
   # or
   yarn android
   ```
   
   For iOS:
   ```bash
   npm run ios
   # or
   yarn ios
   ```

5. **Start Metro bundler** (if not started automatically)
   ```bash
   npm start
   # or
   yarn start
   ```

## Screens Overview

### Main Screens
1. **Splash Screen** - App loading and branding
2. **Home Screen** - Featured events and categories
3. **Search Screen** - Search and filter functionality
4. **Event Details** - Complete event information
5. **Booking Screen** - Ticket selection and booking
6. **Profile Screen** - User profile and settings
7. **My Bookings** - Booking history and tickets

### User Flow
1. User opens app → Splash screen
2. Home screen displays featured events
3. User can search or browse categories
4. Select event → View details
5. Choose tickets → Proceed to booking
6. Review and confirm booking
7. View booking in profile section

## Azure Backend Integration

### Current Implementation
- Azure Functions for serverless API endpoints
- Database setup for event and booking data
- Storage configuration for media files
- Basic authentication structure

### API Endpoints (In Development)
```
GET    /api/events           - Get all events
GET    /api/events/{id}      - Get event details
GET    /api/categories       - Get event categories
POST   /api/bookings         - Create booking
GET    /api/users/{id}/bookings - Get user bookings
```

## Building for Production

### Android
```bash
cd android
./gradlew assembleRelease
```
APK will be generated in `android/app/build/outputs/apk/release/`

### iOS
1. Open project in Xcode
2. Select Generic iOS Device
3. Product → Archive
4. Follow upload process to App Store Connect

## Testing

The app has been tested on:
- Android emulators (API 21+)
- iOS simulators (iOS 12+)
- Physical devices for real-world testing

## Challenges Addressed

1. **Performance Optimization**: Implemented lazy loading for event lists
2. **Offline Support**: Basic caching for viewed events
3. **Image Handling**: Optimized image loading and caching
4. **Navigation**: Smooth navigation with proper back handling
5. **State Management**: Efficient state updates across screens

## Future Enhancements

Potential features to add:
- Payment gateway integration
- Push notifications for bookings
- Social sharing of events
- User reviews and ratings
- Seat selection for venues
- QR code tickets
- Multiple language support
- Event recommendations based on preferences

## Developer

**Nihal** - [GitHub](https://github.com/Nihal018)

## Acknowledgments

- Built as a project to practise mobile app development skills
- Inspired by BookMyShow and Eventbrite
- Thanks to the React Native community for resources

---
