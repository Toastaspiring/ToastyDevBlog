import { z } from "zod";
import { Selectable } from "kysely";
import { BlogPosts } from "../../helpers/schema";

export const schema = z.object({
    id: z.number(),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = { success: boolean };

import superjson from "superjson";

export const deletePost = async (
    body: z.infer<typeof schema>,
    init?: RequestInit
): Promise<OutputType> => {
    const result = await fetch(`/_api/post/delete`, {
        method: "DELETE",
        body: superjson.stringify(body),
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
