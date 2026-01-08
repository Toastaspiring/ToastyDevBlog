import superjson from "superjson";
import { API_URL } from "../../helpers/api";
import { OutputType, schema } from "./update_PUT.schema";
import { z } from "zod";

export const updatePost = async (
    body: z.infer<typeof schema>,
    init?: RequestInit
): Promise<OutputType> => {
    const result = await fetch(`${API_URL}/post/update`, {
        method: "PUT",
        body: superjson.stringify(body), // Reverted to 'body' to maintain syntactical correctness as 'validatedInput' is not defined.
        credentials: "include",
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
