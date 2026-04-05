// src/app/dashboard/page.tsx
import Image from 'next/image';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { deletePhotoAction } from './action';
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch only the current user's photos
  const [photos, user] = await Promise.all([
    prisma.photo.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, createdAt: true },
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
          {photos.map((photo, index) => (
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
              />

              {/* Hover overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-5"
                style={{
                  background: "linear-gradient(to top, rgba(13,10,18,0.95) 0%, rgba(13,10,18,0.3) 40%, transparent 100%)",
                }}
              >
                {/* Delete button */}
                <div className="flex justify-end">
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

                {/* Caption */}
                <div>
                  {photo.caption && (
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
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
          ))}
        </div>
      )}
    </div>
  );
}