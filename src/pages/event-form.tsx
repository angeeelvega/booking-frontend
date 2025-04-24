import { useEffect, useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { useAuth } from "../lib/auth-context";
import EventService from "../services/event-service";
import { toast } from "../hooks/use-toast";
import { CreateEventRequest, UpdateEventRequest } from "../types/interfaces";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  image: z.string().url("Please enter a valid image URL"),
  totalSpots: z.number().min(1, "Total spots must be at least 1"),
});

type FormValues = z.infer<typeof formSchema>;

export default function EventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!id;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      image: "",
      totalSpots: 100,
    },
  });

  useEffect(() => {
    const fetchEvent = async () => {
      if (isEditMode && id) {
        try {
          setIsLoading(true);
          const fetchedEvent = await EventService.getEventById(id);
          form.reset({
            title: fetchedEvent.title,
            description: fetchedEvent.description,
            image: fetchedEvent.image,
            totalSpots: fetchedEvent.totalSpots,
          });
        } catch (error) {
          console.error("Failed to fetch event:", error);
          toast({
            title: "Error",
            description: "Failed to load event details",
            variant: "destructive",
          });
          navigate("/events");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchEvent();
  }, [id, form, navigate, isEditMode]);

  const handleCancel = () => {
    navigate("/events");
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      if (isEditMode && id) {
        const updateData: UpdateEventRequest = {
          title: values.title,
          description: values.description,
          image_url: values.image,
          total_spots: values.totalSpots,
        };
        
        await EventService.updateEvent(id, updateData);
        toast({
          title: "Success",
          description: "Event updated successfully",
        });
      } else {
        const createData: CreateEventRequest = {
          title: values.title,
          description: values.description,
          image_url: values.image,
          total_spots: values.totalSpots,
        };
        
        await EventService.createEvent(createData);
        toast({
          title: "Success",
          description: "Event created successfully",
        });
      }
      navigate("/events");
    } catch (error) {
      console.error("Failed to save event:", error);
      toast({
        title: "Error",
        description: isEditMode ? "Failed to update event" : "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) {
    return <Navigate to="/events" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? "Edit Event" : "Create New Event"}
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            {isLoading && isEditMode ? (
              <div className="text-center py-8">Loading event details...</div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter event title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <textarea
                            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Enter event description"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="totalSpots"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Spots</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value, 10))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Saving..." : isEditMode ? "Update Event" : "Create Event"}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 