import { z } from "zod";
import { Selectable } from "kysely";
import { Events, Users } from "../../schema.ts";

export const schema = z.object({});

export type OutputType =
    | (Pick<
        Selectable<Events>,
        "id" | "title" | "description" | "eventDate" | "createdAt"
    > & {
        creatorDisplayName: Selectable<Users>["displayName"];
        creatorAvatarUrl: Selectable<Users>["avatarUrl"];
    })
    | null;
