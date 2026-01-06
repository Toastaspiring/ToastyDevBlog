import { db } from "../../helpers/db";
import { OutputType } from "./next_GET.schema";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const nextEvent = await db
      .selectFrom("events")
      .innerJoin("users", "events.createdBy", "users.id")
      .select([
        "events.id",
        "events.title",
        "events.description",
        "events.eventDate",
        "events.createdAt",
        "users.displayName as creatorDisplayName",
        "users.avatarUrl as creatorAvatarUrl",
      ])
      .where("events.eventDate", ">=", new Date())
      .orderBy("events.eventDate", "asc")
      .limit(1)
      .executeTakeFirst();

    return new Response(
      superjson.stringify(
        (nextEvent ? nextEvent : null) satisfies OutputType
      ),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error fetching next event:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({
        error: "Failed to fetch next event",
        details: errorMessage,
      }),
      { status: 500 }
    );
  }
}