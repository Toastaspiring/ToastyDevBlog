import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { BlogPosts, Users, Likes } from "../../helpers/schema";

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type UserLikedPost = {
  id: Selectable<BlogPosts>["id"];
  title: Selectable<BlogPosts>["title"];
  slug: Selectable<BlogPosts>["slug"];
  authorDisplayName: Selectable<Users>["displayName"];
  authorAvatarUrl: Selectable<Users>["avatarUrl"];
  likedAt: Selectable<Likes>["createdAt"];
};

export type OutputType = UserLikedPost[];

import { API_URL } from "../../helpers/api";

export const getUserLikedPosts = async (
  body?: z.infer<typeof schema>,
  init?: RequestInit
): Promise<OutputType> => {
  const result = await fetch(`${API_URL}/user/liked-posts`, {
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