import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { BlogPosts, Users } from "../helpers/schema";

export const schema = z.object({
  mode: z.enum(["public", "admin"]).optional(),
});

export type InputType = z.infer<typeof schema>;

export type PostWithCounts = {
  id: Selectable<BlogPosts>["id"];
  title: Selectable<BlogPosts>["title"];
  slug: Selectable<BlogPosts>["slug"];
  content: Selectable<BlogPosts>["content"];
  contentPreview: string;
  createdAt: Selectable<BlogPosts>["createdAt"];
  published: boolean;
  author: {
    id: Selectable<Users>["id"];
    displayName: Selectable<Users>["displayName"];
    avatarUrl: Selectable<Users>["avatarUrl"];
  };
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
};

export type OutputType = PostWithCounts[];

