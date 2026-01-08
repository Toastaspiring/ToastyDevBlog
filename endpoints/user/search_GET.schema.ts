import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { Users } from "../../helpers/schema";

export const schema = z.object({
    query: z.string().min(1),
});

export type InputType = z.infer<typeof schema>;

export type UserSearchResult = {
    id: Selectable<Users>["id"];
    displayName: Selectable<Users>["displayName"];
    avatarUrl: Selectable<Users>["avatarUrl"];
};

export type OutputType = UserSearchResult[];


