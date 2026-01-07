import { z } from "zod";
import { User } from "../../helpers/User.ts";

export const schema = z.object({
    email: z.string().email("Email is required"),
    password: z.string().min(1, "Password is required"),
});

export type OutputType = {
    user: User;
};
