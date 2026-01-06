import { db } from "../../helpers/db";
import { schema, OutputType, CommentWithUser } from "./comment_POST.schema";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import superjson from "superjson";
import { sql } from "kysely";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);

    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    // --- "GENIUS" MENTION LOGIC START ---
    let processedContent = input.content;
    const mentionRegex = /@(\w+)/g; // Match simple usernames
    const matches = [...input.content.matchAll(mentionRegex)];

    if (matches.length > 0) {
      const potentialNames = matches.map((m) => m[1]);

      // Fetch potential users
      // Note: This matches exact words. If user is "Louis", @Louis works.
      const users = await db
        .selectFrom("users")
        .select(["id", "displayName"])
        .where(sql`lower("display_name")`, "in", potentialNames.map((n) => n.toLowerCase()))
        .execute();

      // Replace with @USERID
      users.forEach((u) => {
        // Build regex to replace valid name match with ID
        // We use word boundary to avoid partial replacements if possible, though @ is a boundary
        const reg = new RegExp(`@${u.displayName}\\b`, "gi");
        processedContent = processedContent.replace(reg, `@${u.id}`);
      });
    }
    // --- "GENIUS" MENTION LOGIC END ---

    const newComment = await db
      .insertInto("comments")
      .values({
        postId: input.postId,
        content: processedContent,
        userId: user.id,
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    const createdComment = await db
      .selectFrom("comments")
      .innerJoin("users", "users.id", "comments.userId")
      .select([
        "comments.id",
        "comments.content",
        "comments.createdAt",
        "comments.postId",
        "users.id as userId",
        "users.displayName",
        "users.avatarUrl",
      ])
      .where("comments.id", "=", newComment.id)
      .executeTakeFirstOrThrow();

    // Transform back for response? User might expect to see what they typed immediately.
    // However, if we return what is saved (@USERID), the UI might show numbers.
    // Ideally we should run the reverse transformation here too so the UI updates nicely.
    // For now, let's keep it simple. If we refresh, it will be parsed. 
    // Or we can manually reconstruct it since we have the map.

    // Let's do a quick reverse for the response to be polite to the UI.
    const responseContent = input.content; // The original input is what the user expects to see immediately

    // Actually, usually you return what was saved. 
    // But if we return @123, the frontend needs to handle it.
    // The frontend logic we usually build for comments will render what returns.
    // Let's rely on the Frontend Component to parse @USERID -> @Username if we want it to work consistently.
    // But wait, my slug_GET logic does the parsing on Server.
    // So the frontend expects @Username.
    // So I MUST return @Username in the response here too, otherwise the new comment will look like @123 until refresh.

    // Simplest way: just return `input.content` (original) as the content in response, 
    // since we know we just mapped it TO id and we want to show it AS name.
    // (Assuming the mapping succeeded. If it failed, it stays as @Name, which is also what we want).

    const response: CommentWithUser = {
      id: createdComment.id,
      content: input.content, // Return original content with names
      createdAt: createdComment.createdAt,
      postId: createdComment.postId,
      user: {
        id: createdComment.userId,
        displayName: createdComment.displayName,
        avatarUrl: createdComment.avatarUrl,
      },
    };

    return new Response(superjson.stringify(response satisfies OutputType), {
      headers: { "Content-Type": "application/json" },
      status: 201,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      superjson.stringify({ error: "Failed to create comment", details: errorMessage }),
      { status: 400 }
    );
  }
}