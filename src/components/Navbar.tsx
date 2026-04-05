// components/Navbar.tsx
import Link from "next/link";

export default function Navbar() {
  return (
    <nav
      className="fixed top-0 w-full z-50 glass"
      style={{ borderBottom: "1px solid var(--border-subtle)" }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* The Logo */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tighter"
          style={{ color: "var(--text-primary)" }}
        >
          Aura<span style={{ color: "var(--accent-lavender)" }}>Edit</span>
        </Link>

        {/* The Links */}
        <div className="flex gap-4 items-center">
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
        </div>
      </div>
    </nav>
  );
}