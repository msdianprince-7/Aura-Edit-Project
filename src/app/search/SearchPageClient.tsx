"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import LikeButton from "@/components/social/LikeButton";

type Tab = "all" | "users" | "photos" | "collections";

interface SearchPageClientProps {
  initialQuery: string;
  users: {
    id: string;
    username: string;
    bio: string | null;
    _count: { followers: number; photos: number; following: number };
  }[];
  photos: {
    id: string;
    imageUrl: string;
    caption: string | null;
    createdAt: string;
    filterString: string;
    overlay: string | null;
    filterName: string | null;
    isLiked: boolean;
    likeCount: number;
    user: { username: string };
    _count: { comments: number };
  }[];
  collections: {
    id: string;
    name: string;
    description: string | null;
    user: { username: string };
    _count: { photos: number };
    photos: {
      id: string;
      photo: { imageUrl: string };
    }[];
  }[];
  currentUserId: string | null;
}

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim() || !text) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="search-highlight">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function SearchPageClient({
  initialQuery,
  users,
  photos,
  collections,
  currentUserId,
}: SearchPageClientProps) {
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const router = useRouter();

  const totalResults = users.length + photos.length + collections.length;

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "all", label: "All", count: totalResults },
    { id: "users", label: "Users", count: users.length },
    { id: "photos", label: "Photos", count: photos.length },
    { id: "collections", label: "Collections", count: collections.length },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div style={{ animation: "slide-up 0.6s ease forwards" }}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
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
              Search
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Find users, photos, and collections
            </p>
          </div>
        </div>

        {/* Search input */}
        <form onSubmit={handleSearch}>
          <div className="search-page-input-wrapper">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-lavender)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7, flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users, photos by caption, collections…"
              className="search-page-input"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  router.push("/search");
                }}
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  border: "none",
                  background: "var(--bg-elevated)",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
            <button
              type="submit"
              className="text-sm font-semibold px-5 py-2 rounded-xl transition-all duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, var(--accent-rose), var(--accent-amber))",
                color: "var(--bg-deep)",
                border: "none",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Content */}
      {!initialQuery ? (
        /* No query — show suggestions */
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
            Search the AuraEdit community
          </h3>
          <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: "var(--text-muted)" }}>
            Find creators by username, discover photos by caption, or browse public collections.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {["landscape", "portrait", "sunset", "nature"].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setQuery(suggestion);
                  router.push(`/search?q=${suggestion}`);
                }}
                className="px-4 py-2 rounded-full text-xs font-medium transition-all duration-200"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      ) : totalResults === 0 ? (
        /* No results */
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
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="8" x2="14" y2="14" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            No results for &ldquo;{initialQuery}&rdquo;
          </h3>
          <p className="text-sm max-w-sm mx-auto" style={{ color: "var(--text-muted)" }}>
            Try a different search term or check spelling. You can search by username, photo caption, or collection name.
          </p>
        </div>
      ) : (
        /* Results */
        <>
          {/* Results summary */}
          <div
            className="flex items-center gap-6 px-5 py-3 rounded-xl mb-6"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              {totalResults} result{totalResults !== 1 ? "s" : ""} for &ldquo;{initialQuery}&rdquo;
            </span>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="search-page-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`search-page-tab ${activeTab === tab.id ? "active" : ""}`}
                >
                  {tab.label}
                  <span className="search-page-tab-badge">{tab.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Users */}
          {(activeTab === "all" || activeTab === "users") && users.length > 0 && (
            <div className="mb-10">
              {activeTab === "all" && (
                <h2 className="text-lg font-bold tracking-tight mb-4" style={{ color: "var(--text-primary)" }}>
                  Users
                </h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user, index) => (
                  <Link
                    key={user.id}
                    href={`/${user.username}`}
                    className="search-user-card"
                    style={{
                      animation: `slide-up 0.4s ease forwards`,
                      animationDelay: `${index * 0.05}s`,
                      opacity: 0,
                    }}
                  >
                    <div className="search-user-card-avatar">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="search-user-card-info">
                      <span className="search-user-card-name">
                        @<HighlightText text={user.username} query={initialQuery} />
                      </span>
                      {user.bio && (
                        <p className="search-user-card-bio">{user.bio}</p>
                      )}
                      <div className="search-user-card-stats">
                        <span className="search-user-card-stat">
                          <strong style={{ color: "var(--text-primary)" }}>{user._count.photos}</strong> photos
                        </span>
                        <span className="search-user-card-stat">
                          <strong style={{ color: "var(--text-primary)" }}>{user._count.followers}</strong> followers
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Photos */}
          {(activeTab === "all" || activeTab === "photos") && photos.length > 0 && (
            <div className="mb-10">
              {activeTab === "all" && (
                <h2 className="text-lg font-bold tracking-tight mb-4" style={{ color: "var(--text-primary)" }}>
                  Photos
                </h2>
              )}
              <div className="explore-grid">
                {photos.map((photo, index) => (
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
                    <Link href={`/photo/${photo.id}`}>
                      <div className="relative aspect-[4/5]">
                        <Image
                          src={photo.imageUrl}
                          alt={photo.caption || "Photo"}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          style={{ filter: photo.filterString }}
                        />
                        {photo.overlay && (
                          <div className="absolute inset-0 pointer-events-none" style={{ background: photo.overlay }} />
                        )}
                        {photo.filterName && photo.filterName !== "None" && (
                          <div
                            className="absolute top-3 right-3 z-10 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                            style={{
                              background: "rgba(13, 10, 18, 0.7)",
                              backdropFilter: "blur(8px)",
                              border: "1px solid var(--border-subtle)",
                              color: "var(--accent-lavender)",
                            }}
                          >
                            {photo.filterName}
                          </div>
                        )}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5"
                          style={{
                            background: "linear-gradient(to top, rgba(13,10,18,0.95) 0%, rgba(13,10,18,0.3) 50%, transparent 100%)",
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                              style={{
                                background: "linear-gradient(135deg, var(--accent-rose), var(--accent-lavender))",
                                color: "var(--bg-deep)",
                              }}
                            >
                              {photo.user.username.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                              @{photo.user.username}
                            </span>
                          </div>
                          {photo.caption && (
                            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                              <HighlightText text={photo.caption} query={initialQuery} />
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                    <div
                      className="flex items-center justify-between px-4 py-3"
                      style={{ borderTop: "1px solid var(--border-subtle)" }}
                    >
                      <div className="flex items-center gap-4">
                        {currentUserId ? (
                          <LikeButton
                            photoId={photo.id}
                            initialLiked={photo.isLiked}
                            initialCount={photo.likeCount}
                            size="sm"
                          />
                        ) : (
                          <div className="flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            <span className="text-xs font-semibold">{photo.likeCount}</span>
                          </div>
                        )}
                        <Link href={`/photo/${photo.id}`} className="flex items-center gap-1.5 transition-colors" style={{ color: "var(--text-muted)" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          <span className="text-xs font-semibold">{photo._count.comments}</span>
                        </Link>
                      </div>
                      <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                        {new Date(photo.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Collections */}
          {(activeTab === "all" || activeTab === "collections") && collections.length > 0 && (
            <div className="mb-10">
              {activeTab === "all" && (
                <h2 className="text-lg font-bold tracking-tight mb-4" style={{ color: "var(--text-primary)" }}>
                  Collections
                </h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {collections.map((col, index) => (
                  <Link
                    key={col.id}
                    href={`/collections/${col.id}`}
                    className="group rounded-2xl overflow-hidden transition-all duration-300 block explore-card"
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-subtle)",
                      animation: `slide-up 0.4s ease forwards`,
                      animationDelay: `${index * 0.06}s`,
                      opacity: 0,
                    }}
                  >
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
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--bg-surface) 0%, transparent 60%)" }} />
                    </div>
                    <div className="px-5 pb-5 -mt-3 relative z-10">
                      <h3 className="text-sm font-bold mb-1 truncate" style={{ color: "var(--text-primary)" }}>
                        <HighlightText text={col.name} query={initialQuery} />
                      </h3>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        by @{col.user.username} · {col._count.photos} photo{col._count.photos !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
