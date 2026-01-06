import { z } from "zod";
import { Selectable } from "kysely";
import { BlogPosts } from "../../helpers/schema";

export const schema = z.object({
    id: z.number(),
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be kebab-case"),
    content: z.string().min(1, "Content is required"),
    published: z.boolean(),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = { success: boolean };

import superjson from "superjson";

export const updatePost = async (
    body: z.infer<typeof schema>,
    init?: RequestInit
): Promise<OutputType> => {
    const result = await fetch(`/_api/post/update`, {
        method: "PUT",
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
