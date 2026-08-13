"use client";

import {
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  Heart,
  LoaderCircle,
  MessageSquareText,
  Pencil,
  Plus,
  Send,
  Share2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  FormEvent,
  ReactNode,
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FcGoogle } from "react-icons/fc";
import { SiGithub } from "react-icons/si";

import {
  portfolioApiUrl,
  usePortfolioAuth,
} from "@/components/auth/PortfolioAuthProvider";

type BlogPostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
  imageAlt?: string;
  published: boolean;
  likeCount: number;
  shareCount: number;
  commentCount: number;
  publishedAt?: string;
  updatedAt: string;
};

type BlogComment = {
  id: string;
  content: string;
  author: { displayName: string; avatarUrl?: string };
  likeCount: number;
  likedByViewer: boolean;
  ownedByViewer: boolean;
  edited: boolean;
  createdAt: string;
  updatedAt: string;
};

type BlogPostDetail = BlogPostSummary & {
  content: string;
  attachmentLabel?: string;
  attachmentUrl?: string;
  likedByViewer: boolean;
  comments: BlogComment[];
};

type BlogPostInput = {
  title: string;
  excerpt: string;
  imageUrl: string;
  imageAlt: string;
  content: string;
  attachmentLabel: string;
  attachmentUrl: string;
  published: boolean;
};

type BlogImageUpload = {
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
};

type BlogExperienceProps = {
  initialSlug?: string;
  mode?: "index" | "article";
};

const blankPost: BlogPostInput = {
  title: "",
  excerpt: "",
  imageUrl: "",
  imageAlt: "",
  content: "",
  attachmentLabel: "",
  attachmentUrl: "",
  published: true,
};

const MAX_ARTICLE_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_ARTICLE_IMAGE_MB = MAX_ARTICLE_IMAGE_BYTES / 1024 / 1024;
const MAX_ARTICLE_ATTACHMENT_BYTES = 25 * 1024 * 1024;
const MAX_ARTICLE_ATTACHMENT_MB = MAX_ARTICLE_ATTACHMENT_BYTES / 1024 / 1024;
const ARTICLE_ATTACHMENT_ACCEPT =
  ".pdf,.zip,.rar,.txt,.md,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv";

async function readJson<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => null)) as T | null;
  if (!response.ok || body === null) throw new Error("Blog request failed.");
  return body;
}

function formattedDate(value?: string) {
  if (!value) return "Draft";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(
        <strong key={`${match.index}-bold`}>{token.slice(2, -2)}</strong>,
      );
    } else {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) {
        nodes.push(
          <a
            key={`${match.index}-link`}
            href={link[2]}
            target="_blank"
            rel="noreferrer noopener"
          >
            {link[1]} <ExternalLink aria-hidden="true" size={13} />
          </a>,
        );
      }
    }
    cursor = match.index + token.length;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

