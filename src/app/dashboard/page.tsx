// src/app/dashboard/page.tsx
import Image from 'next/image';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { deletePhotoAction } from './action';
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { buildCssFilter } from "@/lib/filters";
import AddToCollectionModal from "@/components/collections/AddToCollectionModal";
import { createCollectionAction } from "@/app/actions/collection";

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id as string;

  // Fetch photos, user info, and collections
  const [photos, user, collections] = await Promise.all([
    prisma.photo.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        appliedEdit: true,
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        createdAt: true,
        _count: { select: { followers: true } },
      },
    }),
    prisma.collection.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { photos: true } },
        photos: {
          take: 3,
          orderBy: { addedAt: 'desc' },
          include: {
            photo: { select: { imageUrl: true } },
          },
        },
      },
    }),
  ]);

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recently";

  return (
    <div className="space-y-8" style={{ animation: "slide-up 0.6s ease forwards" }}>

      {/* Stats header */}
      <div
        className="rounded-2xl p-8 relative overflow-hidden"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        {/* Background gradient accent */}
        <div
          className="absolute top-0 right-0 w-72 h-72 opacity-10"
          style={{
            background: "radial-gradient(circle, var(--accent-rose) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: "var(--accent-amber)" }}>
              Dashboard
            </p>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Your Gallery
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              Manage your curated visual collection
            </p>
          </div>

          <div className="flex gap-6">
            {/* Stat cards */}
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                {photos.length}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Photos</p>
            </div>
            <div
              className="w-px"
              style={{ background: "var(--border-subtle)" }}
            />
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                {memberSince}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Member since</p>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="relative z-10 mt-6 flex gap-3">
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg, var(--accent-rose), var(--accent-amber))",
              color: "var(--bg-deep)",
              boxShadow: "0 4px 15px rgba(240, 112, 104, 0.2)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Upload
          </Link>
          {user?.username && (
            <Link
              href={`/${user.username}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15,3 21,3 21,9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              View Public Profile
            </Link>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* COLLECTIONS SECTION */}
      {/* ═══════════════════════════════════════ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <h2 className="text-lg font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Collections
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
              {collections.length}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Create new collection card */}
          <form
            action={createCollectionAction}
            className="collection-create-card group rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[160px] cursor-pointer transition-all duration-300"
            style={{
              background: "var(--bg-surface)",
              border: "2px dashed var(--border-subtle)",
            }}
          >
            <input type="hidden" name="name" value="" />
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
              style={{
                background: "linear-gradient(135deg, rgba(184, 140, 245, 0.1), rgba(240, 196, 100, 0.1))",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-lavender)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>New Collection</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Organize your photos</p>
          </form>

          {/* Existing collections */}
          {collections.map((col, index) => (
            <Link
              key={col.id}
              href={`/collections/${col.id}`}
              className="collection-card group rounded-2xl overflow-hidden transition-all duration-300"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                animation: `slide-up 0.4s ease forwards`,
                animationDelay: `${index * 0.06}s`,
                opacity: 0,
              }}
            >
              {/* Cover thumbnails */}
              <div className="relative h-28 overflow-hidden">
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
              <div className="px-4 pb-4 -mt-2 relative z-10">
                <div className="flex items-center gap-1.5 mb-1">
                  <h3 className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>
                    {col.name}
                  </h3>
                  {!col.isPublic && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  )}
                </div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {col._count.photos} photo{col._count.photos !== 1 ? 's' : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Photo grid or empty state */}
      {photos.length === 0 ? (
        <div
          className="text-center py-20 rounded-2xl"
          style={{
            background: "var(--bg-surface)",
            border: "2px dashed var(--border-subtle)",
          }}
        >
          {/* Empty state illustration */}
          <div
            className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(240, 112, 104, 0.1), rgba(184, 140, 245, 0.1))",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-lavender)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            Your gallery is empty
          </h3>
          <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: "var(--text-muted)" }}>
            Upload your first photo to start building your aesthetic portfolio.
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg, var(--accent-rose), var(--accent-amber))",
              color: "var(--bg-deep)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17,8 12,3 7,8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload First Photo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {photos.map((photo, index) => {
            const edit = photo.appliedEdit;
            const filterString = edit
              ? buildCssFilter({
                  brightness: edit.brightness,
                  contrast: edit.contrast,
                  saturation: (edit as Record<string, unknown>).saturation as number ?? 100,
                  hueRotate: (edit as Record<string, unknown>).hueRotate as number ?? 0,
                  sepia: (edit as Record<string, unknown>).sepia as number ?? 0,
                  grayscale: (edit as Record<string, unknown>).grayscale as number ?? 0,
                  blur: (edit as Record<string, unknown>).blur as number ?? 0,
                })
              : "none";

            return (
              <div
                key={photo.id}
                className="group relative aspect-4/5 rounded-2xl overflow-hidden"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  animation: `slide-up 0.5s ease forwards`,
                  animationDelay: `${index * 0.08}s`,
                  opacity: 0,
                }}
              >
                <Image
                  src={photo.imageUrl}
                  alt={photo.caption || "Gallery image"}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ filter: filterString }}
                />
                {/* Edit overlay tint */}
                {edit?.overlay && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: edit.overlay }}
                  />
                )}

                {/* Filter name badge */}
                {edit && edit.filterName !== "None" && (
                  <div
                    className="absolute top-3 left-3 z-10 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
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

                {/* Hover overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-5"
                  style={{
                    background: "linear-gradient(to top, rgba(13,10,18,0.95) 0%, rgba(13,10,18,0.3) 40%, transparent 100%)",
                  }}
                >
                  {/* Action buttons */}
                  <div className="flex justify-end gap-2 relative z-20">
                    <AddToCollectionModal
                      photoId={photo.id}
                      trigger={
                        <button
                          className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                          style={{
                            background: "rgba(13, 10, 18, 0.6)",
                            backdropFilter: "blur(4px)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-primary)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "var(--bg-elevated)";
                            e.currentTarget.style.color = "var(--accent-lavender)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(13, 10, 18, 0.6)";
                            e.currentTarget.style.color = "var(--text-primary)";
                          }}
                          title="Add to Collection"
                          onClick={(e) => e.preventDefault()}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                        </button>
                      }
                    />
                    {/* Edit button */}
                    <Link
                      href={`/edit/${photo.id}`}
                      className="p-2.5 rounded-xl transition-all duration-200 hover:scale-110"
                      style={{
                        background: "rgba(184, 140, 245, 0.15)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(184, 140, 245, 0.3)",
                        color: "var(--accent-lavender)",
                      }}
                      title="Edit photo"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </Link>
                    {/* Delete button */}
                    <form action={deletePhotoAction}>
                      <input type="hidden" name="id" value={photo.id} />
                      <button
                        type="submit"
                        className="p-2.5 rounded-xl transition-all duration-200 hover:scale-110"
                        style={{
                          background: "rgba(240, 112, 104, 0.15)",
                          backdropFilter: "blur(8px)",
                          border: "1px solid rgba(240, 112, 104, 0.3)",
                          color: "var(--accent-rose)",
                        }}
                        title="Delete photo"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                    </form>
                  </div>

                  {/* Caption + engagement */}
                  <div>
                    {photo.caption && (
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {photo.caption}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        {photo._count.likes}
                      </span>
                      <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        {photo._count.comments}
                      </span>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {new Date(photo.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}