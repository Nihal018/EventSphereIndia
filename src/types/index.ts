import { NavigatorScreenParams } from "@react-navigation/native";

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  city?: string;
  state?: string;
  preferences: EventCategory[];
  createdAt: Date | string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  images: string[];
  date: Date | string;
  time: string;
  venue: Venue;
  category: EventCategory;
  price: {
    min: number;
    max: number;
    currency: "INR";
  };
  isFree: boolean;
  organizer: {
    name: string;
    id: string;
    avatar?: string;
  };
  capacity: number;
  bookedCount: number;
  status: "active" | "cancelled" | "completed";
  tags: string[];
  rating: number;
  reviewCount: number;
  createdAt: Date | string;
}

export interface Venue {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
}

export type EventCategory =
  | "Music"
  | "Technology"
  | "Business"
  | "Arts"
  | "Sports"
  | "Food"
  | "Health"
  | "Education"
  | "Entertainment"
  | "Comedy"
  | "Theatre"
  | "Workshop";

export interface Booking {
  id: string;
  userId: string;
  eventId: string;
  eventTitle: string;
  eventDate: Date | string;
  eventVenue: string;
  quantity: number;
  totalAmount: number;
  status: "pending" | "confirmed" | "cancelled";
  bookingDate: Date | string;
  qrCode?: string;
  tickets: Ticket[];
  userDetails: {
    name: string;
    email: string;
    phone: string;
  };
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Ticket {
  id: string;
  seatNumber?: string;
  ticketType: "general" | "vip" | "premium";
  price: number;
  qrCode: string;
}

export type MainStackParamList = {
  MainTabs: undefined;
  EventDetails: { eventId: string };
  Booking: { eventId: string };
  BookingDetails: { bookingId: string };
  Payment: { booking: Partial<Booking> };
  Success: { bookingId: string; eventId: string; amount: number };
  CreateEvent: undefined;
  EditEvent: { eventId: string };
  MyEvents: undefined;
  EventManagement: undefined;
  EditProfile: undefined;
  UserManagement: undefined;
};

// RootStackParamList: Defines the top-level screens
export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<MainStackParamList>;
};

// AuthStackParamList: Defines screens within the AuthNavigator's stack
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// MainTabParamList: Defines screens within the MainTabs (BottomTabNavigator)
export type MainTabParamList = {
  Home: undefined;
  Search: undefined; // Search is a tab
  Bookings: undefined;
  Profile: undefined;
};

// ProfileStackParamList: Defines screens within the Profile section
export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  UserManagement: undefined;
};
