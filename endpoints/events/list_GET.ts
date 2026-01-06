import { db } from "../../helpers/db";
import { OutputType } from "./list_GET.schema";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const upcomingEvents = await db
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
      .execute();

    return new Response(
      superjson.stringify(upcomingEvents satisfies OutputType),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({
        error: "Failed to fetch upcoming events",
        details: errorMessage,
      }),
      { status: 500 }
    );
  }
}