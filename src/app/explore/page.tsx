// src/app/explore/page.tsx
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { buildCssFilter } from "@/lib/filters";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore | AuraEdit",
  description: "Discover stunning photos and creative edits from the AuraEdit community.",
};

export default async function ExplorePage() {
  const photos = await prisma.photo.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { username: true },
      },
      appliedEdit: true,
    },
    take: 60,
  });

  return (
    <div style={{ animation: "slide-up 0.6s ease forwards" }}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(184, 140, 245, 0.15), rgba(240, 112, 104, 0.15))",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-lavender)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Explore
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Discover stunning creations from the community
            </p>
          </div>
        </div>

        {/* Stats bar */}
        <div
          className="mt-4 flex items-center gap-6 px-5 py-3 rounded-xl"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--accent-rose)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              {photos.length} photos
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--accent-lavender)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              {new Set(photos.map((p) => p.user.username)).size} creators
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--accent-amber)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              {photos.filter((p) => p.appliedEdit).length} edited
            </span>
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
              background: "linear-gradient(135deg, rgba(184, 140, 245, 0.1), rgba(240, 112, 104, 0.1))",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-lavender)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            Nothing to explore yet
          </h3>
          <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: "var(--text-muted)" }}>
            Be the first to upload a photo and start the community.
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg, var(--accent-rose), var(--accent-amber))",
              color: "var(--bg-deep)",
            }}
          >
            Upload First Photo
          </Link>
        </div>
      ) : (
        <div className="explore-grid">
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
                className="group relative rounded-2xl overflow-hidden explore-card"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  animation: `slide-up 0.5s ease forwards`,
                  animationDelay: `${index * 0.04}s`,
                  opacity: 0,
                }}
              >
                <div className="relative aspect-[4/5]">
                  <Image
                    src={photo.imageUrl}
                    alt={photo.caption || "Community photo"}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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

                  {/* Edit badge */}
                  {edit && (
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

                  {/* Hover overlay */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5"
                    style={{
                      background: "linear-gradient(to top, rgba(13,10,18,0.95) 0%, rgba(13,10,18,0.3) 50%, transparent 100%)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Link
                        href={`/${photo.user.username}`}
                        className="flex items-center gap-2 group/user"
                      >
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{
                            background: "linear-gradient(135deg, var(--accent-rose), var(--accent-lavender))",
                            color: "var(--bg-deep)",
                          }}
                        >
                          {photo.user.username.charAt(0).toUpperCase()}
                        </div>
                        <span
                          className="text-sm font-semibold group-hover/user:underline"
                          style={{ color: "var(--text-primary)" }}
                        >
                          @{photo.user.username}
                        </span>
                      </Link>
                    </div>
                    {photo.caption && (
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {photo.caption}
                      </p>
                    )}
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      {new Date(photo.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
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
