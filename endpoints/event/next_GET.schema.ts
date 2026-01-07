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

import { API_URL } from "../../helpers/api";

export const getEventNext = async (
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`${API_URL}/_api/event/next`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!result.ok) {
    const errorObject = superjson.parse<{ error: string }>(
      await result.text()
    );
    throw new Error(errorObject.error);
  }
  return superjson.parse<OutputType>(await result.text());
};