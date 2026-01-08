import { db } from "../../db.ts";
import { OutputType, PostDetail } from "./slug_GET.schema.ts";
import superjson from "superjson";
import { sql } from "kysely";

export async function handle(request: Request) {
    try {
        const url = new URL(request.url);
        // Extract slug from URL pattern /_api/post/by-slug/:slug
        // This is a bit manual in vanilla Request, but Hono context in index.ts handles it better.
        // However, here we receive raw Request. We'll parse last segment.
        const slug = url.pathname.split("/").pop();

        if (!slug) {
            return new Response(superjson.stringify({ error: "Slug is required" }), { status: 400 });
        }

        // 1. Fetch Post
        const post = await db
            .selectFrom("blogPosts")
            .innerJoin("users", "users.id", "blogPosts.authorId")
            .select([
                "blogPosts.id",
                "blogPosts.title",
                "blogPosts.slug",
                "blogPosts.content",
                "blogPosts.createdAt",
                "blogPosts.published",
                "users.id as authorId",
                "users.displayName as authorName",
                "users.avatarUrl as authorAvatar",
            ])
            .select((eb) => [
                eb
                    .selectFrom("likes")
                    .whereRef("likes.postId", "=", "blogPosts.id")
                    .select(sql<number>`count(*)`.as("count"))
                    .as("likeCount"),
            ])
            .where("blogPosts.slug", "=", slug)
            .executeTakeFirst();

        if (!post) {
            return new Response(superjson.stringify({ error: "Post not found" }), { status: 404 });
        }

        // 2. Fetch Comments
        const comments = await db
            .selectFrom("comments")
            .innerJoin("users", "users.id", "comments.userId")
            .select([
                "comments.id",
                "comments.content",
                "comments.createdAt",
                "users.id as userId",
                "users.displayName",
                "users.avatarUrl",
            ])
            .where("comments.postId", "=", post.id)
            .orderBy("comments.createdAt", "asc")
            .execute();

        // 3. Process Mentions (@USERID -> @Username)
        const mentionRegex = /@(\d+)/g;
        const mentionedUserIds = new Set<string>();

        comments.forEach((comment) => {
            let match;
            while ((match = mentionRegex.exec(comment.content)) !== null) {
                mentionedUserIds.add(match[1]);
            }
        });

        // Fetch mentioned users
        const mentionedUsersMap = new Map<string, string>();
        if (mentionedUserIds.size > 0) {
            // cast to number for query
            const ids = Array.from(mentionedUserIds).map(Number);
            const users = await db
                .selectFrom("users")
                .select(["id", "displayName"])
                .where("id", "in", ids)
                .execute();

            users.forEach(u => {
                if (u.displayName) {
                    mentionedUsersMap.set(String(u.id), u.displayName);
                }
            });
        }

        // Replace content
        const processedComments = comments.map(comment => {
            const newContent = comment.content.replace(mentionRegex, (match, id) => {
                const name = mentionedUsersMap.get(id);
                return name ? `[@${name}](/user/${id})` : match;
            });

            return {
                id: comment.id,
                content: newContent,
                createdAt: comment.createdAt,
                user: {
                    id: comment.userId,
                    displayName: comment.displayName,
                    avatarUrl: comment.avatarUrl,
                },
            };
        });

        const response: PostDetail = {
            id: post.id,
            title: post.title,
            slug: post.slug,
            content: post.content,
            createdAt: post.createdAt,
            author: {
                id: post.authorId,
                displayName: post.authorName,
                avatarUrl: post.authorAvatar,
            },
            likeCount: Number(post.likeCount),
            comments: processedComments,
            published: Boolean(post.published),
        };

        return new Response(superjson.stringify(response satisfies OutputType), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        console.error("Error fetching post:", error);
        const err = error instanceof Error ? error.message : "Unknown error";
        return new Response(
            superjson.stringify({ error: "Failed to fetch post", details: err }),
            { status: 500 }
        );
    }
}
