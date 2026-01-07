import { db } from "../../db.ts";
import { schema, OutputType } from "./create_POST.schema.ts";
import { getServerUserSession } from "../../helpers/getServerUserSession.ts";
import superjson from "superjson";
import { ZodError } from "zod";

export async function handle(request: Request) {
    try {
        const { user } = await getServerUserSession(request);

        if (user.role !== "admin") {
            return new Response(
                superjson.stringify({ error: "Forbidden: Admins only" }),
                { status: 403 }
            );
        }

        const json = superjson.parse(await request.text());
        const input = schema.parse(json);

        if (input.eventDate <= new Date()) {
            return new Response(
                superjson.stringify({ error: "Event date must be in the future" }),
                { status: 400 }
            );
        }

        const newEvent = await db
            .insertInto("events")
            .values({
                title: input.title,
                description: input.description,
                eventDate: input.eventDate,
                createdBy: user.id,
            })
            .returningAll()
            .executeTakeFirstOrThrow();

        return new Response(superjson.stringify(newEvent satisfies OutputType), {
            headers: { "Content-Type": "application/json" },
            status: 201,
        });
    } catch (error) {
        console.error("Error creating event:", error);
        if (error instanceof ZodError) {
            return new Response(
                superjson.stringify({ error: "Invalid input", details: error.errors }),
                { status: 400 }
            );
        }
        const errorMessage =
            error instanceof Error ? error.message : "An unknown error occurred";
        return new Response(
            superjson.stringify({
                error: "Failed to create event",
                details: errorMessage,
            }),
            { status: 400 }
        );
    }
}
