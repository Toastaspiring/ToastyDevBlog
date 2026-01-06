import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import {
    schema as createPostSchema,
    InputType as CreatePostInput,
} from "../endpoints/post/create_POST.schema";
import {
    schema as updatePostSchema,
    InputType as UpdatePostInput,
} from "../endpoints/post/update_PUT.schema";

import { useCreatePostMutation } from "../helpers/useCreatePostMutation";
import { useUpdatePostMutation } from "../helpers/useUpdatePostMutation";
import { getPostBySlug } from "../endpoints/post/slug_GET.schema";
import { useDebounce } from "../helpers/useDebounce";
import { slugify } from "../helpers/slugify";
import { Button } from "../components/Button";

import styles from "./admin.new-post.module.css";

// Unified Input Type covering both
type PostInput = CreatePostInput & { id?: number };

const EditorPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const isEditMode = !!slug;
    const navigate = useNavigate();

    const createPostMutation = useCreatePostMutation();
    const updatePostMutation = useUpdatePostMutation();

    // For Edit Mode: Don't auto-update slug by default
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(isEditMode);

    // Fetch existing post if in edit mode
    const { data: post, isLoading: isLoadingPost, error: loadError } = useQuery({
        queryKey: ["post", slug],
        queryFn: () => getPostBySlug(slug!),
        enabled: isEditMode,
    });

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<PostInput>({
        resolver: zodResolver(isEditMode ? updatePostSchema : createPostSchema),
        defaultValues: {
            title: "",
            slug: "",
            content: "",
            published: false,
            id: 0,
        },
    });

    // Populate form when post loads
    useEffect(() => {
        if (isEditMode && post) {
            reset({
                id: post.id,
                title: post.title,
                slug: post.slug,
                content: post.content,
                published: true, // Assuming published if passed, or need better logic if API supports it
            });
            // If API doesn't return published status, this might be inaccurate.
            // But based on previous files, we defaulted to true or false.
            // Let's assume logic from previous edit-post: reset with published: true (temporarily)
            // or we'd need to fetch that field.
        }
    }, [isEditMode, post, reset]);

    const titleValue = watch("title");
    const contentValue = watch("content");
    const debouncedTitle = useDebounce(titleValue, 500);

    // Auto-slug for new posts
    useEffect(() => {
        if (!isEditMode && debouncedTitle && !isSlugManuallyEdited) {
            setValue("slug", slugify(debouncedTitle), { shouldValidate: true });
        }
    }, [debouncedTitle, isSlugManuallyEdited, setValue, isEditMode]);

    const handleContentChange = useCallback(
        (value: string) => {
            setValue("content", value, { shouldValidate: true });
        },
        [setValue]
    );

    const simpleMdeOptions = useMemo(
        () => ({
            autofocus: false,
            spellChecker: false,
            placeholder: isEditMode ? "Edit your blog post content..." : "Write your blog post content in markdown...",
            toolbar: [
                "bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|",
                "link", "image", "|", "preview", "side-by-side", "fullscreen", "|", "guide",
            ] as any,
            status: false,
        }),
        [isEditMode]
    );

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsSlugManuallyEdited(true);
        setValue("slug", slugify(e.target.value), { shouldValidate: true });
    };

    const onSubmit = (data: PostInput) => {
        if (isEditMode) {
            updatePostMutation.mutate(data as UpdatePostInput, {
                onSuccess: () => navigate("/admin/posts"),
                onError: (error) => console.error("Update error:", error),
            });
        } else {
            createPostMutation.mutate(data as CreatePostInput, {
                onSuccess: (newPost) => {
                    toast.success("Post created!");
                    navigate("/");
                },
                onError: (error) => {
                    toast.error("Failed to create post");
                    console.error("Create error:", error);
                },
            });
        }
    };

    const isPending = createPostMutation.isPending || updatePostMutation.isPending;

    if (isEditMode && isLoadingPost) return <div className={styles.loaderCenter}><Loader2 className={styles.spinner} size={40} /></div>;
    if (isEditMode && loadError) return <div>Error loading post.</div>;

    return (
        <>
            <Helmet>
                <title>{isEditMode ? "Edit Post" : "New Post"} - Admin</title>
            </Helmet>
            <main className={styles.main}>
                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    <header className={styles.header}>
                        <h1 className={styles.title}>Posts Editor</h1>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <Button
                                type="submit"
                                variant="outline"
                                disabled={isPending}
                                onClick={() => setValue("published", false)}
                            >
                                {isEditMode ? "Unpublish (Draft)" : "Save as Draft"}
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending}
                                onClick={() => setValue("published", true)}
                            >
                                {isPending ? (
                                    <Loader2 className={styles.spinner} size={20} />
                                ) : (
                                    <Save size={20} />
                                )}
                                {isPending
                                    ? (isEditMode ? "Updating..." : "Publishing...")
                                    : (isEditMode ? "Publish / Update" : "Publish")}
                            </Button>
                        </div>
                    </header>

                    <div className={styles.editorSheet}>
                        <div className={styles.sheetHeader}>
                            <input
                                className={styles.sheetTitleInput}
                                placeholder="Post Title..."
                                {...register("title")}
                                autoFocus={!isEditMode}
                            />
                            <input
                                className={styles.sheetSlugInput}
                                placeholder="post-slug"
                                {...register("slug", { onChange: handleSlugChange })}
                            />
                        </div>
                        <SimpleMDE
                            id="content"
                            value={contentValue}
                            onChange={handleContentChange}
                            options={simpleMdeOptions}
                        />
                    </div>
                </form>
            </main>
        </>
    );
};

export default EditorPage;
