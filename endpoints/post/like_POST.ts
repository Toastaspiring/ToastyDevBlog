import { db } from "../../helpers/db";
import { schema, OutputType } from "./like_POST.schema";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);

    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    const existingLike = await db
      .selectFrom("likes")
      .select("id")
      .where("postId", "=", input.postId)
      .where("userId", "=", user.id)
      .executeTakeFirst();

    if (existingLike) {
      // User has already liked the post, so unlike it
      await db
        .deleteFrom("likes")
        .where("id", "=", existingLike.id)
        .execute();
      return new Response(
        superjson.stringify({ liked: false } satisfies OutputType),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      // User has not liked the post, so like it
      await db
        .insertInto("likes")
        .values({
          postId: input.postId,
          userId: user.id,
        })
        .execute();
      return new Response(
        superjson.stringify({ liked: true } satisfies OutputType),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    if (error instanceof Error && error.name === "NotAuthenticatedError") {
      return new Response(
        superjson.stringify({ error: "Not authenticated" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    console.error("Error toggling like:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({ error: "Failed to toggle like", details: errorMessage }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}