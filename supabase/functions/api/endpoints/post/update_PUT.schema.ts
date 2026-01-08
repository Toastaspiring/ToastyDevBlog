import { z } from "zod";
import { Selectable } from "kysely";
import { BlogPosts } from "../../schema.ts";

export const schema = z.object({
    id: z.number(),
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be kebab-case"),
    content: z.string().min(1, "Content is required"),
    published: z.boolean(),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = { success: boolean };
