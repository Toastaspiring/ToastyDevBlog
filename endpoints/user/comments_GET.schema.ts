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

