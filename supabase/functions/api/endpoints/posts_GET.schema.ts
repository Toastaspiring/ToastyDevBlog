import { z } from "zod";
import { BlogPosts } from "../schema.ts";
import { Selectable } from "kysely";

export type OutputType = (Selectable<BlogPosts> & {
    author: {
        id: number;
        displayName: string;
        avatarUrl: string | null;
    };
    likeCount: number;
    commentCount: number;
    isLiked: boolean;
    contentPreview: string; // Add this
})[];
