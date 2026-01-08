import { API_URL } from "../../helpers/api";
import { OutputType } from "./next_GET.schema";
import superjson from "superjson";

export const getEventNext = async (
    init?: RequestInit
): Promise<OutputType> => {
    const result = await fetch(`${API_URL}/event/next`, {
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
