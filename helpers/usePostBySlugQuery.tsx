import { useQuery } from "@tanstack/react-query";
import { getPostBySlug } from "../endpoints/post/slug_GET.schema";

export const usePostBySlugQuery = (slug: string, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ["post", slug],
        queryFn: () => getPostBySlug(slug),
        enabled: (options?.enabled ?? true) && !!slug,
    });
};
