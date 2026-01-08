import { z } from "zod";

export const InputSchema = z.object({
    id: z.number().int().positive(),
});

export type InputType = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
    success: z.boolean(),
});

export type OutputType = z.infer<typeof OutputSchema>;
