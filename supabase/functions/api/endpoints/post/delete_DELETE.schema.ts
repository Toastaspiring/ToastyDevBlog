import { z } from "zod";
import { Selectable } from "kysely";
import { BlogPosts } from "../../schema.ts";

export const schema = z.object({
    id: z.number(),
});

export type InputType = z.infer<typeof schema>;
export type OutputType = { success: boolean };
