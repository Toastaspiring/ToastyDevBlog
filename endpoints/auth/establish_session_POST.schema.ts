import { z } from "zod";

export const schema = z.object({
  tempToken: z.string().min(1, "Temporary token is required"),
});

export type InputType = z.infer<typeof schema>;

export type OutputType =
  | {
    user: {
      id: number;
      email: string;
      displayName: string;
      avatarUrl: string | null;
      role: "admin" | "user";
    };
    success: boolean;
  }
  | {
    error: string;
  };


