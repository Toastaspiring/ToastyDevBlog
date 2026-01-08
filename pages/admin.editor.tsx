import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
// @ts-ignore
import EasyMDE from "easymde";
import { toast } from "sonner";
import {
    Save, Loader2, Bold, Italic, Heading, Quote,
    List, ListOrdered, Link, Image as ImageIcon,
    Strikethrough, Code, Table, Minus, CheckSquare,
    Superscript, Subscript, Sigma, FoldVertical
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

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
import { PostCard } from "../components/PostCard";
import { useAuth } from "../helpers/useAuth";
import { PostWithCounts } from "../endpoints/posts_GET.schema";

import styles from "./admin.new-post.module.css";

// Unified Input Type covering both
type PostInput = CreatePostInput & { id?: number };

const EditorPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const isEditMode = !!slug;
    const navigate = useNavigate();
    const { authState } = useAuth();

    const createPostMutation = useCreatePostMutation();
    const updatePostMutation = useUpdatePostMutation();

    // Editor Instance
    const [mdeInstance, setMdeInstance] = useState<EasyMDE | null>(null);

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
                published: true, // Assuming published if passed
            });
        }
    }, [isEditMode, post, reset]);

    const titleValue = watch("title");
    const contentValue = watch("content");
    const slugValue = watch("slug");
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

    const getMdeInstanceCallback = useCallback((instance: EasyMDE) => {
        setMdeInstance(instance);
    }, []);

    const simpleMdeOptions = useMemo(
        () => ({
            autofocus: false,
            spellChecker: false,
            placeholder: "Start writing...",
            toolbar: false as any, // Disable default toolbar
            status: false as any,
        }),
        []
    );

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsSlugManuallyEdited(true);
        setValue("slug", slugify(e.target.value), { shouldValidate: true });
    };

    // Scroll Sync Refs & Logic
    const editorScrollRef = React.useRef<HTMLDivElement>(null);
    const previewScrollRef = React.useRef<HTMLDivElement>(null);
    const isScrolling = React.useRef<"editor" | "preview" | null>(null);

    const handleEditorScroll = () => {
        if (!editorScrollRef.current || !previewScrollRef.current) return;
        if (isScrolling.current === "preview") return;

        isScrolling.current = "editor";
        const editor = editorScrollRef.current;
        const preview = previewScrollRef.current;

        const percentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
        const previewScrollTop = percentage * (preview.scrollHeight - preview.clientHeight);

        preview.scrollTop = previewScrollTop;

        setTimeout(() => {
            if (isScrolling.current === "editor") isScrolling.current = null;
        }, 50);
    };

    const handlePreviewScroll = () => {
        if (!editorScrollRef.current || !previewScrollRef.current) return;
        if (isScrolling.current === "editor") return;

        isScrolling.current = "preview";
        const editor = editorScrollRef.current;
        const preview = previewScrollRef.current;

        const percentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight);
        const editorScrollTop = percentage * (editor.scrollHeight - editor.clientHeight);

        editor.scrollTop = editorScrollTop;

        setTimeout(() => {
            if (isScrolling.current === "preview") isScrolling.current = null;
        }, 50);
    };

    // Toolbar Height Sync - Callback Ref Pattern
    const [toolbarHeight, setToolbarHeight] = useState<number>(53);
    const toolbarObserver = React.useRef<ResizeObserver | null>(null);

    const setToolbarRef = useCallback((node: HTMLDivElement | null) => {
        if (toolbarObserver.current) {
            toolbarObserver.current.disconnect();
            toolbarObserver.current = null;
        }

        if (node) {
            // Initial read
            setToolbarHeight(node.offsetHeight);

            // Setup observer
            toolbarObserver.current = new ResizeObserver((entries) => {
                // We typically only have one entry here
                for (const entry of entries) {
                    // entry.target should be 'node'
                    if (entry.target === node) {
                        // We use offsetHeight to include padding/border which matches 'height' behavior in border-box
                        setToolbarHeight((entry.target as HTMLElement).offsetHeight);
                    }
                }
            });
            toolbarObserver.current.observe(node);
        }
    }, []);

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

    // Construct Preview Post Object
    const previewPost: PostWithCounts = {
        id: post?.id ?? 0,
        title: titleValue || "Untitled Post",
        slug: slugValue || "untitled",
        content: contentValue || "No content yet...",
        contentPreview: (contentValue || "").substring(0, 200),
        published: true,
        createdAt: isEditMode && post && post.createdAt ? new Date(post.createdAt) : new Date(),
        author: authState.type === "authenticated" ? {
            id: authState.user.id,
            displayName: authState.user.displayName,
            avatarUrl: authState.user.avatarUrl
        } : {
            id: 0,
            displayName: "Current User",
            avatarUrl: null
        },
        commentCount: post?.comments?.length ?? 0,
        likeCount: post?.likeCount ?? 0,
        isLiked: false,
    };

    if (isEditMode && isLoadingPost) return <div className={styles.loaderCenter}><Loader2 className={styles.spinner} size={40} /></div>;
    if (isEditMode && loadError) return <div>Error loading post.</div>;

    // Custom Toolbar Actions
    const toggleBold = (e: React.MouseEvent) => { e.preventDefault(); if (mdeInstance) EasyMDE.toggleBold(mdeInstance); };
    const toggleItalic = (e: React.MouseEvent) => { e.preventDefault(); if (mdeInstance) EasyMDE.toggleItalic(mdeInstance); };
    const toggleStrikethrough = (e: React.MouseEvent) => { e.preventDefault(); if (mdeInstance) EasyMDE.toggleStrikethrough(mdeInstance); };

    const toggleHeading = (e: React.MouseEvent) => { e.preventDefault(); if (mdeInstance) EasyMDE.toggleHeadingSmaller(mdeInstance); };
    const toggleQuote = (e: React.MouseEvent) => { e.preventDefault(); if (mdeInstance) EasyMDE.toggleBlockquote(mdeInstance); };
    const toggleCode = (e: React.MouseEvent) => { e.preventDefault(); if (mdeInstance) EasyMDE.toggleCodeBlock(mdeInstance); };

    const toggleUl = (e: React.MouseEvent) => { e.preventDefault(); if (mdeInstance) EasyMDE.toggleUnorderedList(mdeInstance); };
    const toggleOl = (e: React.MouseEvent) => { e.preventDefault(); if (mdeInstance) EasyMDE.toggleOrderedList(mdeInstance); };
    const toggleTaskList = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!mdeInstance) return;
        const cm = mdeInstance.codemirror;
        const cursor = cm.getCursor();
        const line = cm.getLine(cursor.line);
        if (line.startsWith("- [ ] ")) {
            cm.replaceRange(line.replace("- [ ] ", ""), { line: cursor.line, ch: 0 }, { line: cursor.line, ch: 6 });
        } else {
            cm.replaceRange("- [ ] " + line, { line: cursor.line, ch: 0 }, { line: cursor.line, ch: line.length });
        }
        cm.focus();
    };

    const drawLink = (e: React.MouseEvent) => { e.preventDefault(); if (mdeInstance) EasyMDE.drawLink(mdeInstance); };
    const drawImage = (e: React.MouseEvent) => { e.preventDefault(); if (mdeInstance) EasyMDE.drawImage(mdeInstance); };
    const drawTable = (e: React.MouseEvent) => { e.preventDefault(); if (mdeInstance) EasyMDE.drawTable(mdeInstance); };
    const drawHorizontalRule = (e: React.MouseEvent) => { e.preventDefault(); if (mdeInstance) EasyMDE.drawHorizontalRule(mdeInstance); };

    // Custom Wrappers
    const wrapSelection = (prefix: string, suffix: string) => {
        if (!mdeInstance) return;
        const cm = mdeInstance.codemirror;
        const selection = cm.getSelection();
        cm.replaceSelection(`${prefix}${selection}${suffix}`);
        cm.focus();
    };

    const toggleSubscript = (e: React.MouseEvent) => { e.preventDefault(); wrapSelection("~", "~"); };
    const toggleSuperscript = (e: React.MouseEvent) => { e.preventDefault(); wrapSelection("^", "^"); };
    const toggleMath = (e: React.MouseEvent) => { e.preventDefault(); wrapSelection("$", "$"); };
    const insertDetails = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!mdeInstance) return;
        const cm = mdeInstance.codemirror;
        const selection = cm.getSelection();
        const text = selection || "Content";
        cm.replaceSelection(`<details>\n<summary>Title</summary>\n${text}\n</details>`);
        cm.focus();
    };



    return (
        <>
            <Helmet>
                <title>{isEditMode ? "Edit Post" : "New Post"} - Admin</title>
            </Helmet>
            <main className={styles.mainContainer}>
                <form onSubmit={handleSubmit(onSubmit)} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <header className={styles.header}>
                        <h1 className={styles.title}>
                            {isEditMode ? "Editing Post" : "New Post"}
                        </h1>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isPending}
                                onClick={() => {
                                    setValue("published", false);
                                    handleSubmit(onSubmit)();
                                }}
                            >
                                {isEditMode ? "Unpublish (Draft)" : "Save as Draft"}
                            </Button>
                            <Button
                                type="button"
                                disabled={isPending}
                                onClick={() => {
                                    setValue("published", true);
                                    handleSubmit(onSubmit)();
                                }}
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

                    <PanelGroup direction="horizontal" className={styles.editorContainer}>
                        {/* Editor Panel */}
                        <Panel defaultSize={50} minSize={30} className={styles.panel}>
                            <div className={styles.toolbar} ref={setToolbarRef}>
                                <div className={styles.toolbarGroup}>
                                    <button onClick={toggleBold} className={styles.toolbarBtn} title="Bold">
                                        <Bold size={18} />
                                    </button>
                                    <button onClick={toggleItalic} className={styles.toolbarBtn} title="Italic">
                                        <Italic size={18} />
                                    </button>
                                    <button onClick={toggleStrikethrough} className={styles.toolbarBtn} title="Strikethrough">
                                        <Strikethrough size={18} />
                                    </button>
                                </div>
                                <div className={styles.toolbarGroup}>
                                    <button onClick={toggleHeading} className={styles.toolbarBtn} title="Heading">
                                        <Heading size={18} />
                                    </button>
                                    <button onClick={toggleQuote} className={styles.toolbarBtn} title="Quote">
                                        <Quote size={18} />
                                    </button>
                                    <button onClick={toggleCode} className={styles.toolbarBtn} title="Code">
                                        <Code size={18} />
                                    </button>
                                    <button onClick={toggleMath} className={styles.toolbarBtn} title="Math ($)">
                                        <Sigma size={18} />
                                    </button>
                                </div>
                                <div className={styles.toolbarGroup}>
                                    <button onClick={toggleUl} className={styles.toolbarBtn} title="Unordered List">
                                        <List size={18} />
                                    </button>
                                    <button onClick={toggleOl} className={styles.toolbarBtn} title="Ordered List">
                                        <ListOrdered size={18} />
                                    </button>
                                    <button onClick={toggleTaskList} className={styles.toolbarBtn} title="Task List">
                                        <CheckSquare size={18} />
                                    </button>
                                </div>
                                <div className={styles.toolbarGroup}>
                                    <button onClick={drawLink} className={styles.toolbarBtn} title="Link">
                                        <Link size={18} />
                                    </button>
                                    <button onClick={drawImage} className={styles.toolbarBtn} title="Image">
                                        <ImageIcon size={18} />
                                    </button>
                                    <button onClick={drawTable} className={styles.toolbarBtn} title="Table">
                                        <Table size={18} />
                                    </button>
                                    <button onClick={drawHorizontalRule} className={styles.toolbarBtn} title="Horizontal Rule">
                                        <Minus size={18} />
                                    </button>
                                </div>
                                <div className={styles.toolbarGroup}>
                                    <button onClick={toggleSuperscript} className={styles.toolbarBtn} title="Superscript">
                                        <Superscript size={18} />
                                    </button>
                                    <button onClick={toggleSubscript} className={styles.toolbarBtn} title="Subscript">
                                        <Subscript size={18} />
                                    </button>
                                    <button onClick={insertDetails} className={styles.toolbarBtn} title="Details (HTML)">
                                        <FoldVertical size={18} />
                                    </button>
                                </div>
                            </div>

                            <div
                                className={styles.editorScrollArea}
                                ref={editorScrollRef}
                                onScroll={handleEditorScroll}
                            >
                                <div className={styles.editorContent}>
                                    <input
                                        className={styles.titleInput}
                                        placeholder="Post Title..."
                                        {...register("title")}
                                        autoFocus={!isEditMode}
                                    />
                                    <input
                                        className={styles.slugInput}
                                        placeholder="post-slug"
                                        {...register("slug", { onChange: handleSlugChange })}
                                    />
                                    <SimpleMDE
                                        id="content"
                                        value={contentValue}
                                        onChange={handleContentChange}
                                        options={simpleMdeOptions}
                                        getMdeInstance={getMdeInstanceCallback}
                                    />
                                </div>
                            </div>
                        </Panel>

                        <PanelResizeHandle className={styles.resizeHandle} />

                        {/* Preview Panel */}
                        <Panel defaultSize={50} minSize={30} className={styles.previewPanel}>
                            <div className={styles.previewLabel} style={{ height: toolbarHeight }}>Live Preview</div>
                            <div
                                className={styles.previewScrollArea}
                                ref={previewScrollRef}
                                onScroll={handlePreviewScroll}
                            >
                                <div className={styles.previewContent}>
                                    <PostCard
                                        post={previewPost}
                                        onToggleComments={() => { }}
                                        isActive={false}
                                        previewMode={true}
                                    />
                                </div>
                            </div>
                        </Panel>
                    </PanelGroup>
                </form>
            </main>
        </>
    );
};

export default EditorPage;
