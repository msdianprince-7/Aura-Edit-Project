"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getUserCollectionsAction,
  addPhotoToCollectionAction,
  removePhotoFromCollectionAction,
  createCollectionAction,
} from "@/app/actions/collection";

interface CollectionItem {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  photoCount: number;
  hasPhoto: boolean;
}

interface AddToCollectionModalProps {
  photoId: string;
  trigger: React.ReactNode;
}

export default function AddToCollectionModal({ photoId, trigger }: AddToCollectionModalProps) {
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Load collections when modal opens
  const loadCollections = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUserCollectionsAction(photoId);
      setCollections(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [photoId]);

  useEffect(() => {
    if (open) {
      loadCollections();
    }
  }, [open, loadCollections]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open]);

  // Toggle photo in/out of collection
  const handleToggle = async (collectionId: string, currentlyHas: boolean) => {
    setToggling(collectionId);
    try {
      if (currentlyHas) {
        await removePhotoFromCollectionAction(collectionId, photoId);
      } else {
        await addPhotoToCollectionAction(collectionId, photoId);
      }
      // Update local state
      setCollections((prev) =>
        prev.map((c) =>
          c.id === collectionId
            ? {
                ...c,
                hasPhoto: !currentlyHas,
                photoCount: currentlyHas ? c.photoCount - 1 : c.photoCount + 1,
              }
            : c
        )
      );
    } catch {
      // silently fail
    } finally {
      setToggling(null);
    }
  };

  // Create new collection and add photo
  const handleCreateAndAdd = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const formData = new FormData();
      formData.set("name", newName.trim());
      formData.set("description", "");
      formData.set("isPublic", "true");
      await createCollectionAction(formData);
    } catch {
      // The redirect in createCollectionAction will cause an error in client,
      // so we reload collections instead
      await loadCollections();
      setNewName("");
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      {/* Trigger button */}
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {trigger}
      </div>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{
            background: "rgba(13, 10, 18, 0.7)",
            backdropFilter: "blur(8px)",
            animation: "fade-in 0.2s ease",
          }}
        >
          <div
            ref={modalRef}
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-hover)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
              animation: "slide-up 0.3s ease forwards",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(184, 140, 245, 0.15), rgba(240, 196, 100, 0.15))",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-lavender)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  Add to Collection
                </h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Collection list */}
            <div className="max-h-[300px] overflow-y-auto notification-list">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                      <div className="w-10 h-10 rounded-lg skeleton" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-2/3 skeleton" />
                        <div className="h-2 w-1/3 skeleton" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : collections.length === 0 ? (
                <div className="p-8 text-center">
                  <div
                    className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, rgba(184, 140, 245, 0.1), rgba(240, 112, 104, 0.1))",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                    No collections yet
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Create one below to start organizing
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  {collections.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleToggle(c.id, c.hasPhoto)}
                      disabled={toggling === c.id}
                      className="collection-toggle-item w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left"
                      style={{
                        background: c.hasPhoto ? "rgba(184, 140, 245, 0.06)" : "transparent",
                      }}
                    >
                      {/* Checkbox */}
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all duration-200"
                        style={{
                          background: c.hasPhoto
                            ? "linear-gradient(135deg, var(--accent-lavender), var(--accent-rose))"
                            : "var(--bg-elevated)",
                          border: c.hasPhoto ? "none" : "1px solid var(--border-subtle)",
                        }}
                      >
                        {toggling === c.id ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--bg-deep)" strokeWidth="3" style={{ animation: "spin-slow 1s linear infinite" }}>
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                          </svg>
                        ) : c.hasPhoto ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--bg-deep)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20,6 9,17 4,12" />
                          </svg>
                        ) : null}
                      </div>

                      {/* Collection info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                          {c.name}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {c.photoCount} photo{c.photoCount !== 1 ? "s" : ""}
                          {!c.isPublic && " · Private"}
                        </p>
                      </div>

                      {/* Folder icon */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" className="shrink-0">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Create new collection */}
            <div
              className="px-4 py-4"
              style={{ borderTop: "1px solid var(--border-subtle)" }}
            >
              <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>
                Create new collection
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Street Photography"
                  maxLength={50}
                  className="flex-1 px-3 py-2 rounded-xl text-sm outline-none transition-all duration-200"
                  style={{
                    background: "var(--bg-deep)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent-lavender)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(184, 140, 245, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateAndAdd();
                  }}
                />
                <button
                  onClick={handleCreateAndAdd}
                  disabled={creating || !newName.trim()}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] disabled:opacity-40"
                  style={{
                    background: "linear-gradient(135deg, var(--accent-rose), var(--accent-amber))",
                    color: "var(--bg-deep)",
                  }}
                >
                  {creating ? "..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
