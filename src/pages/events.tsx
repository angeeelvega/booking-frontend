import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import { Button } from "../components/ui/button";
import { EventCard } from "../components/event-card";
import { useAuth } from "../lib/auth-context";
import EventService from "../services/event-service";
import { Event } from "../types/interfaces";
import { LogoutButton } from "../components/logout-button";

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await EventService.getEvents();
      setEvents(eventsData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError("Failed to load events. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateEvent = () => {
    navigate("/event/create");
  };

  const handleEditEvent = (id: string) => {
    navigate(`/event/edit/${id}`);
  };

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await EventService.deleteEvent(id);
        setEvents(events.filter(event => event.id !== id));
      } catch (err) {
        console.error("Failed to delete event:", err);
        setError("Failed to delete event. Please try again later.");
      }
    }
  };

  const handleReservationChange = () => {
    fetchEvents(); 
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <div className="flex gap-4">
            {isAdmin && (
              <Button onClick={handleCreateEvent}>
                <Plus className="mr-2 h-4 w-4" /> Create Event
              </Button>
            )}
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-4 sm:px-0">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search events..."
              className="w-full md:w-1/3 p-2 border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="text-center py-12">Loading events...</div>
          ) : error ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-red-500">{error}</p>
              <Button onClick={() => fetchEvents()} className="mt-4">
                Retry
              </Button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No events found</p>
              {isAdmin && (
                <Button onClick={handleCreateEvent} className="mt-4">
                  Create your first event
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onEdit={() => handleEditEvent(event.id)}
                  onDelete={() => handleDeleteEvent(event.id)}
                  onReservationChange={handleReservationChange}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 