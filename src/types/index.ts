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
  createdAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  images: string[];
  date: Date;
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
  createdAt: Date;
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
  event: Event;
  quantity: number;
  totalAmount: number;
  status: "pending" | "confirmed" | "cancelled";
  bookingDate: Date;
  qrCode?: string;
  tickets: Ticket[];
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
  Payment: { booking: Partial<Booking> };
  Success: { bookingId: string; eventId: string; amount: number };
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
