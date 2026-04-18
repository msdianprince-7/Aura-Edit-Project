// src/app/[username]/page.tsx
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { buildCssFilter } from "@/lib/filters";
import FollowButton from "@/components/social/FollowButton";
import LikeButton from "@/components/social/LikeButton";

export default async function PublicProfile({ params }: { params: Promise<{ username: string }> }) {
  const session = await auth();
  const currentUserId = session?.user?.id || null;

  const resolvedParams = await params;
  const username = resolvedParams.username;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      photos: {
        orderBy: { createdAt: "desc" },
        include: {
          appliedEdit: true,
          likes: { select: { userId: true } },
          _count: { select: { comments: true } },
        },
      },
      _count: {
        select: { followers: true, following: true, photos: true },
      },
      collections: {
        where: { isPublic: true },
        orderBy: { updatedAt: "desc" },
        include: {
          _count: { select: { photos: true } },
          photos: {
            take: 3,
            orderBy: { addedAt: "desc" },
            include: {
              photo: { select: { imageUrl: true } },
            },
          },
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const isOwnProfile = currentUserId === user.id;

  // Check if current user follows this profile
  let isFollowing = false;
  if (currentUserId && !isOwnProfile) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: user.id,
        },
      },
    });
    isFollowing = !!follow;
  }

  return (
    <div className="space-y-10 mt-10" style={{ animation: "slide-up 0.6s ease forwards" }}>
      {/* Profile header */}
      <div className="text-center space-y-4">
        <div
          className="w-24 h-24 rounded-full mx-auto p-1"
          style={{ background: "linear-gradient(135deg, var(--accent-rose), var(--accent-lavender))" }}
        >
          <div
            className="w-full h-full rounded-full flex items-center justify-center text-3xl font-bold uppercase"
            style={{ background: "var(--bg-deep)" }}
          >
            {user.username.charAt(0)}
          </div>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
          @{user.username}
        </h1>
        {user.bio && (
          <p className="text-sm max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
            {user.bio}
          </p>
        )}

        {/* Stats row */}
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              {user._count.photos}
            </p>
            <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Photos
            </p>
          </div>
          <div className="w-px h-8" style={{ background: "var(--border-subtle)" }} />
          <div className="text-center">
            <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              {user._count.followers}
            </p>
            <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Followers
            </p>
          </div>
          <div className="w-px h-8" style={{ background: "var(--border-subtle)" }} />
          <div className="text-center">
            <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              {user._count.following}
            </p>
            <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Following
            </p>
          </div>
        </div>

        {/* Follow button */}
        {currentUserId && !isOwnProfile && (
          <div className="flex justify-center">
            <FollowButton
              targetUserId={user.id}
              initialFollowing={isFollowing}
              followerCount={user._count.followers}
            />
          </div>
        )}
      </div>

      {user.collections.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-bold tracking-tight mb-6" style={{ color: "var(--text-primary)" }}>
            Collections
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.collections.map((col, index) => (
              <Link
                key={col.id}
                href={`/collections/${col.id}`}
                className="collection-card group rounded-2xl overflow-hidden transition-all duration-300 block"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  animation: `slide-up 0.4s ease forwards`,
                  animationDelay: `${index * 0.06}s`,
                  opacity: 0,
                }}
              >
                {/* Cover thumbnails */}
                <div className="relative h-32 overflow-hidden">
                  {col.photos.length > 0 ? (
                    <div className="flex h-full">
                      {col.photos.slice(0, 3).map((cp, i) => (
                        <div key={cp.id} className="flex-1 relative" style={{ borderRight: i < 2 ? "1px solid var(--bg-surface)" : "none" }}>
                          <Image
                            src={cp.photo.imageUrl}
                            alt=""
                            fill
                            sizes="150px"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                      ))}
                      {/* Fill remaining slots */}
                      {col.photos.length < 3 && [...Array(3 - col.photos.length)].map((_, i) => (
                        <div key={`empty-${i}`} className="flex-1" style={{ background: "var(--bg-elevated)" }} />
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center" style={{ background: "var(--bg-elevated)" }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" opacity="0.5">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--bg-surface) 0%, transparent 60%)" }} />
                </div>

                {/* Info */}
                <div className="px-5 pb-5 -mt-3 relative z-10">
                  <h3 className="text-sm font-bold mb-1 truncate" style={{ color: "var(--text-primary)" }}>
                    {col.name}
                  </h3>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {col._count.photos} photo{col._count.photos !== 1 ? 's' : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Photo grid */}
      <h2 className="text-xl font-bold tracking-tight mb-6" style={{ color: "var(--text-primary)" }}>
        Photos
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {user.photos.map((photo) => {
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

          return (
            <div
              key={photo.id}
              className="group relative rounded-xl overflow-hidden"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <Link href={`/photo/${photo.id}`}>
                <div className="relative aspect-[4/5]">
                  <Image
                    src={photo.imageUrl}
                    alt={photo.caption || "Aura image"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    style={{ filter: filterString }}
                  />
                  {edit?.overlay && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: edit.overlay }}
                    />
                  )}
                  {edit && edit.filterName !== "None" && (
                    <div
                      className="absolute top-3 right-3 z-10 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6 pointer-events-none">
                    <p className="text-white font-medium text-lg">{photo.caption}</p>
                  </div>
                </div>
              </Link>
              {/* Engagement bar */}
              <div
                className="flex items-center gap-4 px-4 py-3"
                style={{ borderTop: "1px solid var(--border-subtle)" }}
              >
                {currentUserId ? (
                  <LikeButton
                    photoId={photo.id}
                    initialLiked={isLiked}
                    initialCount={photo.likes.length}
                    size="sm"
                  />
                ) : (
                  <div className="flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    <span className="text-xs font-semibold">{photo.likes.length}</span>
                  </div>
                )}
                <Link href={`/photo/${photo.id}`} className="flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  <span className="text-xs font-semibold">{photo._count.comments}</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {user.photos.length === 0 && (
        <p className="text-center py-10" style={{ color: "var(--text-muted)" }}>
          No photos uploaded yet.
        </p>
      )}
    </div>
  );
}