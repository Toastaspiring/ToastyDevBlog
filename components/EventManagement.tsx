import React, { useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  useForm,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "./Form";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { Button } from "./Button";
import { DateTimePicker } from "./DateTimePicker";
import { useCreateEventMutation } from "../helpers/useCreateEventMutation";
import { updateEvent } from "../endpoints/event/update_PUT.client"; // Direct import or via hook if preferred
import { useMutation, useQueryClient } from "@tanstack/react-query";
import styles from "./EventManagement.module.css";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  eventDate: z.date({
    required_error: "Event date and time are required",
    invalid_type_error: "Invalid date format",
  }).refine((date) => date > new Date(), {
    message: "Event date must be in the future.",
  }),
});

const defaultValues: Partial<z.infer<typeof formSchema>> = {
  title: "",
  description: "",
  eventDate: undefined,
};

// Define Event type locally or import
interface Event {
  id: number;
  title: string;
  description?: string;
  eventDate: string | Date; // API returns string usually
}

interface EventManagementProps {
  className?: string;
  selectedEvent?: Event | null;
  onClear?: () => void;
}

export const EventManagement: React.FC<EventManagementProps> = ({
  className,
  selectedEvent,
  onClear
}) => {
  const form = useForm({
    schema: formSchema,
    defaultValues,
  });

  const queryClient = useQueryClient();
  const createEventMutation = useCreateEventMutation();

  // Custom update mutation
  const updateEventMutation = useMutation({
    mutationFn: updateEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["next-event"] });
    }
  });

  // Populate form on selection
  useEffect(() => {
    if (selectedEvent) {
      form.reset({
        title: selectedEvent.title,
        description: selectedEvent.description || "",
        eventDate: new Date(selectedEvent.eventDate),
      });
    } else {
      // Only clear if we explicitly cleared (handled by onClear parent -> re-render with null)
      // But if we just loaded, we might want defaults.
      // Actually, if selectedEvent changes to null, we should reset.
      form.reset(defaultValues);
    }
  }, [selectedEvent, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (selectedEvent) {
      // UPDATE MODE
      updateEventMutation.mutate(
        {
          id: selectedEvent.id,
          ...values,
          eventDate: values.eventDate,
        },
        {
          onSuccess: () => {
            toast.success("Event Updated", {
              description: "The event has been updated successfully.",
              icon: <CheckCircle2 size={20} />,
            });
            if (onClear) onClear();
          },
          onError: (error) => {
            toast.error("Update Failed", {
              description: error.message,
              icon: <AlertCircle size={20} />,
            });
          }
        }
      )
    } else {
      // CREATE MODE
      createEventMutation.mutate(
        {
          ...values,
          eventDate: values.eventDate,
        },
        {
          onSuccess: () => {
            toast.success("Event Created", {
              description: "The new event has been scheduled successfully.",
              icon: <CheckCircle2 size={20} />,
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            form.setValues(defaultValues as any);
          },
          onError: (error) => {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "An unknown error occurred.";
            toast.error("Creation Failed", {
              description: errorMessage,
              icon: <AlertCircle size={20} />,
            });
            console.error("Failed to create event:", error);
          },
        }
      );
    }
  };

  const isPending = createEventMutation.isPending || updateEventMutation.isPending;

  return (
    <div className={`${styles.container} ${className || ""}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 className={styles.title}>{selectedEvent ? "Edit Event" : "Create New Event"}</h3>
        {selectedEvent && (
          <Button variant="ghost" size="sm" onClick={onClear} title="Cancel Edit">
            <X size={20} />
          </Button>
        )}
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
          <FormItem name="title">
            <FormLabel>Event Title</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., Next.js 15 Launch Party"
                value={form.values.title}
                onChange={(e) =>
                  form.setValues((prev) => ({ ...prev, title: e.target.value }))
                }
                disabled={isPending}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem name="description">
            <FormLabel>Description (Optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="A brief summary of what the event is about."
                value={form.values.description}
                onChange={(e) =>
                  form.setValues((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={4}
                disabled={isPending}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem name="eventDate">
            <FormLabel>Event Date & Time</FormLabel>
            <FormControl>
              <DateTimePicker
                date={form.values.eventDate}
                onChange={(date) =>
                  form.setValues((prev) => ({
                    ...prev,
                    eventDate: date,
                  }))
                }
                disabled={isPending}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <Button
            type="submit"
            className={styles.submitButton}
            disabled={isPending}
          >
            {isPending ? (selectedEvent ? "Updating..." : "Creating...") : (selectedEvent ? "Update Event" : "Create Event")}
          </Button>
        </form>
      </Form>
    </div>
  );
};