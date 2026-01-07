import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { BlogPosts } from "../../helpers/schema";

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type UserCreatedPost = {
  id: Selectable<BlogPosts>["id"];
  title: Selectable<BlogPosts>["title"];
  slug: Selectable<BlogPosts>["slug"];
  published: Selectable<BlogPosts>["published"];
  createdAt: Selectable<BlogPosts>["createdAt"];
  likeCount: number;
  commentCount: number;
};

export type OutputType = UserCreatedPost[];

import { API_URL } from "../../helpers/api";

export const getUserCreatedPosts = async (
  body?: z.infer<typeof schema>,
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`${API_URL}/_api/user/created-posts`, {
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