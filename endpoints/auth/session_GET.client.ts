import { API_URL } from "../../helpers/api";
import { OutputType, schema } from "./session_GET.schema";
import { z } from "zod";

export const getSession = async (
    body: z.infer<typeof schema> = {},
    init?: RequestInit
): Promise<OutputType> => {
    const result = await fetch(`${API_URL}/auth/session`, {
        method: "GET",
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
        },
    });
    return result.json();
};
