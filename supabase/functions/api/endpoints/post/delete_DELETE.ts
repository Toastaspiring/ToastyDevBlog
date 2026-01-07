import { db } from "../../db.ts";
import { InputType, OutputType, schema } from "./delete_DELETE.schema.ts";
import superjson from "superjson";
import { getServerUserSession } from "../../helpers/getServerUserSession.ts";

export async function handle(request: Request) {
    try {
        // Auth check
        const { user } = await getServerUserSession(request);
        if (user.role !== "admin") {
            return new Response(superjson.stringify({ error: "Forbidden" }), { status: 403 });
        }

        const body = superjson.parse<InputType>(await request.text());
        const validation = schema.safeParse(body);

        if (!validation.success) {
            return new Response(superjson.stringify({ error: "Invalid input" }), { status: 400 });
        }

        const { id } = validation.data;

        // Delete related records (Likes and Comments) first to avoid FK constraints
        await db.deleteFrom("likes").where("postId", "=", id).execute();
        await db.deleteFrom("comments").where("postId", "=", id).execute();

        // Perform the deletion
        const result = await db
            .deleteFrom("blogPosts")
            .where("id", "=", id)
            .executeTakeFirst();

        if (result.numDeletedRows === BigInt(0)) {
            return new Response(superjson.stringify({ error: "Post not found or already deleted" }), { status: 404 });
        }

        return new Response(superjson.stringify({ success: true } satisfies OutputType), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        console.error("Error deleting post:", error);
        return new Response(
            superjson.stringify({ error: "Failed to delete post" }),
            { status: 500 }
        );
    }
}
