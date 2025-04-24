import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "../hooks/use-toast";
import EventService from "../services/event-service";
import { useAuth } from "./auth-context";
import {
  Event,
  EventsContextType,
  UpdateEventRequest,
} from "../types/interfaces";

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const fetchedEvents = await EventService.getEvents();
      setEvents(fetchedEvents);
      setError(null);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events");
      toast({
        title: "Error",
        description: "Failed to load events. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentPath = window.location.pathname;
    const isPublicRoute =
      currentPath === "/login" || currentPath === "/register";

    if (!isPublicRoute) {
      fetchEvents();
    } else {
      setLoading(false);
    }
  }, []);

  const createEvent = async (
    eventData: Omit<
      Event,
      | "id"
      | "createdBy"
      | "createdAt"
      | "attendees"
      | "occupiedSpots"
      | "isBookedByUser"
      | "bookingId"
    >
  ) => {
    try {
      const createEventData = {
        title: eventData.title,
        description: eventData.description,
        image_url: eventData.image,
        total_spots: eventData.totalSpots,
      };

      const newEvent = await EventService.createEvent(createEventData);

      setEvents((prevEvents) => [...prevEvents, newEvent]);

      toast({
        title: "Event Created",
        description: "The event has been created successfully.",
      });
    } catch (err) {
      console.error("Error creating event:", err);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateEvent = async (id: string, eventUpdate: Partial<Event>) => {
    try {
      const updateData: UpdateEventRequest = {};
      if (eventUpdate.title) updateData.title = eventUpdate.title;
      if (eventUpdate.description)
        updateData.description = eventUpdate.description;
      if (eventUpdate.image) updateData.image_url = eventUpdate.image;
      if (eventUpdate.totalSpots)
        updateData.total_spots = eventUpdate.totalSpots;

      const updatedEvent = await EventService.updateEvent(id, updateData);

      setEvents((prevEvents) =>
        prevEvents.map((event) => (event.id === id ? updatedEvent : event))
      );

      toast({
        title: "Event Updated",
        description: "The event has been updated successfully.",
      });
    } catch (err) {
      console.error("Error updating event:", err);
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await EventService.deleteEvent(id);

      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));

      toast({
        title: "Event Deleted",
        description: "The event has been deleted successfully.",
      });
    } catch (err) {
      console.error("Error deleting event:", err);
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const getEventById = async (id: string) => {
    try {
      const event = await EventService.getEventById(id);
      return event;
    } catch (err) {
      console.error(`Error fetching event with id ${id}:`, err);
      toast({
        title: "Error",
        description: "Failed to load event details. Please try again.",
        variant: "destructive",
      });
      return undefined;
    }
  };

  const toggleAttendance = async (eventId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book an event.",
        variant: "destructive",
      });
      return;
    }

    try {
      const event = events.find((e) => e.id === eventId);

      if (!event) {
        throw new Error("Event not found");
      }

      let updatedEvent;

      if (event.isBookedByUser) {
        updatedEvent = await EventService.cancelReservation(eventId);
        toast({
          title: "Reservation Cancelled",
          description: "Your reservation has been cancelled successfully.",
        });
      } else {
        updatedEvent = await EventService.reserveSpot(eventId);
        toast({
          title: "Spot Reserved",
          description: "You have successfully reserved a spot for this event.",
        });
      }

      setEvents((prevEvents) =>
        prevEvents.map((e) => (e.id === eventId ? updatedEvent : e))
      );
    } catch (err) {
      console.error("Error toggling attendance:", err);
      toast({
        title: "Error",
        description:
          err instanceof Error
            ? err.message
            : "Failed to update reservation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const refreshEvents = async () => {
    return fetchEvents();
  };

  return (
    <EventsContext.Provider
      value={{
        events,
        loading,
        error,
        createEvent,
        updateEvent,
        deleteEvent,
        getEventById,
        toggleAttendance,
        refreshEvents,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
}

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error("useEvents must be used within an EventsProvider");
  }
  return context;
};
