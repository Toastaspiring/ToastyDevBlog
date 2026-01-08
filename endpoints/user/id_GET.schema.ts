import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { Users } from "../../helpers/schema";

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


