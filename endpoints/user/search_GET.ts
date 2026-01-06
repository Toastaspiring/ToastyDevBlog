import { db } from "../../helpers/db";
import { OutputType } from "./search_GET.schema";
import superjson from "superjson";
import { sql } from "kysely";

export async function handle(request: Request) {
    try {
        const url = new URL(request.url);
        const query = url.searchParams.get("query");

        if (!query) {
            return new Response(superjson.stringify([]), {
                headers: { "Content-Type": "application/json" },
                status: 200, // Empty list for empty query is fine
            });
        }

        const users = await db
            .selectFrom("users")
            .select(["id", "displayName", "avatarUrl"])
            .where(sql`lower("display_name")`, "like", `%${query.toLowerCase()}%`)
            .limit(5)
            .execute();

        return new Response(superjson.stringify(users satisfies OutputType), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        console.error("Error searching users:", error);
        return new Response(
            superjson.stringify({ error: "Failed to search users" }),
            { status: 500 }
        );
    }
}
