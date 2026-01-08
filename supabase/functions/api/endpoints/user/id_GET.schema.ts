import { z } from "zod";
import { Selectable } from "kysely";
import { Users } from "../../schema.ts";

export const schema = z.object({
    id: z.coerce.number(),
});

export type InputType = z.infer<typeof schema>;

export type UserDetail = {
    id: Selectable<Users>["id"];
    displayName: Selectable<Users>["displayName"];
    avatarUrl: Selectable<Users>["avatarUrl"];
    role: Selectable<Users>["role"];
    createdAt: Selectable<Users>["createdAt"];
};

export type OutputType = UserDetail;
