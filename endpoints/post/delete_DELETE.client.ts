import superjson from "superjson";
import { API_URL } from "../../helpers/api";
import { OutputType, schema } from "./delete_DELETE.schema";
import { z } from "zod";

export const deletePost = async (
    body: z.infer<typeof schema>,
    init?: RequestInit
): Promise<OutputType> => {
    const result = await fetch(`${API_URL}/post/delete`, {
        method: "DELETE",
        body: superjson.stringify(body), // Keeping 'body' as 'validatedInput' is not defined in the current context
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
