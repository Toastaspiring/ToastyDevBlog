import { API_URL } from "../../helpers/api";
import superjson from "superjson";
import { OutputType } from "./create_POST.schema"; // Reusing OutputType from create as it's likely the same (Event)

export const updateEvent = async (
    input: {
        id: number;
        title: string;
        description?: string;
        eventDate: Date;
    },
    init?: RequestInit
): Promise<OutputType> => {
    const result = await fetch(`${API_URL}/event/update`, {
        method: "PUT",
        credentials: "include",
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
        },
        body: superjson.stringify(input),
    });

    if (!result.ok) {
        const errorObject = superjson.parse<{ error: string }>(
            await result.text()
        );
        throw new Error(errorObject.error);
    }
    return superjson.parse<OutputType>(await result.text());
};
