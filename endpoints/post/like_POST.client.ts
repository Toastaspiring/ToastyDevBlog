import superjson from "superjson";
import { API_URL } from "../../helpers/api";
import { OutputType, schema } from "./like_POST.schema";
import { z } from "zod";

export const postPostLike = async (
    body: z.infer<typeof schema>,
    init?: RequestInit
): Promise<OutputType> => {
    const validatedInput = schema.parse(body);
    const result = await fetch(`${API_URL}/post/like`, {
        method: "POST",
        body: superjson.stringify(validatedInput),
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