function RichArticle({ content }: { content: string }) {
  const [copiedCode, setCopiedCode] = useState<number | null>(null);
  const lines = content.split("\n");
  const nodes: ReactNode[] = [];
  let index = 0;
  let codeIndex = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (line.startsWith("```")) {
      const language = line.slice(3).trim();
      const codeLines: string[] = [];
      index++;
      while (index < lines.length && !lines[index].startsWith("```")) {
        codeLines.push(lines[index]);
        index++;
      }
      const code = codeLines.join("\n");
      const currentCodeIndex = codeIndex++;
      nodes.push(
        <figure className="blog-code-block" key={`code-${currentCodeIndex}`}>
          <figcaption>
            <span>{language || "Code"}</span>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(code);
                setCopiedCode(currentCodeIndex);
                window.setTimeout(() => setCopiedCode(null), 1600);
              }}
            >
              <Copy aria-hidden="true" />
              {copiedCode === currentCodeIndex ? "Copied" : "Copy"}
            </button>
          </figcaption>
          <pre>
            <code>{code}</code>
          </pre>
        </figure>,
      );
    } else if (line.startsWith("## ")) {
      nodes.push(<h2 key={index}>{renderInline(line.slice(3))}</h2>);
    } else if (line.startsWith("### ")) {
      nodes.push(<h3 key={index}>{renderInline(line.slice(4))}</h3>);
    } else if (line.startsWith("- ")) {
      const items: string[] = [];
      while (index < lines.length && lines[index].startsWith("- ")) {
        items.push(lines[index].slice(2));
        index++;
      }
      nodes.push(
        <ul key={`list-${index}`}>
          {items.map((item) => (
            <li key={item}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    } else if (line.trim()) {
      nodes.push(<p key={index}>{renderInline(line)}</p>);
    }
    index++;
  }

  return <article className="blog-article-body">{nodes}</article>;
}

function BlogIndexSkeleton() {
  return (
    <div className="blog-index-grid" aria-label="Loading blog articles">
      {Array.from({ length: 2 }, (_, index) => (
        <article className="blog-index-card blog-index-skeleton" key={index}>
          <span className="skeleton skeleton-media" />
          <div className="blog-index-card-header">
            <span className="skeleton skeleton-line skeleton-line-short" />
            <span className="skeleton skeleton-line skeleton-line-title" />
          </div>
          <div className="skeleton-card-copy">
            <span className="skeleton skeleton-line skeleton-line-wide" />
            <span className="skeleton skeleton-line" />
            <span className="skeleton skeleton-line skeleton-line-short" />
          </div>
          <footer className="blog-card-meta">
            <span className="skeleton skeleton-pill skeleton-pill-small" />
            <span className="skeleton skeleton-pill skeleton-pill-small" />
          </footer>
        </article>
      ))}
    </div>
  );
}

function BlogArticleSkeleton() {
  return (
    <article
      className="blog-article blog-article-skeleton"
      aria-label="Loading article"
    >
      <header>
        <span className="skeleton skeleton-line skeleton-line-short" />
        <span className="skeleton skeleton-line skeleton-line-title" />
        <span className="skeleton skeleton-line skeleton-line-wide" />
        <span className="skeleton skeleton-line" />
      </header>
      <span className="skeleton skeleton-media blog-article-skeleton-image" />
      <div className="blog-article-body">
        <span className="skeleton skeleton-line skeleton-line-wide" />
        <span className="skeleton skeleton-line skeleton-line-wide" />
        <span className="skeleton skeleton-line" />
        <span className="skeleton skeleton-line skeleton-line-short" />
      </div>
    </article>
  );
}

export function BlogExperience({
  initialSlug,
  mode = "index",
}: BlogExperienceProps) {
  const { session, providers, signIn, csrfHeaders } = usePortfolioAuth();
  const editorRef = useRef<HTMLFormElement | null>(null);
  const editorTitleRef = useRef<HTMLInputElement | null>(null);
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [activePost, setActivePost] = useState<BlogPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState("");
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentUploadError, setAttachmentUploadError] = useState("");
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState<BlogPostDetail | null>(null);
  const [draft, setDraft] = useState<BlogPostInput>(blankPost);
  const [editorOpen, setEditorOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [articleMenuOpen, setArticleMenuOpen] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    () => new Set(),
  );

  const loadPost = useCallback(async (slug: string) => {
    const detail = await readJson<BlogPostDetail>(
      await fetch(`${portfolioApiUrl}/api/v1/blog/posts/${slug}`, {
        credentials: "include",
        cache: "no-store",
      }),
    );
    setCommentsOpen(false);
    setArticleMenuOpen(false);
    setActivePost(detail);
  }, []);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = session.admin
        ? "/api/v1/blog/admin/posts"
        : "/api/v1/blog/posts";
      const list = await readJson<BlogPostSummary[]>(
        await fetch(`${portfolioApiUrl}${endpoint}`, {
          credentials: "include",
          cache: "no-store",
        }),
      );
      setPosts(list);
      if (initialSlug) await loadPost(initialSlug);
      else setActivePost(null);
    } catch {
      setFeedback("The blog is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }, [initialSlug, loadPost, session.admin]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadPosts(), 0);
    return () => window.clearTimeout(timer);
  }, [loadPosts]);

  const activeIndex = useMemo(
    () => posts.findIndex((post) => post.id === activePost?.id),
    [activePost?.id, posts],
  );

  useEffect(() => {
    if (!commentsOpen && !articleMenuOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setCommentsOpen(false);
      if (event.key === "Escape") setArticleMenuOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [articleMenuOpen, commentsOpen]);

  async function authenticatedRequest<T>(path: string, init: RequestInit) {
    return readJson<T>(
      await fetch(`${portfolioApiUrl}${path}`, {
        ...init,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(await csrfHeaders()),
          ...init.headers,
        },
      }),
    );
  }

  async function togglePostLike() {
    if (!activePost || !session.authenticated) return;
    setBusy(true);
    try {
      const result = await authenticatedRequest<{
        likeCount: number;
        likedByViewer: boolean;
      }>(`/api/v1/blog/posts/${activePost.id}/likes`, { method: "POST" });
      setActivePost({ ...activePost, ...result });
      setPosts((current) =>
        current.map((post) =>
          post.id === activePost.id
            ? { ...post, likeCount: result.likeCount }
            : post,
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  async function shareArticle() {
    if (!activePost || busy) return;
    const shareUrl = `${window.location.origin}/blog/${activePost.slug}`;
    setBusy(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: activePost.title,
          text: activePost.excerpt,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setFeedback("Article link copied.");
      }
      const result = await readJson<{ shareCount: number }>(
        await fetch(
          `${portfolioApiUrl}/api/v1/blog/posts/${activePost.id}/shares`,
          {
            method: "POST",
            credentials: "include",
          },
        ),
      );
      setActivePost({ ...activePost, shareCount: result.shareCount });
      setPosts((current) =>
        current.map((post) =>
          post.id === activePost.id
            ? { ...post, shareCount: result.shareCount }
            : post,
        ),
      );
    } catch {
      setFeedback("Sharing was cancelled or unavailable.");
    } finally {
      setBusy(false);
    }
  }

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activePost || comment.trim().length < 2) return;
    setBusy(true);
    try {
      const saved = await authenticatedRequest<BlogComment>(
        `/api/v1/blog/posts/${activePost.id}/comments`,
        { method: "POST", body: JSON.stringify({ content: comment.trim() }) },
      );
      setActivePost({
        ...activePost,
        comments: [saved, ...activePost.comments],
        commentCount: activePost.commentCount + 1,
      });
      setComment("");
      setCommentsOpen(true);
    } finally {
      setBusy(false);
    }
  }

  async function toggleCommentLike(commentId: string) {
    if (!activePost || !session.authenticated) return;
    const result = await authenticatedRequest<{
      likeCount: number;
      likedByViewer: boolean;
    }>(`/api/v1/blog/comments/${commentId}/likes`, { method: "POST" });
    setActivePost({
      ...activePost,
      comments: activePost.comments.map((item) =>
        item.id === commentId ? { ...item, ...result } : item,
      ),
    });
  }

  async function deleteComment(commentId: string) {
    if (!activePost) return;
    const response = await fetch(
      `${portfolioApiUrl}/api/v1/blog/comments/${commentId}`,
      {
        method: "DELETE",
        credentials: "include",
        headers: await csrfHeaders(),
      },
    );
    if (!response.ok) return;
    setActivePost({
      ...activePost,
      comments: activePost.comments.filter((item) => item.id !== commentId),
      commentCount: Math.max(0, activePost.commentCount - 1),
    });
  }

  function toggleCommentExpansion(commentId: string) {
    setExpandedComments((current) => {
      const next = new Set(current);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  }

  function shouldShowReadMore(content: string) {
    return content.length > 220 || content.split("\n").length > 4;
  }

  function focusEditor() {
    window.setTimeout(() => {
      editorRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
      editorTitleRef.current?.focus({ preventScroll: true });
    }, 40);
  }

  function openEditor(post?: BlogPostDetail) {
    setEditing(post ?? null);
    setImageUploadError("");
    setAttachmentUploadError("");
    setDraft(
      post
        ? {
            title: post.title,
            excerpt: post.excerpt,
            imageUrl: post.imageUrl ?? "",
            imageAlt: post.imageAlt ?? "",
            content: post.content,
            attachmentLabel: post.attachmentLabel ?? "",
            attachmentUrl: post.attachmentUrl ?? "",
            published: post.published,
          }
        : blankPost,
    );
    setEditorOpen(true);
    focusEditor();
  }

  async function uploadArticleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_ARTICLE_IMAGE_BYTES) {
      setImageUploadError(
        `This image is too large. Please upload an image smaller than ${MAX_ARTICLE_IMAGE_MB} MB.`,
      );
      event.target.value = "";
      return;
    }
    setUploadingImage(true);
    setImageUploadError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch(
        `${portfolioApiUrl}/api/v1/blog/admin/images`,
        {
          method: "POST",
          credentials: "include",
          headers: await csrfHeaders(),
          body,
        },
      );
      if (!response.ok) {
        if (response.status === 413) {
          throw new Error(
            `This image is too large. Please upload an image smaller than ${MAX_ARTICLE_IMAGE_MB} MB.`,
          );
        }
        throw new Error("The article image could not be uploaded.");
      }
      const uploaded = (await response.json()) as BlogImageUpload;
      setDraft((current) => ({
        ...current,
        imageUrl: uploaded.secureUrl,
        imageAlt: current.imageAlt || current.title,
      }));
      setFeedback("Article image uploaded.");
    } catch (reason) {
      setImageUploadError(
        reason instanceof Error
          ? reason.message
          : "The article image could not be uploaded.",
      );
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  async function uploadArticleAttachment(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_ARTICLE_ATTACHMENT_BYTES) {
      setAttachmentUploadError(
        `This file is too large. Please upload a file smaller than ${MAX_ARTICLE_ATTACHMENT_MB} MB.`,
      );
      event.target.value = "";
      return;
    }

    setUploadingAttachment(true);
    setAttachmentUploadError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch(
        `${portfolioApiUrl}/api/v1/blog/admin/attachments`,
        {
          method: "POST",
          credentials: "include",
          headers: await csrfHeaders(),
          body,
        },
      );
      if (!response.ok) {
        if (response.status === 413) {
          throw new Error(
            `This file is too large. Please upload a file smaller than ${MAX_ARTICLE_ATTACHMENT_MB} MB.`,
          );
        }
        if (response.status === 415) {
          throw new Error(
            "Use a PDF, document, spreadsheet, text, CSV, ZIP, or RAR file.",
          );
        }
        throw new Error("The attachment could not be uploaded.");
      }
      const uploaded = (await response.json()) as BlogImageUpload;
      setDraft((current) => ({
        ...current,
        attachmentUrl: uploaded.secureUrl,
        attachmentLabel: current.attachmentLabel || file.name,
      }));
      setFeedback("Attachment uploaded.");
    } catch (reason) {
      setAttachmentUploadError(
        reason instanceof Error
          ? reason.message
          : "The attachment could not be uploaded. Check that the backend is online and the file type is supported.",
      );
    } finally {
      setUploadingAttachment(false);
      event.target.value = "";
    }
  }

  async function savePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const path = editing
      ? `/api/v1/blog/admin/posts/${editing.id}`
      : "/api/v1/blog/admin/posts";
    const method = editing ? "PUT" : "POST";
    try {
      const saved = await authenticatedRequest<BlogPostDetail>(path, {
        method,
        body: JSON.stringify(draft),
      });
      setEditorOpen(false);
      setEditing(null);
      await loadPosts();
      if (mode === "article") await loadPost(saved.slug);
      setFeedback(editing ? "Article updated." : "Article added.");
    } finally {
      setBusy(false);
    }
  }

  async function deletePost() {
    if (!activePost) return;
    const response = await fetch(
      `${portfolioApiUrl}/api/v1/blog/admin/posts/${activePost.id}`,
      {
        method: "DELETE",
        credentials: "include",
        headers: await csrfHeaders(),
      },
    );
    if (response.ok) {
      setFeedback("Article removed.");
      await loadPosts();
    }
  }

  const editor = editorOpen ? (
    <form
      className="blog-editor"
      ref={editorRef}
      onSubmit={(event) => void savePost(event)}
    >
      <section className="blog-editor-section blog-editor-basics">
        <header>
          <h3>{editing ? "Edit article" : "Add article"}</h3>
          <p>Set the title, summary, and publishing state.</p>
        </header>
        <div className="blog-editor-fields">
          <label>
            Title
            <input
              ref={editorTitleRef}
              required
              maxLength={180}
              value={draft.title}
              onChange={(event) =>
                setDraft({ ...draft, title: event.target.value })
              }
            />
          </label>
          <label className="blog-editor-check">
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(event) =>
                setDraft({ ...draft, published: event.target.checked })
              }
            />
            Published
          </label>
          <label className="blog-editor-full">
            Excerpt
            <textarea
              required
              maxLength={360}
              value={draft.excerpt}
              onChange={(event) =>
                setDraft({ ...draft, excerpt: event.target.value })
              }
            />
          </label>
        </div>
      </section>

      <section className="blog-editor-section blog-editor-media">
        <header>
          <h3>Media</h3>
          <p>Upload a cover image and optional downloadable attachment.</p>
        </header>
        <div className="blog-editor-media-grid">
          <div className="blog-editor-upload blog-editor-upload-card">
            <label>
              Article image
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={(event) => void uploadArticleImage(event)}
                disabled={uploadingImage || busy}
              />
            </label>
            <div className="blog-editor-upload-status" aria-live="polite">
              {uploadingImage ? (
                <span>
                  <LoaderCircle className="is-spinning" aria-hidden="true" />
                  Uploading to Cloudinary...
                </span>
              ) : draft.imageUrl ? (
                <span>
                  <Upload aria-hidden="true" />
                  Image ready
                </span>
              ) : (
                <span>
                  JPEG, PNG, WebP or AVIF up to {MAX_ARTICLE_IMAGE_MB} MB.
                </span>
              )}
              {imageUploadError ? (
                <span className="is-error" role="alert">
                  {imageUploadError}
                </span>
              ) : null}
            </div>
            <div className="blog-editor-image-preview">
              {draft.imageUrl ? (
                <Image
                  src={draft.imageUrl}
                  alt={
                    draft.imageAlt || draft.title || "Uploaded article image"
                  }
                  fill
                  sizes="(max-width: 900px) calc(100vw - 2rem), 420px"
                />
              ) : (
                <span>Image preview</span>
              )}
            </div>
          </div>

          <div className="blog-editor-upload blog-editor-upload-card">
            <label>
              Attachment file
              <input
                type="file"
                accept={ARTICLE_ATTACHMENT_ACCEPT}
                onChange={(event) => void uploadArticleAttachment(event)}
                disabled={uploadingAttachment || busy}
              />
            </label>
            <div className="blog-editor-upload-status" aria-live="polite">
              {uploadingAttachment ? (
                <span>
                  <LoaderCircle className="is-spinning" aria-hidden="true" />
                  Uploading attachment...
                </span>
              ) : draft.attachmentUrl ? (
                <span>
                  <Download aria-hidden="true" />
                  Attachment ready
                </span>
              ) : (
                <span>
                  PDF, docs, spreadsheets, text, CSV, ZIP or RAR up to{" "}
                  {MAX_ARTICLE_ATTACHMENT_MB} MB.
                </span>
              )}
              {attachmentUploadError ? (
                <span className="is-error" role="alert">
                  {attachmentUploadError}
                </span>
              ) : null}
            </div>
            <label>
              Attachment label
              <input
                value={draft.attachmentLabel}
                placeholder="Download resources"
                onChange={(event) =>
                  setDraft({ ...draft, attachmentLabel: event.target.value })
                }
              />
            </label>
            {draft.attachmentUrl ? (
              <a
                className="blog-editor-attachment-preview"
                href={draft.attachmentUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                <Download aria-hidden="true" />
                <span>
                  {draft.attachmentLabel || "View uploaded attachment"}
                </span>
              </a>
            ) : null}
          </div>

          <label className="blog-editor-full">
            Image alt text
            <input
              value={draft.imageAlt}
              onChange={(event) =>
                setDraft({ ...draft, imageAlt: event.target.value })
              }
            />
          </label>
        </div>
      </section>

      <section className="blog-editor-section blog-editor-content">
        <header>
          <h3>Content</h3>
          <p>Supports headings, bold text, lists, links, and code blocks.</p>
        </header>
        <label className="blog-editor-full">
          Article content
          <textarea
            required
            maxLength={20000}
            value={draft.content}
            onChange={(event) =>
              setDraft({ ...draft, content: event.target.value })
            }
            placeholder={
              "Use ## headings, **bold text**, - lists, [links](https://...), and ```js code blocks ```."
            }
          />
        </label>
      </section>

      <div className="blog-editor-actions">
        <button type="button" onClick={() => setEditorOpen(false)}>
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy || uploadingImage || uploadingAttachment}
        >
          {busy ? "Saving..." : "Save article"}
        </button>
      </div>
    </form>
  ) : null;

  if (mode === "index") {
    return (
      <section className="blog-index" aria-label="Blog articles">
        {session.admin ? (
          <div className="blog-owner-bar">
            <span>Owner blog manager</span>
            <button type="button" onClick={() => openEditor()}>
              <Plus aria-hidden="true" /> Add post
            </button>
          </div>
        ) : null}
        {feedback ? <p className="blog-feedback">{feedback}</p> : null}
        {editor}
        {loading ? (
          <BlogIndexSkeleton />
        ) : posts.length === 0 ? (
          <div className="blog-empty">
            <h2>No articles yet.</h2>
            <p>
              The blog is ready. Owner can add the first article after signing
              in.
            </p>
          </div>
        ) : (
          <div className="blog-index-grid">
            {posts.map((post, index) => (
              <article className="blog-index-card" key={post.id}>
                {post.imageUrl ? (
                  <Link
                    className="blog-index-image"
                    href={`/blog/${post.slug}`}
                    aria-label={`Read ${post.title}`}
                  >
                    <Image
                      src={post.imageUrl}
                      alt={post.imageAlt || post.title}
                      fill
                      sizes="(max-width: 900px) calc(100vw - 2rem), 520px"
                    />
                  </Link>
                ) : null}
                <header className="blog-index-card-header">
                  <p className="eyebrow">
                    Article {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2>
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                </header>
                <p className="blog-index-card-description">{post.excerpt}</p>
                <footer className="blog-card-meta">
                  <time dateTime={post.publishedAt ?? post.updatedAt}>
                    {formattedDate(post.publishedAt ?? post.updatedAt)}
                  </time>
                  <span>{post.likeCount} likes</span>
                  <span>{post.commentCount} comments</span>
                  <span>{post.shareCount} shares</span>
                </footer>
              </article>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <section
      className="blog-layout blog-detail-layout"
      aria-label="Blog article"
    >
      <div className="blog-center">
        <div className="blog-article-picker">
          <span id="blog-article-picker-label">Articles</span>
          <button
            type="button"
            className="blog-article-picker-button"
            disabled={loading || posts.length === 0}
            aria-haspopup="menu"
            aria-expanded={articleMenuOpen}
            aria-controls="blog-article-menu"
            aria-labelledby="blog-article-picker-label"
            onClick={() => setArticleMenuOpen((open) => !open)}
          >
            <span>
              {loading
                ? "Loading articles..."
                : activePost?.title || "Choose an article"}
            </span>
            <ChevronDown aria-hidden="true" />
          </button>

          {articleMenuOpen ? (
            <nav
              className="blog-article-picker-menu"
              id="blog-article-menu"
              aria-label="Choose article"
            >
              {posts.map((post, index) => (
                <Link
                  key={post.id}
                  className={
                    post.id === activePost?.id ? "is-active" : undefined
                  }
                  href={`/blog/${post.slug}`}
                  onClick={() => setArticleMenuOpen(false)}
                >
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  <strong>{post.title}</strong>
                  <em>
                    {post.published ? formattedDate(post.publishedAt) : "Draft"}
                  </em>
                </Link>
              ))}
            </nav>
          ) : null}
        </div>

        {feedback ? <p className="blog-feedback">{feedback}</p> : null}
        {editor}

        {loading ? (
          <BlogArticleSkeleton />
        ) : activePost ? (
          <article className="blog-article" id={`article-${activePost.slug}`}>
            <header className="blog-article-header">
              <div className="blog-article-heading">
                <p className="eyebrow">
                  Article{" "}
                  {activeIndex >= 0
                    ? String(activeIndex + 1).padStart(2, "0")
                    : "01"}
                </p>
                <h2>{activePost.title}</h2>
                <p>{activePost.excerpt}</p>
                <time dateTime={activePost.publishedAt ?? activePost.updatedAt}>
                  {formattedDate(
                    activePost.publishedAt ?? activePost.updatedAt,
                  )}
                </time>
              </div>

              <div
                className="blog-action-rail blog-article-actions"
                aria-label="Article actions"
              >
                <button
                  type="button"
                  disabled={!session.authenticated || busy}
                  aria-label={
                    activePost.likedByViewer
                      ? "Remove your like from this article"
                      : "Like this article"
                  }
                  aria-pressed={activePost.likedByViewer}
                  onClick={() => void togglePostLike()}
                >
                  <Heart aria-hidden="true" />
                  <strong>{activePost.likeCount}</strong>
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void shareArticle()}
                >
                  <Share2 aria-hidden="true" />
                  <strong>{activePost.shareCount}</strong>
                </button>
                <button
                  type="button"
                  aria-expanded={commentsOpen}
                  aria-controls="blog-comments-window"
                  onClick={() => setCommentsOpen(true)}
                >
                  <MessageSquareText aria-hidden="true" />
                  <strong>{activePost.comments.length}</strong>
                </button>
              </div>
            </header>

            {activePost.imageUrl ? (
              <div className="blog-article-image">
                <Image
                  src={activePost.imageUrl}
                  alt={activePost.imageAlt || activePost.title}
                  fill
                  sizes="(max-width: 900px) calc(100vw - 2rem), 920px"
                />
              </div>
            ) : null}

            <RichArticle content={activePost.content} />

            {activePost.attachmentUrl ? (
              <a
                className="blog-attachment"
                href={activePost.attachmentUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                <Download aria-hidden="true" />
                <span>
                  {activePost.attachmentLabel || "Download attachment"}
                </span>
              </a>
            ) : null}

            {session.admin ? (
              <div className="blog-post-owner-actions">
                <button type="button" onClick={() => openEditor(activePost)}>
                  <Pencil aria-hidden="true" /> Edit post
                </button>
                <button type="button" onClick={() => void deletePost()}>
                  <Trash2 aria-hidden="true" /> Remove post
                </button>
              </div>
            ) : null}
          </article>
        ) : (
          <div className="blog-empty">
            <h2>Article not found.</h2>
            <p>This article may be unpublished or unavailable.</p>
          </div>
        )}
      </div>

      {activePost && commentsOpen ? (
        <div className="blog-comments-layer">
          <button
            type="button"
            className="blog-comments-backdrop"
            aria-label="Close comments"
            onClick={() => setCommentsOpen(false)}
          />
          <aside
            className="blog-comments-window"
            id="blog-comments-window"
            aria-label="Article comments"
          >
            <section className="blog-comments" id="blog-comments">
              <header>
                <div>
                  <h3>Comments</h3>
                  <p>{activePost.title}</p>
                </div>
                <span>{activePost.comments.length}</span>
                <button
                  type="button"
                  className="blog-comments-close"
                  aria-label="Close comments"
                  onClick={() => setCommentsOpen(false)}
                >
                  <X aria-hidden="true" />
                </button>
              </header>

              {session.authenticated ? (
                <form onSubmit={(event) => void submitComment(event)}>
                  <label htmlFor="blog-comment">Add a comment</label>
                  <textarea
                    id="blog-comment"
                    value={comment}
                    maxLength={1000}
                    placeholder="Share a thought about this article..."
                    onChange={(event) => setComment(event.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={busy || comment.trim().length < 2}
                  >
                    <Send aria-hidden="true" /> Comment
                  </button>
                </form>
              ) : (
                <div className="blog-signin-box">
                  <p>Sign in to comment or like this article.</p>
                  <div>
                    {providers.map((provider) => (
                      <button
                        type="button"
                        key={provider.id}
                        onClick={() => signIn(provider.id)}
                      >
                        {provider.id === "github" ? (
                          <SiGithub aria-hidden="true" />
                        ) : (
                          <FcGoogle aria-hidden="true" />
                        )}
                        Sign in with{" "}
                        {provider.id === "github" ? "GitHub" : "Google"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="blog-comment-list">
                {activePost.comments.map((item) => (
                  <article className="blog-comment-card" key={item.id}>
                    <span
                      className="blog-comment-avatar"
                      style={
                        item.author.avatarUrl
                          ? { backgroundImage: `url(${item.author.avatarUrl})` }
                          : undefined
                      }
                    >
                      {!item.author.avatarUrl
                        ? item.author.displayName.slice(0, 1)
                        : null}
                    </span>
                    <div>
                      <header>
                        <strong>{item.author.displayName}</strong>
                        <time dateTime={item.createdAt}>
                          {formattedDate(item.createdAt)}
                        </time>
                      </header>
                      <p
                        className={
                          expandedComments.has(item.id)
                            ? "is-expanded"
                            : undefined
                        }
                      >
                        {item.content}
                      </p>
                      {shouldShowReadMore(item.content) ? (
                        <button
                          type="button"
                          className="blog-comment-read-more"
                          aria-expanded={expandedComments.has(item.id)}
                          onClick={() => toggleCommentExpansion(item.id)}
                        >
                          {expandedComments.has(item.id)
                            ? "Show less"
                            : "... Read more"}
                        </button>
                      ) : null}
                      <div className="blog-comment-actions">
                        <button
                          type="button"
                          disabled={!session.authenticated}
                          aria-label={
                            item.likedByViewer
                              ? `Remove your like from ${item.author.displayName}'s comment`
                              : `Like ${item.author.displayName}'s comment`
                          }
                          aria-pressed={item.likedByViewer}
                          onClick={() => void toggleCommentLike(item.id)}
                        >
                          <Heart aria-hidden="true" /> {item.likeCount}
                        </button>
                        {(session.admin || item.ownedByViewer) && (
                          <button
                            type="button"
                            onClick={() => void deleteComment(item.id)}
                          >
                            <Trash2 aria-hidden="true" /> Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </aside>
        </div>
      ) : null}
    </section>
  );
}
