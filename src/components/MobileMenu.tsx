"use client";

import { useState } from "react";
import Link from "next/link";
import { signOutAction } from "@/app/actions/auth";

interface MobileMenuProps {
  isSignedIn: boolean;
  user?: {
    name?: string | null;
    email?: string | null;
    username?: string;
  };
}

export default function MobileMenu({ isSignedIn, user }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  const displayName = user?.name || user?.username || user?.email?.split("@")[0] || "User";

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg transition-colors duration-200"
        style={{ color: "var(--text-secondary)" }}
        aria-label="Toggle menu"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: "rgba(13, 10, 18, 0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in panel */}
      <div
        className="fixed top-0 right-0 h-full w-72 z-50 glass flex flex-col transition-transform duration-300 ease-out"
        style={{
          transform: open ? "translateX(0)" : "translateX(100%)",
          borderLeft: "1px solid var(--border-subtle)",
          background: "var(--bg-surface)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 h-16"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <span className="text-lg font-bold tracking-tighter" style={{ color: "var(--text-primary)" }}>
            Aura<span style={{ color: "var(--accent-lavender)" }}>Edit</span>
          </span>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* User info (if signed in) */}
        {isSignedIn && user && (
          <div
            className="px-5 py-4"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background: "linear-gradient(135deg, var(--accent-rose), var(--accent-lavender))",
                  color: "var(--bg-deep)",
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {displayName}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {isSignedIn ? (
            <>
              <MobileNavLink href="/dashboard" onClick={() => setOpen(false)} icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              }>
                Dashboard
              </MobileNavLink>
              <MobileNavLink href="/upload" onClick={() => setOpen(false)} icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              }>
                Upload Photo
              </MobileNavLink>
              {user?.username && (
                <MobileNavLink href={`/${user.username}`} onClick={() => setOpen(false)} icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                }>
                  My Profile
                </MobileNavLink>
              )}

              <div className="pt-4 mt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200"
                    style={{ color: "var(--accent-rose)" }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Sign Out
                  </button>
                </form>
              </div>
            </>
          ) : (
            <>
              <MobileNavLink href="/login" onClick={() => setOpen(false)} icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10,17 15,12 10,7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              }>
                Sign In
              </MobileNavLink>
              <div className="px-3 mt-3">
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-300"
                  style={{
                    background: "linear-gradient(135deg, var(--accent-rose), var(--accent-amber))",
                    color: "var(--bg-deep)",
                  }}
                >
                  Get Started
                </Link>
              </div>
            </>
          )}
        </nav>
      </div>
    </div>
  );
}

function MobileNavLink({
  href,
  onClick,
  icon,
  children,
}: {
  href: string;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200"
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
      {icon}
      {children}
    </Link>
  );
}
