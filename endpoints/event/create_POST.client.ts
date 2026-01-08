import { API_URL } from "../../helpers/api";
import { OutputType, schema } from "./create_POST.schema";
import { z } from "zod";
import superjson from "superjson";

export type InputType = z.infer<typeof schema>;

export const postEventCreate = async (
    body: InputType,
    init?: RequestInit
): Promise<OutputType> => {
    const validatedInput = schema.parse(body);
    const result = await fetch(`${API_URL}/event/create`, {
        method: "POST",
        body: superjson.stringify(validatedInput),
        credentials: "include",
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
        },
    });
    if (!result.ok) {
        const errorObject = superjson.parse<{ error: string; details?: any }>(
            await result.text()
        );
        throw new Error(errorObject.error);
    }
    return superjson.parse<OutputType>(await result.text());
};
