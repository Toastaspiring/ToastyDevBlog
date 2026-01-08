import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { Events, Users } from "../../helpers/schema";

// No input schema for a simple GET request
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

