import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { Comments, BlogPosts } from "../../helpers/schema";

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type UserComment = {
  id: Selectable<Comments>["id"];
  content: Selectable<Comments>["content"];
  createdAt: Selectable<Comments>["createdAt"];
  postTitle: Selectable<BlogPosts>["title"];
  postSlug: Selectable<BlogPosts>["slug"];
};

export type OutputType = UserComment[];

import { API_URL } from "../../helpers/api";

export const getUserComments = async (
  params?: { userId?: number },
  init?: RequestInit
): Promise<OutputType> => {
  const query = params?.userId ? `?userId=${params.userId}` : '';
  const result = await fetch(`${API_URL}/_api/user/comments${query}`, {
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