"use client";

import { useState, useTransition, useRef } from "react";
import { addCommentAction, deleteCommentAction } from "@/app/actions/social";
import Link from "next/link";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
  };
}

interface CommentSectionProps {
  photoId: string;
  comments: Comment[];
  currentUserId: string | null;
}

export default function CommentSection({
  photoId,
  comments: initialComments,
  currentUserId,
}: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    const content = (formData.get("content") as string)?.trim();
    if (!content || !currentUserId) return;

    // Optimistic add
    const tempComment: Comment = {
      id: `temp-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      user: { id: currentUserId, username: "You" },
    };
    setComments((prev) => [...prev, tempComment]);
    formRef.current?.reset();

    startTransition(async () => {
      try {
        await addCommentAction(formData);
      } catch {
        // Remove temp comment on error
        setComments((prev) => prev.filter((c) => c.id !== tempComment.id));
      }
    });
  };

  const handleDelete = (commentId: string) => {
    const deletedComment = comments.find((c) => c.id === commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));

    startTransition(async () => {
      try {
        await deleteCommentAction(commentId);
      } catch {
        if (deletedComment) {
          setComments((prev) => [...prev, deletedComment]);
        }
      }
    });
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {/* Comment list */}
      <div className="space-y-3 max-h-80 overflow-y-auto editor-scroll pr-1">
        {comments.length === 0 ? (
          <p className="text-sm py-4 text-center" style={{ color: "var(--text-muted)" }}>
            No comments yet. Be the first!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="group flex gap-3 p-3 rounded-xl transition-colors duration-200"
              style={{ background: "var(--bg-elevated)" }}
            >
              {/* Avatar */}
              <Link href={`/${comment.user.username}`}>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: "linear-gradient(135deg, var(--accent-rose), var(--accent-lavender))",
                    color: "var(--bg-deep)",
                  }}
                >
                  {comment.user.username.charAt(0).toUpperCase()}
                </div>
              </Link>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Link
                    href={`/${comment.user.username}`}
                    className="text-sm font-semibold hover:underline"
                    style={{ color: "var(--text-primary)" }}
                  >
                    @{comment.user.username}
                  </Link>
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {timeAgo(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm break-words" style={{ color: "var(--text-secondary)" }}>
                  {comment.content}
                </p>
              </div>

              {/* Delete button (only for own comments) */}
              {currentUserId === comment.user.id && !comment.id.startsWith("temp-") && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all duration-200 shrink-0 self-start"
                  style={{ color: "var(--accent-rose)" }}
                  title="Delete comment"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add comment form */}
      {currentUserId ? (
        <form
          ref={formRef}
          action={handleSubmit}
          className="flex gap-2"
        >
          <input type="hidden" name="photoId" value={photoId} />
          <input
            name="content"
            type="text"
            placeholder="Add a comment..."
            required
            maxLength={500}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
              // @ts-expect-error CSS custom property for focus ring
              "--tw-ring-color": "rgba(184, 140, 245, 0.3)",
            }}
          />
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 shrink-0"
            style={{
              background: "linear-gradient(135deg, var(--accent-lavender), var(--accent-rose))",
              color: "var(--bg-deep)",
            }}
          >
            {isPending ? "..." : "Post"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-center py-2" style={{ color: "var(--text-muted)" }}>
          <Link href="/login" className="underline" style={{ color: "var(--accent-lavender)" }}>
            Sign in
          </Link>{" "}
          to comment
        </p>
      )}
    </div>
  );
}
