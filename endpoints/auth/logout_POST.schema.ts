import { z } from "zod";

// No input required for logout
export const schema = z.object({});

export type OutputType =
  | {
    success: boolean;
    message: string;
  }
  | {
    error: string;
    message?: string;
  };


