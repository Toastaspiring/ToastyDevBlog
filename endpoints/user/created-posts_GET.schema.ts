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

