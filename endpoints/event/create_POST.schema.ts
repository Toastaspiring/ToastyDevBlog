import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { Events } from "../../helpers/schema";

export const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  eventDate: z.coerce.date(),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = Selectable<Events>;

import { API_URL } from "../../helpers/api";

export const postEventCreate = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`${API_URL}/_api/event/create`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!result.ok) {
    const errorObject = superjson.parse<{ error: string; details?: any }>(
      await result.text()
    );
    throw new Error(errorObject.error);
  }
  return superjson.parse<OutputType>(await result.text());
};