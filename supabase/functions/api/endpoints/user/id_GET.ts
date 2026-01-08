import { db } from "../../db.ts";
import { OutputType } from "./id_GET.schema.ts";
import superjson from "superjson";
import { schema } from "./id_GET.schema.ts";

export async function handle(request: Request) {
    try {
        const url = new URL(request.url);
        // Extract ID from path manually since we receive raw Request
        const pathParts = url.pathname.split('/');
        const idStr = pathParts[pathParts.length - 1];
        const id = parseInt(idStr);

        if (isNaN(id)) {
            return new Response(superjson.stringify({ error: "Invalid ID" }), { status: 400 });
        }

        const user = await db
            .selectFrom("users")
            .select(["id", "displayName", "avatarUrl", "role", "createdAt"])
            .where("id", "=", id)
            .executeTakeFirst();

        if (!user) {
            return new Response(superjson.stringify({ error: "User not found" }), { status: 404 });
        }

        return new Response(superjson.stringify(user satisfies OutputType), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        return new Response(
            superjson.stringify({ error: "Failed to fetch user" }),
            { status: 500 }
        );
    }
}
