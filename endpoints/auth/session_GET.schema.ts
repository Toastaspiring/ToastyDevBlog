import { z } from "zod";
import { User } from "../../helpers/User";

// no schema, just a simple GET request
export const schema = z.object({});

export type OutputType =
  | {
    user: User;
  }
  | {
    error: string;
  };

import { API_URL } from "../../helpers/api";

// ... existing imports

export const getSession = async (
  body: z.infer<typeof schema> = {},
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`${API_URL}/auth/session`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  return result.json();
};
