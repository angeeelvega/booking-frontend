export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName?: string;
    name?: string;
    role: 'admin' | 'user';
  };
  access_token: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role?: 'admin' | 'user';
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role?: 'admin' | 'user') => Promise<boolean>;
  logout: () => void;
  setUser: (user: User) => void;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  totalSpots: number;
  occupiedSpots: number;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  isBookedByUser?: boolean;
  bookingId?: string;
  attendees: string[];
}

export interface CreateEventRequest {
  title: string;
  description: string;
  image_url: string;
  total_spots: number;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  image_url?: string;
  total_spots?: number;
}

export interface EventResponse {
  id: string;
  title: string;
  description: string;
  image_url: string;
  total_spots: number;
  booked_spots: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_booked_by_user: boolean;
  booking_id?: string;
}

export interface EventsContextType {
  events: Event[];
  loading: boolean;
  error: string | null;
  createEvent: (event: Omit<Event, 'id' | 'createdBy' | 'createdAt' | 'attendees' | 'occupiedSpots' | 'isBookedByUser' | 'bookingId'>) => Promise<void>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  getEventById: (id: string) => Promise<Event | undefined>;
  toggleAttendance: (eventId: string) => Promise<void>;
  refreshEvents: () => Promise<void>;
}

export interface Booking {
  id: string;
  user_id: string;
  event_id: string;
  created_at: string;
}

export interface PaginationParams {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
} 