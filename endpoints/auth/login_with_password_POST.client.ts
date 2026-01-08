import { API_URL } from "../../helpers/api";
import { OutputType, schema } from "./login_with_password_POST.schema";
import { z } from "zod";

export const postLogin = async (
    body: z.infer<typeof schema>,
    init?: RequestInit
): Promise<OutputType> => {
    const validatedInput = schema.parse(body);
    const result = await fetch(`${API_URL}/auth/login_with_password`, {
        method: "POST",
        body: JSON.stringify(validatedInput),
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
        },
        credentials: "include", // Important for cookies to be sent and received
    });

    if (!result.ok) {
        const errorData = await result.json();
        throw new Error(errorData.message || "Login failed");
    }

    return result.json();
};
