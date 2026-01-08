import { API_URL } from "../../helpers/api";
import { InputType, OutputType } from "./delete_DELETE.schema";
import superjson from "superjson";

export async function deleteEvent(input: InputType): Promise<OutputType> {
    const result = await fetch(`${API_URL}/event/delete?id=${input.id}`, {
        method: "DELETE",
        credentials: "include",
    });

    if (!result.ok) {
        const errorObject = superjson.parse<{ error: string }>(
            await result.text()
        );
        throw new Error(errorObject.error);
    }

    return superjson.parse<OutputType>(await result.text());
}
