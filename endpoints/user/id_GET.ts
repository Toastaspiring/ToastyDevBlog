import { db } from "../../helpers/db";
import { OutputType } from "./id_GET.schema";
import superjson from "superjson";

export async function handle(request: Request) {
    try {
        const url = new URL(request.url);
        // Extract ID from path is tricker here without framework router match
        // Hono handles regex matching but here we are in the handler.
        // Server.ts passes `c.req.raw`, but doesn't pass params directly unless attached?
        // Let's assume standard pattern: regex in server.ts extracts it.
        // Wait, Hono `c` object has params.
        // My server.ts: 
        // app.get('/_api/users/:id', async c => { ... handle(prevRequest) ... })
        // The `request` object is `c.req.raw`. It DOES contain the full URL.
        // I can parse the ID from the URL pathname.

        const pathParts = url.pathname.split('/');
        const idStr = pathParts[pathParts.length - 1]; // /_api/users/123 -> 123
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
