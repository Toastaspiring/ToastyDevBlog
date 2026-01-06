import { useQuery } from "@tanstack/react-query";
import { getPostBySlug } from "../endpoints/post/slug_GET.schema";

export const usePostBySlugQuery = (slug: string) => {
    return useQuery({
        queryKey: ["post", slug],
        queryFn: () => getPostBySlug(slug),
        enabled: !!slug,
    });
};
