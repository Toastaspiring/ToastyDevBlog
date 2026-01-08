import { API_URL } from "../../helpers/api";
import { OutputType } from "./id_GET.schema";
import superjson from "superjson";

export const getUserById = async (
    id: number,
    init?: RequestInit
): Promise<OutputType> => {
    const result = await fetch(`${API_URL}/users/${id}`, {
        method: "GET",
        credentials: "include",
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
        },
    });
    if (!result.ok) {
        const errorObject = superjson.parse<{ error: string }>(
            await result.text()
        );
        throw new Error(errorObject.error);
    }
    return superjson.parse<OutputType>(await result.text());
};
