import { API_URL } from "../../helpers/api";
import { OutputType, schema } from "./logout_POST.schema";
import { z } from "zod";

export const postLogout = async (
    body: z.infer<typeof schema> = {},
    init?: RequestInit
): Promise<OutputType> => {
    const result = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        body: JSON.stringify(body),
        credentials: "include",
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
        },
    });
    return result.json();
};
