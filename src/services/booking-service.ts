import apiClient from './api-client';
import { getCookie, setCookie, deleteCookie } from '../utils/cookie-utils';
import { Booking } from '../types/interfaces';

const USER_BOOKINGS_COOKIE = "user_bookings";

const BookingService = {
  async reserveSpot(eventId: string): Promise<Booking> {
    try {
      const response = await apiClient.post<Booking>('/bookings', {
        event_id: eventId
      });

      this.storeBookingId(eventId, response.data.id);

      return response.data;
    } catch (error) {
      console.error('Error reserving spot:', error);
      throw error;
    }
  },

  async cancelReservation(eventId: string): Promise<void> {
    try {
      const bookingId = this.getBookingId(eventId);
      
      if (!bookingId) {
        throw new Error('No booking found for this event');
      }
      
      await apiClient.delete(`/bookings/${bookingId}`);
      
      this.removeBookingId(eventId);
    } catch (error) {
      console.error('Error canceling reservation:', error);
      throw error;
    }
  },

  async getMyBookings(): Promise<Booking[]> {
    try {
      const response = await apiClient.get<Booking[]>("/bookings/my-bookings");
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  storeBookingId(eventId: string, bookingId: string): void {
    const bookingsJson = getCookie(USER_BOOKINGS_COOKIE) || '{}';
    const bookings = JSON.parse(bookingsJson);
    
    bookings[eventId] = bookingId;
    
    setCookie(USER_BOOKINGS_COOKIE, JSON.stringify(bookings));
  },

  getBookingId(eventId: string): string | null {
    const bookingsJson = getCookie(USER_BOOKINGS_COOKIE);
    if (!bookingsJson) return null;
    
    const bookings = JSON.parse(bookingsJson);
    return bookings[eventId] || null;
  },

  removeBookingId(eventId: string): void {
    const bookingsJson = getCookie(USER_BOOKINGS_COOKIE);
    if (!bookingsJson) return;
    
    const bookings = JSON.parse(bookingsJson);
    delete bookings[eventId];
    
    setCookie(USER_BOOKINGS_COOKIE, JSON.stringify(bookings));
  },

  hasReservation(eventId: string): boolean {
    return !!this.getBookingId(eventId);
  },

  clearAllBookings(): void {
    deleteCookie(USER_BOOKINGS_COOKIE);
  }
};

export default BookingService; 