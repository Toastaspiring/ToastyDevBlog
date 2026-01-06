import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import { toast } from "sonner";
import { Save, Loader2, Image, Video } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import {
    schema as updatePostSchema,
    InputType as UpdatePostInput,
} from "../endpoints/post/update_PUT.schema";
import { useUpdatePostMutation } from "../helpers/useUpdatePostMutation";
import { getPostBySlug } from "../endpoints/post/slug_GET.schema";
import { useDebounce } from "../helpers/useDebounce";
import { slugify } from "../helpers/slugify";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Switch } from "../components/Switch";
import { FormField } from "../components/FormField";
import { Spinner } from "../components/Spinner";

import styles from "./admin.new-post.module.css"; // Reuse similar styles

const EditPostPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const updatePostMutation = useUpdatePostMutation();
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(true); // Don't auto-update slug by default on edit

    // Fetch existing post
    const { data: post, isLoading, error } = useQuery({
        queryKey: ["post", slug],
        queryFn: () => getPostBySlug(slug!),
        enabled: !!slug,
    });

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<UpdatePostInput>({
        resolver: zodResolver(updatePostSchema),
        defaultValues: {
            id: 0,
            title: "",
            slug: "",
            content: "",
            published: false,
        },
    });

    // Load data into form when fetched
    useEffect(() => {
        if (post) {
            reset({
                id: post.id,
                title: post.title,
                slug: post.slug,
                content: post.content,
                published: true, // You might need to add 'published' to getPostBySlug response if it's missing
            });
            // Note: getPostBySlug output doesn't currently include 'published' status logic fully exposed in PostDetail schema?
            // Wait, PostDetail in slug_GET.schema.ts DOES NOT have 'published' field.
            // This is a small blocker. I should probably first make sure I can know the published status.
            // For now, I'll default to 'true' or fetch it differently?
            // Actually, admin usually edits drafts too. The slug_GET endpoint returns the post.
            // I need to update slug_GET to include 'published'.
        }
    }, [post, reset]);

    const titleValue = watch("title");
    const contentValue = watch("content");
    const debouncedTitle = useDebounce(titleValue, 500);

    // Stable onChange handler for SimpleMDE
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
            placeholder: "Edit your blog post content...",
            toolbar: [
                "bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|",
                "link", "image", "|", "preview", "side-by-side", "fullscreen", "|", "guide",
            ] as any,
            status: false,
        }),
        []
    );

    // Auto-slug logic (optional for edit, usually we don't want to change slug on edit unless user explicitly does)
    // Logic: Only if user hasn't manually edited slug AND they are changing title... 
    // actually for Edit, it's safer NOT to auto-change slug to avoid breaking links.

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsSlugManuallyEdited(true);
        setValue("slug", slugify(e.target.value), { shouldValidate: true });
    };

    const onSubmit = (data: UpdatePostInput) => {
        updatePostMutation.mutate(data, {
            onSuccess: () => {
                // Navigate back to dashboard
                navigate("/admin/posts");
            },
            onError: (error) => {
                // toast handled in mutation
                console.error("Post update error:", error);
            },
        });
    };

    if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Spinner size="lg" /></div>;
    if (error) return <div style={{ padding: '2rem', textAlign: 'center' }}>Error loading post</div>;

    return (
        <>
            <Helmet>
                <title>Edit Post - Admin</title>
            </Helmet>
            <main className={styles.main}>
                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    <header className={styles.header}>
                        <h1 className={styles.title}>Posts Editor</h1>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <Button
                                type="submit"
                                variant="outline"
                                disabled={updatePostMutation.isPending}
                                onClick={() => setValue("published", false)}
                            >
                                Unpublish (Draft)
                            </Button>
                            <Button
                                type="submit"
                                disabled={updatePostMutation.isPending}
                                onClick={() => setValue("published", true)}
                            >
                                {updatePostMutation.isPending ? (
                                    <Loader2 className={styles.spinner} size={20} />
                                ) : (
                                    <Save size={20} />
                                )}
                                {updatePostMutation.isPending ? "Updating..." : "Publish / Update"}
                            </Button>
                        </div>
                    </header>

                    {/* A4 Writing Sheet */}
                    <div className={styles.editorSheet}>
                        <div className={styles.sheetHeader}>
                            <input
                                className={styles.sheetTitleInput}
                                placeholder="Post Title..."
                                {...register("title")}
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

export default EditPostPage;
