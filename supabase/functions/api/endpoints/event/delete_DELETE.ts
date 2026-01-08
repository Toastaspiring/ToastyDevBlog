import { db } from "../../db.ts";
import { getServerUserSession } from "../../helpers/getServerUserSession.ts";
import superjson from "superjson";

export async function handle(request: Request) {
    try {
        const { user } = await getServerUserSession(request);

        if (user.role !== "admin") {
            return new Response(
                superjson.stringify({ error: "Forbidden: Admins only" }),
                { status: 403 }
            );
        }

        const url = new URL(request.url);
        const idStr = url.searchParams.get("id");

        if (!idStr) {
            return new Response(
                superjson.stringify({ error: "Missing event ID" }),
                { status: 400 }
            );
        }

        const id = parseInt(idStr, 10);
        if (isNaN(id)) {
            return new Response(
                superjson.stringify({ error: "Invalid event ID format" }),
                { status: 400 }
            );
        }

        const result = await db
            .deleteFrom("events")
            .where("id", "=", id)
            .returningAll()
            .executeTakeFirst();

        if (!result) {
            return new Response(
                superjson.stringify({ error: "Event not found" }),
                { status: 404 }
            );
        }

        return new Response(superjson.stringify({ success: true, deleted: result }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
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
