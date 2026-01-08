import { db } from "../../db.ts";
import { OutputType } from "./comments_GET.schema.ts";
import { getServerUserSession } from "../../helpers/getServerUserSession.ts";
import superjson from "superjson";

export async function handle(request: Request) {
    try {
        const url = new URL(request.url);
        const userIdParam = url.searchParams.get("userId");
        let targetUserId: number;

        if (userIdParam) {
            targetUserId = parseInt(userIdParam);
            if (isNaN(targetUserId)) {
                return new Response(superjson.stringify({ error: "Invalid User ID" }), { status: 400 });
            }
        } else {
            const { user } = await getServerUserSession(request);
            targetUserId = user.id;
        }

        const comments = await db
            .selectFrom("comments")
            .innerJoin("blogPosts", "blogPosts.id", "comments.postId")
            .select([
                "comments.id",
                "comments.content",
                "comments.createdAt",
                "blogPosts.title as postTitle",
                "blogPosts.slug as postSlug",
            ])
            .where("comments.userId", "=", targetUserId)
            .orderBy("comments.createdAt", "desc")
            .execute();

        const response: OutputType = comments;

        return new Response(superjson.stringify(response), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error fetching user comments:", error);
        const errorMessage =
            error instanceof Error ? error.message : "An unknown error occurred";

        // Only return 401 if it was an Auth error AND we were trying to get session (no userIdParam)
        const isAuthError = error instanceof Error && error.name === "NotAuthenticatedError";
        const status = isAuthError && !new URL(request.url).searchParams.has("userId") ? 401 : 500;

        return new Response(
            superjson.stringify({
                error: "Failed to fetch user comments",
                details: errorMessage,
            }),
            { status }
        );
    }
}
