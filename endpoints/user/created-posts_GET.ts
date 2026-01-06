import { db } from "../../helpers/db";
import { OutputType } from "./created-posts_GET.schema";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import superjson from "superjson";
import { sql } from "kysely";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);

    if (user.role !== "admin") {
      return new Response(
        superjson.stringify({
          error: "Forbidden",
          details: "You do not have permission to access this resource.",
        }),
        { status: 403 }
      );
    }

    const posts = await db
      .selectFrom("blogPosts")
      .select((eb) => [
        "blogPosts.id",
        "blogPosts.title",
        "blogPosts.slug",
        "blogPosts.published",
        "blogPosts.createdAt",
        eb
          .selectFrom("likes")
          .select(eb.fn.countAll().as("count"))
          .whereRef("likes.postId", "=", "blogPosts.id")
          .as("likeCount"),
        eb
          .selectFrom("comments")
          .select(eb.fn.countAll().as("count"))
          .whereRef("comments.postId", "=", "blogPosts.id")
          .as("commentCount"),
      ])
      .where("blogPosts.authorId", "=", user.id)
      .orderBy("blogPosts.createdAt", "desc")
      .execute();

    const response: OutputType = posts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      published: p.published,
      createdAt: p.createdAt,
      likeCount: Number(p.likeCount),
      commentCount: Number(p.commentCount),
    }));

    return new Response(superjson.stringify(response), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching user's created posts:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({
        error: "Failed to fetch created posts",
        details: errorMessage,
      }),
      { status: error instanceof Error && error.name === "NotAuthenticatedError" ? 401 : 500 }
    );
  }
}