import { API_URL } from "../../helpers/api";
import { OutputType } from "./search_GET.schema";
import superjson from "superjson";

export const searchUsers = async (
    query: string,
    init?: RequestInit
): Promise<OutputType> => {
    const params = new URLSearchParams({ query });
    const result = await fetch(`${API_URL}/user/search?${params.toString()}`, {
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
