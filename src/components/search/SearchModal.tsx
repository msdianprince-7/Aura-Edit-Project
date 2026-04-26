"use client";

import { useState, useEffect, useRef, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { searchAction, type SearchResults } from "@/app/actions/search";

type Tab = "all" | "users" | "photos" | "collections";

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim() || !text) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="search-highlight">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Keyboard shortcut: Ctrl+K / ⌘K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults(null);
      setActiveTab("all");
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const data = await searchAction(query, 5);
        setResults(data);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleViewAll = useCallback(() => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  }, [query, router]);

  const totalResults = results
    ? results.users.length + results.photos.length + results.collections.length
    : 0;

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "all", label: "All", count: totalResults },
    { id: "users", label: "Users", count: results?.users.length || 0 },
    { id: "photos", label: "Photos", count: results?.photos.length || 0 },
    { id: "collections", label: "Collections", count: results?.collections.length || 0 },
  ];

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="search-trigger"
        aria-label="Search"
        title="Search (Ctrl+K)"
      >
        <span className="search-trigger-label">Search</span>
        <kbd className="search-trigger-kbd">⌘K</kbd>
      </button>

      {/* Modal */}
      {open && (
        <div className="search-overlay" onClick={() => setOpen(false)}>
          <div
            className="search-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="search-input-wrapper">
              <svg
                className="search-input-icon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users, photos, collections…"
                className="search-input"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleViewAll();
                }}
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setResults(null);
                    inputRef.current?.focus();
                  }}
                  className="search-input-clear"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="search-input-esc"
              >
                ESC
              </button>
            </div>

            {/* Content */}
            <div className="search-body">
              {/* Loading skeleton */}
              {isPending && (
                <div className="search-loading">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="search-skeleton-item">
                      <div className="skeleton" style={{ width: 40, height: 40, borderRadius: "50%" }} />
                      <div style={{ flex: 1 }}>
                        <div className="skeleton" style={{ width: "60%", height: 14, marginBottom: 8 }} />
                        <div className="skeleton" style={{ width: "40%", height: 10 }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state — no query */}
              {!query.trim() && !isPending && (
                <div className="search-empty">
                  <div className="search-empty-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-lavender)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <p className="search-empty-title">Start typing to search</p>
                  <p className="search-empty-hint">
                    Find users, photos by caption, or public collections
                  </p>
                </div>
              )}

              {/* No results */}
              {results && totalResults === 0 && !isPending && (
                <div className="search-empty">
                  <div className="search-empty-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      <line x1="8" y1="8" x2="14" y2="14" />
                    </svg>
                  </div>
                  <p className="search-empty-title">No results found</p>
                  <p className="search-empty-hint">
                    Try a different search term or check spelling
                  </p>
                </div>
              )}

              {/* Results */}
              {results && totalResults > 0 && !isPending && (
                <>
                  {/* Tabs */}
                  <div className="search-tabs">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`search-tab ${activeTab === tab.id ? "active" : ""}`}
                      >
                        {tab.label}
                        {tab.count > 0 && (
                          <span className="search-tab-count">{tab.count}</span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="search-results">
                    {/* Users */}
                    {(activeTab === "all" || activeTab === "users") &&
                      results.users.length > 0 && (
                        <div className="search-result-section">
                          {activeTab === "all" && (
                            <div className="search-section-label">Users</div>
                          )}
                          {results.users.map((user) => (
                            <Link
                              key={user.id}
                              href={`/${user.username}`}
                              onClick={() => setOpen(false)}
                              className="search-result-item"
                            >
                              <div className="search-user-avatar">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                              <div className="search-result-info">
                                <span className="search-result-title">
                                  @<HighlightMatch text={user.username} query={query} />
                                </span>
                                <span className="search-result-meta">
                                  {user._count.photos} photos · {user._count.followers} followers
                                </span>
                              </div>
                              <svg className="search-result-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9,18 15,12 9,6" />
                              </svg>
                            </Link>
                          ))}
                        </div>
                      )}

                    {/* Photos */}
                    {(activeTab === "all" || activeTab === "photos") &&
                      results.photos.length > 0 && (
                        <div className="search-result-section">
                          {activeTab === "all" && (
                            <div className="search-section-label">Photos</div>
                          )}
                          {results.photos.map((photo) => (
                            <Link
                              key={photo.id}
                              href={`/photo/${photo.id}`}
                              onClick={() => setOpen(false)}
                              className="search-result-item"
                            >
                              <div className="search-photo-thumb">
                                <Image
                                  src={photo.imageUrl}
                                  alt={photo.caption || "Photo"}
                                  width={40}
                                  height={40}
                                  className="search-photo-img"
                                />
                              </div>
                              <div className="search-result-info">
                                <span className="search-result-title">
                                  <HighlightMatch text={photo.caption || "Untitled"} query={query} />
                                </span>
                                <span className="search-result-meta">
                                  by @{photo.user.username}
                                  {photo.appliedEdit?.filterName && photo.appliedEdit.filterName !== "None" && ` · ${photo.appliedEdit.filterName}`}
                                  {" · "}
                                  {photo._count.likes} ♥
                                </span>
                              </div>
                              <svg className="search-result-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9,18 15,12 9,6" />
                              </svg>
                            </Link>
                          ))}
                        </div>
                      )}

                    {/* Collections */}
                    {(activeTab === "all" || activeTab === "collections") &&
                      results.collections.length > 0 && (
                        <div className="search-result-section">
                          {activeTab === "all" && (
                            <div className="search-section-label">Collections</div>
                          )}
                          {results.collections.map((col) => (
                            <Link
                              key={col.id}
                              href={`/collections/${col.id}`}
                              onClick={() => setOpen(false)}
                              className="search-result-item"
                            >
                              <div className="search-collection-thumb">
                                {col.photos.length > 0 ? (
                                  <Image
                                    src={col.photos[0].photo.imageUrl}
                                    alt=""
                                    width={40}
                                    height={40}
                                    className="search-photo-img"
                                  />
                                ) : (
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
                                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                  </svg>
                                )}
                              </div>
                              <div className="search-result-info">
                                <span className="search-result-title">
                                  <HighlightMatch text={col.name} query={query} />
                                </span>
                                <span className="search-result-meta">
                                  by @{col.user.username} · {col._count.photos} photos
                                </span>
                              </div>
                              <svg className="search-result-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9,18 15,12 9,6" />
                              </svg>
                            </Link>
                          ))}
                        </div>
                      )}
                  </div>

                  {/* View all */}
                  <div className="search-footer">
                    <button onClick={handleViewAll} className="search-view-all">
                      View all results for &ldquo;{query}&rdquo;
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9,18 15,12 9,6" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
