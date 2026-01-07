import { z } from "zod";
import { Selectable } from "kysely";
import { BlogPosts, Users, Comments } from "../../schema.ts";

export const schema = z.object({
    slug: z.string(),
});

export type InputType = z.infer<typeof schema>;

export type CommentDetail = {
    id: Selectable<Comments>["id"];
    content: string;
    createdAt: Selectable<Comments>["createdAt"];
    user: {
        id: Selectable<Users>["id"];
        displayName: Selectable<Users>["displayName"];
        avatarUrl: Selectable<Users>["avatarUrl"];
    };
};

export type PostDetail = {
    id: Selectable<BlogPosts>["id"];
    title: Selectable<BlogPosts>["title"];
    slug: Selectable<BlogPosts>["slug"];
    content: Selectable<BlogPosts>["content"];
    createdAt: Selectable<BlogPosts>["createdAt"];
    author: {
        id: Selectable<Users>["id"];
        displayName: Selectable<Users>["displayName"];
        avatarUrl: Selectable<Users>["avatarUrl"];
    };
    likeCount: number;
    comments: CommentDetail[];
    published: boolean;
};

export type OutputType = PostDetail;
