import { Kysely } from "kysely";
import { PostgresJSDialect } from "kysely-postgres-js";
import postgres from "postgres";
import { DB } from "./schema.ts";

export const db = new Kysely<DB>({
    dialect: new PostgresJSDialect({
        postgres: postgres(Deno.env.get("DATABASE_URL")!),
    }),
});
