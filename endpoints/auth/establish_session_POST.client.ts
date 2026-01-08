import { API_URL } from "../../helpers/api";
import { InputType, OutputType, schema } from "./establish_session_POST.schema";
import { z } from "zod";

export const postEstablishSession = async (
    body: InputType,
    init?: RequestInit
): Promise<OutputType> => {
    const validatedInput = schema.parse(body);
    const result = await fetch(`${API_URL}/auth/establish_session`, {
        method: "POST",
        body: JSON.stringify(validatedInput),
        credentials: "include",
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
        },
    });
    return result.json();
};
