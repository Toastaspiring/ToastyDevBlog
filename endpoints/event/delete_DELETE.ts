import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { InputSchema, OutputType } from "./delete_DELETE.schema";
import superjson from "superjson";

export async function handle(request: Request) {
    try {
        // Check authentication
        const userSession = await getServerUserSession(request);
        if (!userSession) {
            return new Response(
                superjson.stringify({ error: "Not authenticated" }),
                { status: 401 }
            );
        }

        // Parse input
        const url = new URL(request.url);
        const id = parseInt(url.searchParams.get("id") || "");

        if (isNaN(id)) {
            return new Response(
                superjson.stringify({ error: "Invalid event ID" }),
                { status: 400 }
            );
        }

        const input = InputSchema.parse({ id });

        // Check if event exists and user is the creator
        const event = await db
            .selectFrom("events")
            .select(["id", "createdBy"])
            .where("id", "=", input.id)
            .executeTakeFirst();

        if (!event) {
            return new Response(
                superjson.stringify({ error: "Event not found" }),
                { status: 404 }
            );
        }

        if (event.createdBy !== userSession.user.id) {
            return new Response(
                superjson.stringify({ error: "Not authorized to delete this event" }),
                { status: 403 }
            );
        }

        // Delete the event
        await db
            .deleteFrom("events")
            .where("id", "=", input.id)
            .execute();

        return new Response(
            superjson.stringify({ success: true } satisfies OutputType),
            {
                headers: { "Content-Type": "application/json" },
                status: 200,
            }
        );
    } catch (error) {
        console.error("Error deleting event:", error);
        const errorMessage =
            error instanceof Error ? error.message : "An unknown error occurred";
        return new Response(
            superjson.stringify({
                error: "Failed to delete event",
                details: errorMessage,
            }),
            { status: 500 }
        );
    }
}
