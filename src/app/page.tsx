// src/app/page.tsx
import Link from "next/link";
import GlowButton from "@/components/ui/GlowButton";
import StatsSection from "@/components/landing/StatsSection";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import ShowcaseMarquee from "@/components/landing/ShowcaseMarquee";

export default function Home() {
  return (
    <div className="relative -mt-6">
      {/* ════════════════════════════════
          BACKGROUND DECORATION
          ════════════════════════════════ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Top-right warm blob */}
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] blob opacity-30"
          style={{
            background: "radial-gradient(circle, var(--accent-rose) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        {/* Bottom-left lavender blob */}
        <div
          className="absolute -bottom-60 -left-40 w-[500px] h-[500px] blob opacity-20"
          style={{
            background: "radial-gradient(circle, var(--accent-lavender) 0%, transparent 70%)",
            filter: "blur(100px)",
            animationDelay: "4s",
          }}
        />
        {/* Center amber glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] opacity-10"
          style={{
            background: "radial-gradient(ellipse, var(--accent-amber) 0%, transparent 70%)",
            filter: "blur(120px)",
          }}
        />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(var(--accent-lavender) 1px, transparent 1px),
              linear-gradient(90deg, var(--accent-lavender) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ════════════════════════════════
          HERO SECTION
          ════════════════════════════════ */}
      <section className="relative flex flex-col items-center justify-center min-h-[92vh] text-center px-4">
        {/* Floating decorative ring */}
        <div
          className="absolute top-20 right-10 md:right-20 w-20 h-20 md:w-32 md:h-32 rounded-full border border-[var(--accent-rose)]/20 opacity-40"
          style={{ animation: "float 6s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-32 left-10 md:left-24 w-12 h-12 md:w-20 md:h-20 rounded-full opacity-30"
          style={{
            background: "linear-gradient(135deg, var(--accent-amber), var(--accent-rose))",
            animation: "float 8s ease-in-out infinite",
            animationDelay: "2s",
          }}
        />

        {/* Badge */}
        <div
          className="glass rounded-full px-5 py-2 text-xs font-medium tracking-widest uppercase mb-8"
          style={{
            color: "var(--accent-amber)",
            borderColor: "rgba(240, 196, 100, 0.2)",
            animation: "slide-up 0.6s ease forwards",
          }}
        >
          ✦ The Aesthetic Portfolio Engine
        </div>

        {/* Main heading */}
        <h1
          className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tight leading-[0.95] max-w-5xl"
          style={{ animation: "slide-up 0.7s ease forwards", animationDelay: "0.15s", opacity: 0, animationFillMode: "forwards" }}
        >
          Curate your{" "}
          <br className="hidden sm:block" />
          <span className="gradient-text-warm">
            Digital Aesthetic.
          </span>
        </h1>

        {/* Subheading */}
        <p
          className="max-w-2xl text-lg md:text-xl leading-relaxed mt-8"
          style={{
            color: "var(--text-secondary)",
            animation: "slide-up 0.7s ease forwards",
            animationDelay: "0.3s",
            opacity: 0,
            animationFillMode: "forwards",
          }}
        >
          The high-performance portfolio engine for creators.
          Upload your raw masterpieces, apply stunning edits, and share your
          <span className="gradient-text-rose font-semibold"> aura </span>
          with the world.
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row gap-4 mt-10"
          style={{
            animation: "slide-up 0.7s ease forwards",
            animationDelay: "0.45s",
            opacity: 0,
            animationFillMode: "forwards",
          }}
        >
          <GlowButton href="/register" variant="primary" size="lg">
            Start Creating — It&apos;s Free
          </GlowButton>
          <GlowButton href="/login" variant="secondary" size="lg">
            Sign In →
          </GlowButton>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 flex flex-col items-center gap-2"
          style={{
            color: "var(--text-muted)",
            animation: "fade-in 1s ease forwards",
            animationDelay: "1.5s",
            opacity: 0,
            animationFillMode: "forwards",
          }}
        >
          <span className="text-xs tracking-widest uppercase">Scroll to explore</span>
          <div className="w-5 h-8 rounded-full border-2 border-current flex justify-center pt-1">
            <div
              className="w-1 h-2 rounded-full bg-current"
              style={{ animation: "float 2s ease-in-out infinite" }}
            />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          FEATURES SECTION
          ════════════════════════════════ */}
      <FeaturesGrid />

      {/* ════════════════════════════════
          SHOWCASE MARQUEE
          ════════════════════════════════ */}
      <ShowcaseMarquee />

      {/* ════════════════════════════════
          STATS SECTION
          ════════════════════════════════ */}
      <StatsSection />

      {/* ════════════════════════════════
          FINAL CTA
          ════════════════════════════════ */}
      <section className="relative py-32 flex flex-col items-center text-center px-4">
        {/* Background glow */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div
            className="w-[500px] h-[300px] opacity-20"
            style={{
              background: "radial-gradient(ellipse, var(--accent-rose) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />
        </div>

        <h2
          className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 relative"
        >
          Ready to share your{" "}
          <span className="gradient-text-lavender">aura</span>?
        </h2>
        <p
          className="text-lg max-w-lg mb-10 relative"
          style={{ color: "var(--text-secondary)" }}
        >
          Join thousands of creators building stunning portfolios.
          Your aesthetic is waiting.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 relative">
          <GlowButton href="/register" variant="primary" size="lg">
            Create Your Portfolio
          </GlowButton>
          <GlowButton href="/login" variant="outline" size="lg">
            Sign In
          </GlowButton>
        </div>
      </section>

      {/* ════════════════════════════════
          FOOTER
          ════════════════════════════════ */}
      <footer
        className="border-t py-12 px-4"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tighter" style={{ color: "var(--text-primary)" }}>
              Aura<span style={{ color: "var(--accent-lavender)" }}>Edit</span>
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full glass" style={{ color: "var(--accent-amber)" }}>
              BETA
            </span>
          </div>
          <div className="flex gap-8 text-sm" style={{ color: "var(--text-muted)" }}>
            <Link href="/login" className="hover:text-[var(--text-primary)] transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-[var(--text-primary)] transition-colors">Sign Up</Link>
            <Link href="/dashboard" className="hover:text-[var(--text-primary)] transition-colors">Dashboard</Link>
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            © 2026 AuraEdit. Built with ♥ for creators.
          </p>
        </div>
      </footer>
    </div>
  );
}