// adapt this to the database schema and helpers if necessary
import { db } from "../../db.ts";
import { schema } from "./register_with_password_POST.schema.ts";
import {
    setServerSession,
    SessionExpirationSeconds,
} from "../../helpers/getSetServerSession.ts";
import { generatePasswordHash } from "../../helpers/generatePasswordHash.ts";

export async function handle(request: Request) {
    try {
        const json = await request.json();
        const { email, password, displayName } = schema.parse(json);

        // Check if email already exists
        const existingUser = await db
            .selectFrom("users")
            .select("id")
            .where("email", "=", email)
            .limit(1)
            .execute();

        if (existingUser.length > 0) {
            return Response.json(
                { message: "email already in use" },
                { status: 409 }
            );
        }

        const passwordHash = await generatePasswordHash(password);

        // Create new user
        const newUser = await db.transaction().execute(async (trx) => {
            // Insert the user
            const [user] = await trx
                .insertInto("users")
                .values({
                    email,
                    displayName,
                    role: "user", // Default role
                })
                .returning(["id", "email", "displayName", "createdAt"])
                .execute();

            // Store the password hash in another table
            await trx
                .insertInto("userPasswords")
                .values({
                    userId: user.id,
                    passwordHash,
                })
                .execute();

            return user;
        });

        // Create a new session with Deno crypto
        const randomValues = new Uint8Array(32);
        crypto.getRandomValues(randomValues);
        const sessionId = Array.from(randomValues).map(b => b.toString(16).padStart(2, '0')).join('');

        const now = new Date();
        const expiresAt = new Date(now.getTime() + SessionExpirationSeconds * 1000);

        await db
            .insertInto("sessions")
            .values({
                id: sessionId,
                userId: newUser.id,
                createdAt: now,
                lastAccessed: now,
                expiresAt,
            })
            .execute();

        // Create response with user data
        const response = Response.json({
            user: {
                ...newUser,
                role: "user" as const,
            },
        });

        // Set session cookie
        await setServerSession(response, {
            id: sessionId,
            createdAt: now.getTime(),
            lastAccessed: now.getTime(),
        });

        return response;
    } catch (error: unknown) {
        console.error("Registration error:", error);
        const errorMessage =
            error instanceof Error ? error.message : "Registration failed";
        return Response.json({ message: errorMessage }, { status: 400 });
    }
}
