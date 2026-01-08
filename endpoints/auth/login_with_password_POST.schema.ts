import { z } from "zod";
import { User } from "../../helpers/User";

export const schema = z.object({
  email: z.string().email("Email is required"),
  password: z.string().min(1, "Password is required"),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  user: User;
};


