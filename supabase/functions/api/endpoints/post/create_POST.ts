import { db } from "../../db.ts";
import { schema, OutputType } from "./create_POST.schema.ts";
import { getServerUserSession } from "../../helpers/getServerUserSession.ts";
import superjson from "superjson";

export async function handle(request: Request) {
    try {
        const { user } = await getServerUserSession(request);

        if (user.role !== "admin") {
            return new Response(
                superjson.stringify({ error: "Forbidden: Admins only" }),
                { status: 403 }
            );
        }

        const json = superjson.parse(await request.text());
        const input = schema.parse(json);

        // Check for unique slug
        const existingPost = await db
            .selectFrom("blogPosts")
            .select("id")
            .where("slug", "=", input.slug)
            .executeTakeFirst();

        if (existingPost) {
            return new Response(
                superjson.stringify({ error: "Slug is already in use" }),
                { status: 409 }
            );
        }

        const newPost = await db
            .insertInto("blogPosts")
            .values({
                title: input.title,
                content: input.content,
                slug: input.slug,
                published: input.published,
                authorId: user.id,
            })
            .returningAll()
            .executeTakeFirstOrThrow();

        return new Response(superjson.stringify(newPost satisfies OutputType), {
            headers: { "Content-Type": "application/json" },
            status: 201,
        });
    } catch (error) {
        console.error("Error creating post:", error);
        const errorMessage =
            error instanceof Error ? error.message : "An unknown error occurred";
        return new Response(
            superjson.stringify({ error: "Failed to create post", details: errorMessage }),
            { status: 400 }
        );
    }
}
