import { z } from "zod";
import { Selectable } from "kysely";
import { BlogPosts } from "../../schema.ts";

export const schema = z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    slug: z
        .string()
        .min(1, "Slug is required")
        .regex(
            /^[a-z0-9-]+$/,
            "Slug must be URL-friendly (lowercase letters, numbers, and hyphens only)"
        ),
    published: z.boolean(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = Selectable<BlogPosts>;
