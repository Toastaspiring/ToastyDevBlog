import { db } from "../../helpers/db";
import { OutputType } from "./liked-posts_GET.schema";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);

    const likedPosts = await db
      .selectFrom("likes")
      .innerJoin("blogPosts", "blogPosts.id", "likes.postId")
      .innerJoin("users", "users.id", "blogPosts.authorId")
      .select([
        "blogPosts.id",
        "blogPosts.title",
        "blogPosts.slug",
        "users.displayName as authorDisplayName",
        "users.avatarUrl as authorAvatarUrl",
        "likes.createdAt as likedAt",
      ])
      .where("likes.userId", "=", user.id)
      .orderBy("likes.createdAt", "desc")
      .execute();

    const response: OutputType = likedPosts;

    return new Response(superjson.stringify(response), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching user's liked posts:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({
        error: "Failed to fetch liked posts",
        details: errorMessage,
      }),
      { status: error instanceof Error && error.name === "NotAuthenticatedError" ? 401 : 500 }
    );
  }
}