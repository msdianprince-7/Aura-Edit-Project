"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOutAction } from "@/app/actions/auth";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string;
  };
}

export default function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const displayName = user.name || user.username || user.email?.split("@")[0] || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      {/* Avatar trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 rounded-full transition-all duration-300 pr-3 pl-1 py-1 group"
        style={{
          background: open ? "var(--bg-elevated)" : "transparent",
          border: `1px solid ${open ? "var(--border-hover)" : "transparent"}`,
        }}
        aria-label="User menu"
        aria-expanded={open}
      >
        {/* Avatar circle */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-transform duration-300 group-hover:scale-110"
          style={{
            background: "linear-gradient(135deg, var(--accent-rose), var(--accent-lavender))",
            color: "var(--bg-deep)",
          }}
        >
          {user.image ? (
            <img
              src={user.image}
              alt={displayName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            initial
          )}
        </div>
        {/* Name (hidden on mobile) */}
        <span
          className="text-sm font-medium hidden md:block"
          style={{ color: "var(--text-primary)" }}
        >
          {displayName}
        </span>
        {/* Chevron */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-muted)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`hidden md:block transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-64 rounded-xl glass overflow-hidden"
          style={{
            border: "1px solid var(--border-hover)",
            animation: "slide-up 0.2s ease forwards",
            boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
          }}
        >
          {/* User info header */}
          <div
            className="px-4 py-3"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {displayName}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {user.email}
            </p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/explore"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-200"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bg-elevated)";
                e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Explore
            </Link>

            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-200"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bg-elevated)";
                e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
              Dashboard
            </Link>

            <Link
              href="/upload"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-200"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bg-elevated)";
                e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17,8 12,3 7,8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload Photo
            </Link>

            {user.username && (
              <Link
                href={`/${user.username}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-200"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--bg-elevated)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                My Profile
              </Link>
            )}
          </div>

          {/* Sign out */}
          <div style={{ borderTop: "1px solid var(--border-subtle)" }} className="py-1">
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex items-center gap-3 px-4 py-2.5 text-sm w-full text-left transition-colors duration-200"
                style={{ color: "var(--accent-rose)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(240, 112, 104, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16,17 21,12 16,7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign Out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
