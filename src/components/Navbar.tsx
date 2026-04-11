// components/Navbar.tsx
import Link from "next/link";
import { auth } from "@/auth";
import UserMenu from "./UserMenu";
import MobileMenu from "./MobileMenu";

export default async function Navbar() {
  const session = await auth();
  const isSignedIn = !!session?.user;
  const user = session?.user as {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string;
  } | undefined;

  return (
    <nav
      className="fixed top-0 w-full z-50 glass"
      style={{ borderBottom: "1px solid var(--border-subtle)" }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tighter"
          style={{ color: "var(--text-primary)" }}
        >
          Aura<span style={{ color: "var(--accent-lavender)" }}>Edit</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          {/* Explore — visible to everyone */}
          <Link
            href="/explore"
            className="text-sm font-medium px-4 py-2 rounded-full transition-all duration-200 hover:opacity-100 opacity-70"
            style={{ color: "var(--text-primary)" }}
          >
            Explore
          </Link>

          {isSignedIn ? (
            <>
              {/* Quick nav links */}
              <Link
                href="/dashboard"
                className="text-sm font-medium px-4 py-2 rounded-full transition-all duration-200 hover:opacity-100 opacity-70"
                style={{ color: "var(--text-primary)" }}
              >
                Dashboard
              </Link>
              <Link
                href="/upload"
                className="text-sm font-medium px-4 py-2 rounded-full transition-all duration-200 hover:opacity-100 opacity-70"
                style={{ color: "var(--text-primary)" }}
              >
                Upload
              </Link>
              {/* User avatar dropdown */}
              <div className="ml-2">
                <UserMenu user={user!} />
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium transition-colors px-4 py-2 rounded-full hover:opacity-100 opacity-70"
                style={{ color: "var(--text-primary)" }}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold px-5 py-2 rounded-full transition-all duration-300 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, var(--accent-rose), var(--accent-amber))",
                  color: "var(--bg-deep)",
                }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu */}
        <MobileMenu isSignedIn={isSignedIn} user={user} />
      </div>
    </nav>
  );
}