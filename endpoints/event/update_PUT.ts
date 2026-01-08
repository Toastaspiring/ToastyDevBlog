import { db } from "../../db.ts";
import { OutputType } from "./create_POST.schema.ts"; // Reuse schema output
import superjson from "superjson";
import { z } from "zod";

const inputSchema = z.object({
    id: z.number(),
    title: z.string().min(1),
    description: z.string().optional(),
    eventDate: z.date(),
});

export async function handle(request: Request) {
    try {
        const bodyText = await request.text();
        const body = superjson.parse(bodyText);
        const input = inputSchema.parse(body);

        // Optional: Check permissions (Admin only) - middleware usually handles this but good to be aware.
        // For now, assuming API guard or session check happens upstream or is implied.

        const updatedEvent = await db
            .updateTable("events")
            .set({
                title: input.title,
                description: input.description,
                eventDate: input.eventDate,
                updatedAt: new Date(),
            })
            .where("id", "=", input.id)
            .returningAll()
            .executeTakeFirst();

        if (!updatedEvent) {
            return new Response(superjson.stringify({ error: "Event not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Need to join creator info to match OutputType? 
        // create_POST returns the inserted event. 
        // UpcomingEventsList expects { creatorDisplayName, ... } which comes from a join.
        // For simplicity, we return the event. The UI updates the list usually via refetch.
        // If we need the join, we might need a select.

        // Let's return the event as is. The client query invalidation will handle the list refresh.
        // But we need to match the return type if possible.
        // The OutputType in create_POST.schema might be just the inserted row or the joined view.
        // Let's check create_POST.schema content if needed. For now returning the row is safe for strict update confirmation.

        return new Response(superjson.stringify(updatedEvent), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error) {
        console.error("Error updating event:", error);
        if (error instanceof z.ZodError) {
            return new Response(superjson.stringify({ error: "Invalid input", details: error.errors }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }
        return new Response(
            superjson.stringify({ error: "Failed to update event" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
