import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { Users } from "../../helpers/schema";

export const schema = z.object({
    id: z.coerce.number(),
});

export type InputType = z.infer<typeof schema>;

export type UserDetail = {
    id: Selectable<Users>["id"];
    displayName: Selectable<Users>["displayName"];
    avatarUrl: Selectable<Users>["avatarUrl"];
    role: Selectable<Users>["role"];
    createdAt: Selectable<Users>["createdAt"];
};

export type OutputType = UserDetail;

import { API_URL } from "../../helpers/api";

export const getUserById = async (
    id: number,
    init?: RequestInit
): Promise<OutputType> => {
    const result = await fetch(`${API_URL}/_api/users/${id}`, {
        method: "GET",
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
        },
    });
    if (!result.ok) {
        const errorObject = superjson.parse<{ error: string }>(
            await result.text()
        );
        throw new Error(errorObject.error);
    }
    return superjson.parse<OutputType>(await result.text());
};
