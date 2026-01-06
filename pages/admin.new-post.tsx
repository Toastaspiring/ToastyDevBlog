import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import { toast } from "sonner";
import { Save, Loader2, Image, Video } from "lucide-react";

import {
  schema as createPostSchema,
  InputType as CreatePostInput,
} from "../endpoints/post/create_POST.schema";
import { useCreatePostMutation } from "../helpers/useCreatePostMutation";
import { useDebounce } from "../helpers/useDebounce";
import { slugify } from "../helpers/slugify";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Switch } from "../components/Switch";
import { FormField } from "../components/FormField";

import styles from "./admin.new-post.module.css";

const NewPostPage: React.FC = () => {
  const navigate = useNavigate();
  const createPostMutation = useCreatePostMutation();
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      published: false,
    },
  });

  const titleValue = watch("title");
  const contentValue = watch("content");
  const debouncedTitle = useDebounce(titleValue, 500);

  // Stable onChange handler for SimpleMDE to prevent focus loss
  const handleContentChange = useCallback(
    (value: string) => {
      setValue("content", value, { shouldValidate: true });
    },
    [setValue]
  );

  // Memoize SimpleMDE options to prevent reinitialization
  const simpleMdeOptions = useMemo(
    () => ({
      autofocus: false,
      spellChecker: false,
      placeholder: "Write your blog post content in markdown...",
      toolbar: [
        "bold",
        "italic",
        "heading",
        "|",
        "quote",
        "unordered-list",
        "ordered-list",
        "|",
        "link",
        "image",
        "|",
        "preview",
        "side-by-side",
        "fullscreen",
        "|",
        "guide",
      ] as any,
      status: false,
    }),
    []
  );

  useEffect(() => {
    if (debouncedTitle && !isSlugManuallyEdited) {
      setValue("slug", slugify(debouncedTitle), { shouldValidate: true });
    }
  }, [debouncedTitle, isSlugManuallyEdited, setValue]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true);
    setValue("slug", slugify(e.target.value), { shouldValidate: true });
  };

  const onSubmit = (data: CreatePostInput) => {
    createPostMutation.mutate(data, {
      onSuccess: (newPost) => {
        toast.success("Post created successfully!", {
          description: `"${newPost.title}" has been published.`,
        });
        navigate("/");
      },
      onError: (error) => {
        toast.error("Failed to create post", {
          description:
            error instanceof Error ? error.message : "An unknown error occurred.",
        });
        console.error("Post creation error:", error);
      },
    });
  };

  return (
    <>
      <Helmet>
        <title>New Post - Admin</title>
        <meta name="description" content="Create a new blog post." />
      </Helmet>
      <main className={styles.main}>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <header className={styles.header}>
            <h1 className={styles.title}>Posts Editor</h1>
            <div style={{ display: "flex", gap: "10px" }}>
              <Button
                type="submit"
                variant="outline"
                disabled={createPostMutation.isPending}
                onClick={() => setValue("published", false)}
              >
                Save as Draft
              </Button>
              <Button
                type="submit"
                disabled={createPostMutation.isPending}
                onClick={() => setValue("published", true)}
              >
                {createPostMutation.isPending ? (
                  <Loader2 className={styles.spinner} size={20} />
                ) : (
                  <Save size={20} />
                )}
                {createPostMutation.isPending ? "Publishing..." : "Publish"}
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
                autoFocus
              />
              <input
                className={styles.sheetSlugInput}
                placeholder="post-slug"
                {...register("slug", {
                  onChange: handleSlugChange,
                })}
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

export default NewPostPage;