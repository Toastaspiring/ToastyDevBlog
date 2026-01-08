import { z } from "zod";

export const schema = z.object({
    postId: z.number().int().positive(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
    liked: boolean;
};
