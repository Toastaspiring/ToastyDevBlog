import { useQuery } from "@tanstack/react-query";
import { getUserById } from "../endpoints/user/id_GET.schema";

export const useUserByIdQuery = (id: number) => {
    return useQuery({
        queryKey: ["user", id],
        queryFn: () => getUserById(id),
        enabled: !isNaN(id),
    });
};
