import { API_URL } from "../helpers/api";
import { OutputType, schema } from "./posts_GET.schema";
import { z } from "zod";
import superjson from "superjson";

export const getPosts = async (
    body?: z.infer<typeof schema>,
    init?: RequestInit
): Promise<OutputType> => {
    const queryParams = new URLSearchParams();
    if (body?.mode) queryParams.set("mode", body.mode);

    const result = await fetch(`${API_URL}/posts?${queryParams.toString()}`, {
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
