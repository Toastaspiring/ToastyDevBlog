import { API_URL } from "../../helpers/api";
import { OutputType, schema } from "./created-posts_GET.schema";
import { z } from "zod";
import superjson from "superjson";

export const getUserCreatedPosts = async (
    body?: z.infer<typeof schema>,
    init?: RequestInit
): Promise<OutputType> => {
    const result = await fetch(`${API_URL}/user/created-posts`, {
        method: "GET",
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
