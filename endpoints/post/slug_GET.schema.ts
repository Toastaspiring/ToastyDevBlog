import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { BlogPosts, Users, Comments } from "../../helpers/schema";

export const schema = z.object({
    slug: z.string(),
});

export type InputType = z.infer<typeof schema>;

export type CommentDetail = {
    id: Selectable<Comments>["id"];
    content: string; // Already transformed to have @Username
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
    content: Selectable<BlogPosts>["content"]; // Full content
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

import { API_URL } from "../../helpers/api";

export const getPostBySlug = async (
    slug: string,
    init?: RequestInit
): Promise<OutputType> => {
    const result = await fetch(`${API_URL}/_api/post/by-slug/${slug}`, {
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
