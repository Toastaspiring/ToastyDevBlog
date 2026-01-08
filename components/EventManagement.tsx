import React from "react";
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
import styles from "./EventManagement.module.css";
import { CheckCircle2, AlertCircle } from "lucide-react";

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

export const EventManagement: React.FC<{ className?: string }> = ({
  className,
}) => {
  const form = useForm({
    schema: formSchema,
    defaultValues,
  });

  const createEventMutation = useCreateEventMutation();

  const onSubmit = (values: z.infer<typeof formSchema>) => {
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
  };

  return (
    <div className={`${styles.container} ${className || ""}`}>
      <h3 className={styles.title}>Create New Event</h3>
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
                disabled={createEventMutation.isPending}
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
                disabled={createEventMutation.isPending}
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
                disabled={createEventMutation.isPending}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <Button
            type="submit"
            className={styles.submitButton}
            disabled={createEventMutation.isPending}
          >
            {createEventMutation.isPending ? "Creating..." : "Create Event"}
          </Button>
        </form>
      </Form>
    </div>
  );
};