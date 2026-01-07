import { z } from "zod";
import { Selectable } from "kysely";
import { Comments, Users } from "../../schema.ts";

export const schema = z.object({
    postId: z.number().int().positive(),
    content: z.string().min(1, "Comment cannot be empty").max(1000),
});

export type InputType = z.infer<typeof schema>;

export type CommentWithUser = {
    id: Selectable<Comments>["id"];
    content: Selectable<Comments>["content"];
    createdAt: Selectable<Comments>["createdAt"];
    postId: Selectable<Comments>["postId"];
    user: {
        id: Selectable<Users>["id"];
        displayName: Selectable<Users>["displayName"];
        avatarUrl: Selectable<Users>["avatarUrl"];
    };
};

export type OutputType = CommentWithUser;
