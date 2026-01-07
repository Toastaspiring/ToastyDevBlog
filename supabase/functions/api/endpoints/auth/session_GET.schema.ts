import { z } from "zod";
import { User } from "../../helpers/User.ts";

// no schema, just a simple GET request
export const schema = z.object({});

export type OutputType =
    | {
        user: User;
    }
    | {
        error: string;
    };
