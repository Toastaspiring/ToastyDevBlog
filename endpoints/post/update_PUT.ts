import { db } from "../../helpers/db";
import { InputType, OutputType, schema } from "./update_PUT.schema";
import superjson from "superjson";

export async function handle(request: Request) {
    try {
        const body = superjson.parse<InputType>(await request.text());
        const validation = schema.safeParse(body);

        if (!validation.success) {
            return new Response(superjson.stringify({ error: "Invalid input", details: validation.error }), { status: 400 });
        }

        const { id, title, slug, content, published } = validation.data;

        // Check if slug exists for OTHER posts
        const existingSlug = await db
            .selectFrom("blogPosts")
            .select("id")
            .where("slug", "=", slug)
            .where("id", "!=", id)
            .executeTakeFirst();

        if (existingSlug) {
            return new Response(superjson.stringify({ error: "Slug already in use" }), { status: 409 });
        }

        // Perform the update
        const result = await db
            .updateTable("blogPosts")
            .set({
                title,
                slug,
                content,
                published,
                updatedAt: new Date().toISOString(), // Ensure updatedAt is set
            })
            .where("id", "=", id)
            .executeTakeFirst();

        if (result.numUpdatedRows === BigInt(0)) {
            return new Response(superjson.stringify({ error: "Post not found" }), { status: 404 });
        }

        return new Response(superjson.stringify({ success: true } satisfies OutputType), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        console.error("Error updating post:", error);
        return new Response(
            superjson.stringify({ error: "Failed to update post" }),
            { status: 500 }
        );
    }
}
