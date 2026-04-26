"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getFeedAction, type FeedPhoto } from "@/app/actions/feed";
import { buildCssFilter } from "@/lib/filters";
import LikeButton from "@/components/social/LikeButton";

interface FeedClientProps {
  initialPhotos: FeedPhoto[];
  initialCursor: string | null;
  currentUserId: string;
}

export default function FeedClient({
  initialPhotos,
  initialCursor,
  currentUserId,
}: FeedClientProps) {
  const [photos, setPhotos] = useState<FeedPhoto[]>(initialPhotos);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialCursor !== null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Infinite scroll via Intersection Observer
  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !cursor) return;
    setLoading(true);

    try {
      const result = await getFeedAction(cursor);
      setPhotos((prev) => [...prev, ...result.photos]);
      setCursor(result.nextCursor);
      setHasMore(result.nextCursor !== null);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, cursor]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    const el = sentinelRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [loadMore]);

  // Relative time helper
  const getRelativeTime = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // ═══════════════════════════════
  // EMPTY STATE — No follows yet
  // ═══════════════════════════════
  if (photos.length === 0 && !loading) {
    return (
      <div className="feed-container" style={{ animation: "slide-up 0.6s ease forwards" }}>
        {/* Header */}
        <div className="feed-header mb-8">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(184, 140, 245, 0.15), rgba(240, 112, 104, 0.15))",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent-lavender)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <h1
                className="text-3xl font-bold tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                Your Feed
              </h1>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Photos from creators you follow
              </p>
            </div>
          </div>
        </div>

        {/* Empty state */}
        <div
          className="text-center py-20 rounded-2xl"
          style={{
            background: "var(--bg-surface)",
            border: "2px dashed var(--border-subtle)",
          }}
        >
          <div
            className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(184, 140, 245, 0.1), rgba(240, 196, 100, 0.1))",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent-lavender)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Your feed is empty
          </h3>
          <p
            className="text-sm mb-6 max-w-sm mx-auto"
            style={{ color: "var(--text-muted)" }}
          >
            Follow creators on the Explore page to see their latest photos here.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02]"
            style={{
              background:
                "linear-gradient(135deg, var(--accent-rose), var(--accent-amber))",
              color: "var(--bg-deep)",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Discover Creators
          </Link>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════
  // MAIN FEED
  // ═══════════════════════════════
  return (
    <div
      className="feed-container"
      style={{ animation: "slide-up 0.6s ease forwards" }}
    >
      {/* Header */}
      <div className="feed-header mb-8">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(184, 140, 245, 0.15), rgba(240, 112, 104, 0.15))",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent-lavender)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div>
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Your Feed
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Latest from creators you follow
            </p>
          </div>
        </div>
      </div>

      {/* Feed cards */}
      <div className="feed-cards-list">
        {photos.map((photo, index) => {
          const edit = photo.appliedEdit;
          const filterString = edit
            ? buildCssFilter({
                brightness: edit.brightness,
                contrast: edit.contrast,
                saturation: edit.saturation,
                hueRotate: edit.hueRotate,
                sepia: edit.sepia,
                grayscale: edit.grayscale,
                blur: edit.blur,
              })
            : "none";

          const isLiked = photo.likes.some(
            (l) => l.userId === currentUserId
          );

          return (
            <article
              key={photo.id}
              className="feed-card rounded-2xl overflow-hidden"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                animation: `slide-up 0.5s ease forwards`,
                animationDelay: `${Math.min(index * 0.06, 0.6)}s`,
                opacity: 0,
              }}
            >
              {/* Card header — user info */}
              <div className="flex items-center justify-between px-5 py-4">
                <Link
                  href={`/${photo.user.username}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="feed-avatar-ring">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold uppercase"
                      style={{
                        background: "var(--bg-deep)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {photo.user.username.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold group-hover:underline"
                      style={{ color: "var(--text-primary)" }}
                    >
                      @{photo.user.username}
                    </p>
                    <p
                      className="text-[11px]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {getRelativeTime(photo.createdAt)}
                    </p>
                  </div>
                </Link>

                {/* Filter badge */}
                {edit && edit.filterName !== "None" && (
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      background: "rgba(184, 140, 245, 0.1)",
                      border: "1px solid rgba(184, 140, 245, 0.2)",
                      color: "var(--accent-lavender)",
                    }}
                  >
                    {edit.filterName}
                  </span>
                )}
              </div>

              {/* Photo */}
              <Link href={`/photo/${photo.id}`} className="block">
                <div className="relative aspect-[4/5] feed-photo-container">
                  <Image
                    src={photo.imageUrl}
                    alt={photo.caption || "Feed photo"}
                    fill
                    sizes="(max-width: 768px) 100vw, 680px"
                    className="object-cover transition-transform duration-500 hover:scale-[1.02]"
                    style={{ filter: filterString }}
                  />
                  {/* Edit overlay tint */}
                  {edit?.overlay && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: edit.overlay }}
                    />
                  )}
                </div>
              </Link>

              {/* Engagement bar */}
              <div className="px-5 py-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <LikeButton
                      photoId={photo.id}
                      initialLiked={isLiked}
                      initialCount={photo.likes.length}
                      size="md"
                    />
                    <Link
                      href={`/photo/${photo.id}`}
                      className="flex items-center gap-1.5 transition-colors group"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="group-hover:stroke-[var(--accent-amber)] transition-colors"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <span className="text-sm font-semibold">
                        {photo._count.comments}
                      </span>
                    </Link>
                  </div>
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {new Date(photo.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Caption */}
                {photo.caption && (
                  <div className="mt-2.5">
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      <Link
                        href={`/${photo.user.username}`}
                        className="font-bold mr-1.5 hover:underline"
                        style={{ color: "var(--text-primary)" }}
                      >
                        @{photo.user.username}
                      </Link>
                      {photo.caption}
                    </p>
                  </div>
                )}

                {/* View comments link */}
                {photo._count.comments > 0 && (
                  <Link
                    href={`/photo/${photo.id}`}
                    className="text-xs mt-2 inline-block transition-colors"
                    style={{ color: "var(--text-muted)" }}
                  >
                    View all {photo._count.comments} comment
                    {photo._count.comments !== 1 ? "s" : ""}
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="feed-cards-list mt-5">
          {[...Array(2)].map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="rounded-2xl overflow-hidden"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div className="flex items-center gap-3 px-5 py-4">
                <div className="w-10 h-10 rounded-full skeleton shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 skeleton" />
                  <div className="h-2 w-16 skeleton" />
                </div>
              </div>
              <div className="aspect-[4/5] skeleton" style={{ borderRadius: 0 }} />
              <div className="px-5 py-4 space-y-2">
                <div className="h-3 w-32 skeleton" />
                <div className="h-3 w-48 skeleton" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      {hasMore && <div ref={sentinelRef} className="h-4" />}

      {/* End-of-feed indicator */}
      {!hasMore && photos.length > 0 && (
        <div className="text-center py-12">
          <div
            className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(184, 140, 245, 0.1), rgba(240, 196, 100, 0.1))",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent-amber)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            You&apos;re all caught up
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Check back later for new posts from creators you follow
          </p>
        </div>
      )}
    </div>
  );
}
