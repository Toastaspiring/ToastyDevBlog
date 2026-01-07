import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { Users } from "../../helpers/schema";

export const schema = z.object({
    query: z.string().min(1),
});

export type InputType = z.infer<typeof schema>;

export type UserSearchResult = {
    id: Selectable<Users>["id"];
    displayName: Selectable<Users>["displayName"];
    avatarUrl: Selectable<Users>["avatarUrl"];
};

export type OutputType = UserSearchResult[];

import { API_URL } from "../../helpers/api";

export const searchUsers = async (
    query: string,
    init?: RequestInit
): Promise<OutputType> => {
    const params = new URLSearchParams({ query });
    const result = await fetch(`${API_URL}/_api/users/search?${params.toString()}`, {
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
