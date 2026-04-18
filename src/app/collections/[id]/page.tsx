// src/app/collections/[id]/page.tsx
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { buildCssFilter } from "@/lib/filters";
import { deleteCollectionAction, removePhotoFromCollectionAction } from "@/app/actions/collection";
import LikeButton from "@/components/social/LikeButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collection | AuraEdit",
  description: "View a curated photo collection on AuraEdit.",
};

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const currentUserId = session?.user?.id || null;

  const resolvedParams = await params;
  const collectionId = resolvedParams.id;

  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    include: {
      user: {
        select: { id: true, username: true },
      },
      photos: {
        orderBy: { addedAt: "desc" },
        include: {
          photo: {
            include: {
              appliedEdit: true,
              likes: { select: { userId: true } },
              _count: { select: { comments: true } },
            },
          },
        },
      },
    },
  });

  if (!collection) {
    notFound();
  }

  // Check access: public or owner
  const isOwner = currentUserId === collection.user.id;
  if (!collection.isPublic && !isOwner) {
    notFound();
  }

  const photos = collection.photos.map((cp) => cp.photo);

  return (
    <div style={{ animation: "slide-up 0.6s ease forwards" }}>
      {/* Back link */}
      <Link
        href={isOwner ? "/dashboard" : `/explore`}
        className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors"
        style={{ color: "var(--text-muted)" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15,18 9,12 15,6" />
        </svg>
        Back
      </Link>

      {/* Collection header */}
      <div
        className="rounded-2xl p-8 mb-8 relative overflow-hidden"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        {/* Background gradient */}
        <div
          className="absolute top-0 right-0 w-80 h-80 opacity-10"
          style={{
            background: "radial-gradient(circle, var(--accent-lavender) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                {!collection.isPublic && (
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      background: "rgba(240, 196, 100, 0.1)",
                      color: "var(--accent-amber)",
                      border: "1px solid rgba(240, 196, 100, 0.2)",
                    }}
                  >
                    Private
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                {collection.name}
              </h1>
              {collection.description && (
                <p className="text-sm mt-2 max-w-lg" style={{ color: "var(--text-secondary)" }}>
                  {collection.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3">
                <Link
                  href={`/${collection.user.username}`}
                  className="text-xs font-medium transition-colors hover:underline"
                  style={{ color: "var(--accent-lavender)" }}
                >
                  @{collection.user.username}
                </Link>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {photos.length} photo{photos.length !== 1 ? "s" : ""}
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Updated {new Date(collection.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </div>

            {/* Owner actions */}
            {isOwner && (
              <div className="flex items-center gap-2">
                <Link
                  href={`/collections/${collectionId}/edit`}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-secondary)",
                  }}
                >
                  ✏️ Edit
                </Link>
                <form action={async () => {
                  "use server";
                  await deleteCollectionAction(collectionId);
                }}>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      background: "rgba(240, 112, 104, 0.1)",
                      border: "1px solid rgba(240, 112, 104, 0.2)",
                      color: "var(--accent-rose)",
                    }}
                  >
                    🗑️ Delete
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Photo grid */}
      {photos.length === 0 ? (
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
              background: "linear-gradient(135deg, rgba(184, 140, 245, 0.1), rgba(240, 196, 100, 0.1))",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            This collection is empty
          </h3>
          <p className="text-sm max-w-sm mx-auto mb-6" style={{ color: "var(--text-muted)" }}>
            {isOwner
              ? "Add photos from your dashboard or explore page."
              : "The creator hasn't added any photos yet."}
          </p>
          {isOwner && (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, var(--accent-rose), var(--accent-amber))",
                color: "var(--bg-deep)",
              }}
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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

            const isLiked = currentUserId
              ? photo.likes.some((l) => l.userId === currentUserId)
              : false;

            return (
              <div
                key={photo.id}
                className="group relative rounded-2xl overflow-hidden explore-card"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  animation: `slide-up 0.5s ease forwards`,
                  animationDelay: `${index * 0.05}s`,
                  opacity: 0,
                }}
              >
                <Link href={`/photo/${photo.id}`}>
                  <div className="relative aspect-[4/5]">
                    <Image
                      src={photo.imageUrl}
                      alt={photo.caption || "Collection photo"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ filter: filterString }}
                    />
                    {edit?.overlay && (
                      <div className="absolute inset-0 pointer-events-none" style={{ background: edit.overlay }} />
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
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-5"
                      style={{
                        background: "linear-gradient(to top, rgba(13,10,18,0.95) 0%, rgba(13,10,18,0.3) 50%, transparent 100%)",
                      }}
                    >
                      {photo.caption && (
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {photo.caption}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Bottom bar */}
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderTop: "1px solid var(--border-subtle)" }}
                >
                  <div className="flex items-center gap-4">
                    {currentUserId ? (
                      <LikeButton
                        photoId={photo.id}
                        initialLiked={isLiked}
                        initialCount={photo.likes.length}
                        size="sm"
                      />
                    ) : (
                      <div className="flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        <span className="text-xs font-semibold">{photo.likes.length}</span>
                      </div>
                    )}
                    <Link href={`/photo/${photo.id}`} className="flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <span className="text-xs font-semibold">{photo._count.comments}</span>
                    </Link>
                  </div>

                  {/* Remove from collection (owner only) */}
                  {isOwner && (
                    <form action={async () => {
                      "use server";
                      await removePhotoFromCollectionAction(collectionId, photo.id);
                    }}>
                      <button
                        type="submit"
                        className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110"
                        style={{
                          color: "var(--text-muted)",
                        }}
                        title="Remove from collection"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
