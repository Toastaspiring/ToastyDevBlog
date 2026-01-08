import { API_URL } from "../../helpers/api";
import { OutputType } from "./comments_GET.schema";
import superjson from "superjson";

export const getUserComments = async (
    params?: { userId?: number },
    init?: RequestInit
): Promise<OutputType> => {
    const query = params?.userId ? `?userId=${params.userId}` : '';
    const result = await fetch(`${API_URL}/user/comments${query}`, {
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
