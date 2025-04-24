import apiClient from './api-client';
import { 
  Event, 
  CreateEventRequest, 
  UpdateEventRequest, 
  EventResponse,
  PaginationParams 
} from '../types/interfaces';

const EventService = {
  async getEvents(params?: PaginationParams): Promise<Event[]> {
    try {
      const response = await apiClient.get<EventResponse[]>('/events', { params });
      
      return response.data.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        image: event.image_url,
        totalSpots: event.total_spots,
        occupiedSpots: event.booked_spots,
        createdBy: event.created_by,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
        isBookedByUser: event.is_booked_by_user,
        bookingId: event.booking_id,
        attendees: [],
      }));
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  async getEventById(id: string): Promise<Event> {
    const response = await apiClient.get<EventResponse>(`/events/${id}`);
    
    return {
      id: response.data.id,
      title: response.data.title,
      description: response.data.description,
      image: response.data.image_url,
      totalSpots: response.data.total_spots,
      occupiedSpots: response.data.booked_spots,
      createdBy: response.data.created_by,
      createdAt: response.data.created_at,
      updatedAt: response.data.updated_at,
      isBookedByUser: response.data.is_booked_by_user,
      attendees: [],
      bookingId: response.data.booking_id,
    };
  },

  async createEvent(data: CreateEventRequest): Promise<Event> {
    const response = await apiClient.post<EventResponse>("/events", data);

    return {
      id: response.data.id,
      title: response.data.title,
      description: response.data.description,
      image: response.data.image_url,
      totalSpots: response.data.total_spots,
      occupiedSpots: response.data.booked_spots,
      createdBy: response.data.created_by,
      createdAt: response.data.created_at,
      updatedAt: response.data.updated_at,
      isBookedByUser: response.data.is_booked_by_user,
      attendees: [],
      bookingId: response.data.booking_id,
    };
  },

    async updateEvent(id: string, data: UpdateEventRequest): Promise<Event> {
    const response = await apiClient.put<EventResponse>(`/events/${id}`, data);
    
    return {
      id: response.data.id,
      title: response.data.title,
      description: response.data.description,
      image: response.data.image_url,
      totalSpots: response.data.total_spots,
      occupiedSpots: response.data.booked_spots,
      createdBy: response.data.created_by,
      createdAt: response.data.created_at,
      updatedAt: response.data.updated_at,
      isBookedByUser: response.data.is_booked_by_user,
      attendees: [],
      bookingId: response.data.booking_id,
    };
  },

  async deleteEvent(id: string): Promise<void> {
    await apiClient.delete(`/events/${id}`);
  },

  async reserveSpot(eventId: string): Promise<Event> {
    try {
      await apiClient.post("/bookings", {
        event_id: eventId
      });
      
      return await this.getEventById(eventId);
    } catch (error) {
      console.error('Error reserving spot:', error);
      throw error;
    }
  },

  async cancelReservation(eventId: string): Promise<Event> {
    try {
      const event = await this.getEventById(eventId);
      
      if (!event.isBookedByUser || !event.bookingId) {
        throw new Error('No booking found for this event');
      }
      
      await apiClient.delete(`/bookings/${event.bookingId}`);
      
      return await this.getEventById(eventId);
    } catch (error) {
      console.error('Error canceling reservation:', error);
      throw error;
    }
  },
};

export default EventService; 