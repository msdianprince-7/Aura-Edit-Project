"use client";

import Link from "next/link";

interface GlowButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function GlowButton({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
}: GlowButtonProps) {
  const sizeClasses = {
    sm: "px-5 py-2 text-sm",
    md: "px-8 py-3.5 text-base",
    lg: "px-10 py-4 text-lg",
  };

  const baseClasses =
    "relative inline-flex items-center justify-center font-semibold rounded-full transition-all duration-300 overflow-hidden group";

  if (variant === "primary") {
    return (
      <Link href={href} className={`${baseClasses} ${sizeClasses[size]} ${className}`}>
        {/* Glow backdrop */}
        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--accent-rose)] via-[var(--accent-amber)] to-[var(--accent-lavender)] opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
        {/* Animated shimmer */}
        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        {/* Outer glow */}
        <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-[var(--accent-rose)] via-[var(--accent-amber)] to-[var(--accent-lavender)] opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-500" />
        {/* Text */}
        <span className="relative z-10 text-[var(--bg-deep)] font-bold">{children}</span>
      </Link>
    );
  }

  if (variant === "secondary") {
    return (
      <Link
        href={href}
        className={`${baseClasses} ${sizeClasses[size]} glass glass-hover ${className}`}
        style={{ color: "var(--text-primary)" }}
      >
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </Link>
    );
  }

  // Outline variant
  return (
    <Link href={href} className={`${baseClasses} ${sizeClasses[size]} ${className}`}>
      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--accent-rose)] to-[var(--accent-lavender)] p-[1.5px]">
        <span className="w-full h-full rounded-full block" style={{ background: "var(--bg-deep)" }} />
      </span>
      <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-[var(--accent-rose)] to-[var(--accent-lavender)] opacity-0 group-hover:opacity-25 blur-xl transition-opacity duration-500" />
      <span className="relative z-10 gradient-text-warm font-bold">{children}</span>
    </Link>
  );
}
