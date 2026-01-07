import { z } from "zod";
import { Selectable } from "kysely";
import { Events } from "../../schema.ts";

export const schema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    eventDate: z.coerce.date(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = Selectable<Events>;
