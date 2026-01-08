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

