import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Event } from "../types/interfaces";
import { useAuth } from "../lib/auth-context";
import { toast } from "../hooks/use-toast";
import EventService from "../services/event-service";

interface EventCardProps {
  event: Event;
  onEdit?: () => void;
  onDelete?: () => void;
  onReservationChange?: () => void; // Callback to refresh events after reservation changes
}

export function EventCard({ event, onEdit, onDelete, onReservationChange }: EventCardProps) {
  const { user, isAdmin } = useAuth();
  const [isReserving, setIsReserving] = useState(false);
  const isOwner = isAdmin && user?.id === event.createdBy;
  const availableSpots = event.totalSpots - event.occupiedSpots;
  const hasReserved = event.isBookedByUser || false;

  const handleReserve = async () => {
    if (!user) return;
    
    setIsReserving(true);
    
    try {
      // Check if there are available spots
      if (availableSpots <= 0 && !hasReserved) {
        toast({
          title: "No spots available",
          description: "Sorry, this event is fully booked.",
          variant: "destructive",
        });
        return;
      }
      
      if (hasReserved) {
        // Cancel reservation using EventService
        await EventService.cancelReservation(event.id);
        
        toast({
          title: "Reservation cancelled",
          description: "Your spot has been cancelled.",
        });
      } else {
        // Make reservation using EventService
        await EventService.reserveSpot(event.id);
        
        toast({
          title: "Spot reserved",
          description: "You have successfully reserved a spot.",
        });
      }
      
      // Call the callback to refresh event data
      if (onReservationChange) {
        onReservationChange();
      }
    } catch (error) {
      console.error("Reservation error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred with your reservation",
        variant: "destructive",
      });
    } finally {
      setIsReserving(false);
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="relative h-48 w-full">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
      </div>
      <CardHeader>
        <CardTitle>{event.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {event.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex justify-between text-sm">
          <div>
            <p className="font-medium">Available Spots</p>
            <p className={availableSpots > 0 ? "text-green-600" : "text-red-600"}>
              {availableSpots} available
            </p>
          </div>
          <div>
            <p className="font-medium">Occupied Spots</p>
            <p className="text-red-600">{event.occupiedSpots} reserved</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        {isOwner && (
          <>
            <Button
              variant="outline"
              className="flex-1"
              onClick={onEdit}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              className="flex-1 text-white"
              onClick={onDelete}
            >
              Delete
            </Button>
          </>
        )}
        
        {user && !isOwner && (
          <Button 
            className="w-full" 
            onClick={handleReserve} 
            disabled={isReserving || (availableSpots <= 0 && !hasReserved)}
            variant={hasReserved ? "destructive" : "default"}
          >
            {isReserving ? "Processing..." : 
             hasReserved ? "Cancel Reservation" : "Reserve Spot"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 