import { db } from "../db.ts";
import { OutputType } from "./posts_GET.schema.ts";
import superjson from "superjson";
import { sql } from "kysely";
import { getServerUserSession } from "../helpers/getServerUserSession.ts";

export async function handle(request: Request) {
    let userId: number | null = null;
    let isAdmin = false;

    // Parse query params
    const url = new URL(request.url);
    const mode = url.searchParams.get("mode");

    try {
        const { user } = await getServerUserSession(request);
        userId = user.id;
        isAdmin = user.role === 'admin';
    } catch (e) {
        // Valid for non-authenticated users to view posts
    }

    try {
        let query = db
            .selectFrom("blogPosts")
            .innerJoin("users", "users.id", "blogPosts.authorId")
            .select((eb) => [
                "blogPosts.id",
                "blogPosts.title",
                "blogPosts.slug",
                "blogPosts.content",
                "blogPosts.createdAt",
                "blogPosts.published",
                "blogPosts.authorId",
                "users.displayName as authorDisplayName",
                "users.avatarUrl as authorAvatarUrl",
                sql<string>`SUBSTRING(blog_posts.content, 1, 200)`.as("contentPreview"),
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
            ]);

        if (userId) {
            query = query.select((eb) => [
                eb.selectFrom("likes")
                    .select(sql<boolean>`true`.as("isLiked"))
                    .whereRef("likes.postId", "=", "blogPosts.id")
                    .where("likes.userId", "=", userId)
                    .as("isLiked")
            ]);
        }

        if (mode === 'admin' && isAdmin) {
            // No filter
        } else {
            query = query.where("blogPosts.published", "=", true);
        }

        const posts = await query
            .orderBy("blogPosts.createdAt", "desc")
            .execute();

        const response: OutputType = posts.map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            content: p.content,
            contentPreview: p.contentPreview,
            createdAt: p.createdAt,
            published: Boolean(p.published),
            author: {
                id: p.authorId,
                displayName: p.authorDisplayName,
                avatarUrl: p.authorAvatarUrl,
            },
            likeCount: Number(p.likeCount),
            commentCount: Number(p.commentCount),
            isLiked: userId ? Boolean((p as any).isLiked) : false,
        }));

        return new Response(superjson.stringify(response), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error during posts query execution:", error);
        const errorMessage =
            error instanceof Error ? error.message : "An unknown error occurred";
        return new Response(
            superjson.stringify({ error: "Failed to fetch posts", details: errorMessage }),
            { status: 500 }
        );
    }
}
