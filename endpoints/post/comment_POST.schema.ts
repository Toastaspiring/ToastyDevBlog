import { z } from "zod";
import superjson from "superjson";
import { Selectable } from "kysely";
import { Comments, Users } from "../../helpers/schema";

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

export const postPostComment = async (
  body: z.infer<typeof schema>,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/post/comment`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
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