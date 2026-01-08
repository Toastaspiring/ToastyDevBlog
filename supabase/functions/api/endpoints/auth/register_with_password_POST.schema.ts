import { z } from "zod";
import { User } from "../../helpers/User.ts";

export const schema = z.object({
    email: z.string().email("Email is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    displayName: z.string().min(1, "Name is required"),
});

export type OutputType = {
    user: User;
};
