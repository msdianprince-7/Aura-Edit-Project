// src/app/photo/[photoId]/page.tsx
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { buildCssFilter } from "@/lib/filters";
import LikeButton from "@/components/social/LikeButton";
import CommentSection from "@/components/social/CommentSection";
import FollowButton from "@/components/social/FollowButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Photo | AuraEdit",
  description: "View photo details, likes, and comments on AuraEdit.",
};

export default async function PhotoDetailPage({
  params,
}: {
  params: Promise<{ photoId: string }>;
}) {
  const session = await auth();
  const currentUserId = session?.user?.id || null;

  const resolvedParams = await params;
  const photoId = resolvedParams.photoId;

  const photo = await prisma.photo.findUnique({
    where: { id: photoId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          bio: true,
          createdAt: true,
          _count: { select: { photos: true, followers: true, following: true } },
        },
      },
      appliedEdit: true,
      likes: { select: { userId: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, username: true } },
        },
      },
    },
  });

  if (!photo) {
    notFound();
  }

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

  const isLiked = currentUserId
    ? photo.likes.some((l) => l.userId === currentUserId)
    : false;

  const isOwnPhoto = currentUserId === photo.user.id;

  // Check if current user follows the photo owner
  let isFollowing = false;
  if (currentUserId && !isOwnPhoto) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: photo.user.id,
        },
      },
    });
    isFollowing = !!follow;
  }

  const commentsData = photo.comments.map((c) => ({
    id: c.id,
    content: c.content,
    createdAt: c.createdAt.toISOString(),
    user: { id: c.user.id, username: c.user.username },
  }));

  return (
    <div style={{ animation: "slide-up 0.6s ease forwards" }}>
      {/* Back link */}
      <Link
        href="/explore"
        className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors"
        style={{ color: "var(--text-muted)" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15,18 9,12 15,6" />
        </svg>
        Back to Explore
      </Link>

      {/* Main layout */}
      <div className="photo-detail-grid">
        {/* Photo */}
        <div
          className="rounded-2xl overflow-hidden relative"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div className="relative aspect-[4/5]">
            <Image
              src={photo.imageUrl}
              alt={photo.caption || "Photo"}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover"
              style={{ filter: filterString }}
              priority
            />
            {edit?.overlay && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: edit.overlay }}
              />
            )}
            {/* Filter badge */}
            {edit && edit.filterName !== "None" && (
              <div
                className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{
                  background: "rgba(13, 10, 18, 0.7)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--accent-lavender)",
                }}
              >
                {edit.filterName}
              </div>
            )}
          </div>
        </div>

        {/* Details panel */}
        <div className="flex flex-col gap-5">
          {/* User info card */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div className="flex items-center justify-between gap-4 mb-4">
              <Link href={`/${photo.user.username}`} className="flex items-center gap-3 group">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 transition-transform duration-300 group-hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, var(--accent-rose), var(--accent-lavender))",
                    color: "var(--bg-deep)",
                  }}
                >
                  {photo.user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold group-hover:underline" style={{ color: "var(--text-primary)" }}>
                    @{photo.user.username}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {photo.user._count.photos} photos · {photo.user._count.followers} followers
                  </p>
                </div>
              </Link>

              {/* Follow/Edit button */}
              {currentUserId && !isOwnPhoto && (
                <FollowButton
                  targetUserId={photo.user.id}
                  initialFollowing={isFollowing}
                  followerCount={photo.user._count.followers}
                />
              )}
              {isOwnPhoto && (
                <Link
                  href={`/edit/${photo.id}`}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--accent-lavender)",
                  }}
                >
                  ✏️ Edit Photo
                </Link>
              )}
            </div>

            {/* Caption + meta */}
            {photo.caption && (
              <p className="text-base mb-3" style={{ color: "var(--text-primary)" }}>
                {photo.caption}
              </p>
            )}
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {new Date(photo.createdAt).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>

            {/* Like section */}
            <div
              className="mt-4 pt-4 flex items-center gap-4"
              style={{ borderTop: "1px solid var(--border-subtle)" }}
            >
              {currentUserId ? (
                <LikeButton
                  photoId={photo.id}
                  initialLiked={isLiked}
                  initialCount={photo.likes.length}
                />
              ) : (
                <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <span className="text-sm font-semibold">{photo.likes.length}</span>
                </div>
              )}
              <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span className="text-sm font-semibold">{photo.comments.length}</span>
              </div>
            </div>
          </div>

          {/* Comments section */}
          <div
            className="rounded-2xl p-5 flex-1"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
              Comments ({photo.comments.length})
            </h3>
            <CommentSection
              photoId={photo.id}
              comments={commentsData}
              currentUserId={currentUserId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
