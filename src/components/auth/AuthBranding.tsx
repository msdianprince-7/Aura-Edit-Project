"use client";

export default function AuthBranding() {
  return (
    <div
      className="hidden lg:flex flex-col justify-between relative overflow-hidden rounded-3xl p-10"
      style={{
        background: "linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-card) 50%, var(--bg-elevated) 100%)",
        border: "1px solid var(--border-subtle)",
        minHeight: "600px",
      }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute -top-20 -right-20 w-80 h-80 blob opacity-30"
        style={{
          background: "radial-gradient(circle, var(--accent-rose) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute -bottom-20 -left-20 w-60 h-60 blob opacity-25"
        style={{
          background: "radial-gradient(circle, var(--accent-lavender) 0%, transparent 70%)",
          filter: "blur(50px)",
          animationDelay: "4s",
        }}
      />
      <div
        className="absolute top-1/2 left-1/3 w-40 h-40 opacity-15"
        style={{
          background: "radial-gradient(circle, var(--accent-amber) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(var(--accent-lavender) 1px, transparent 1px),
            linear-gradient(90deg, var(--accent-lavender) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Logo */}
      <div className="relative z-10">
        <span className="text-2xl font-bold tracking-tighter" style={{ color: "var(--text-primary)" }}>
          Aura<span style={{ color: "var(--accent-lavender)" }}>Edit</span>
        </span>
      </div>

      {/* Centered content */}
      <div className="relative z-10 space-y-6">
        <h2
          className="text-4xl font-extrabold tracking-tight leading-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Your aesthetic,
          <br />
          <span className="gradient-text-warm">amplified.</span>
        </h2>
        <p className="text-base leading-relaxed max-w-sm" style={{ color: "var(--text-secondary)" }}>
          Join thousands of creators building stunning portfolios. Upload, edit, and share your visual identity.
        </p>
      </div>

      {/* Floating decorative elements */}
      <div className="relative z-10 flex items-center gap-3">
        {/* Fake avatar stack */}
        <div className="flex -space-x-2">
          {["R", "A", "M", "K"].map((letter, i) => (
            <div
              key={letter}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2"
              style={{
                background: [
                  "linear-gradient(135deg, var(--accent-rose), var(--accent-coral, var(--accent-rose)))",
                  "linear-gradient(135deg, var(--accent-amber), var(--accent-rose))",
                  "linear-gradient(135deg, var(--accent-lavender), var(--accent-rose-light))",
                  "linear-gradient(135deg, var(--accent-rose-light), var(--accent-amber))",
                ][i],
                borderColor: "var(--bg-surface)",
                color: "var(--bg-deep)",
              }}
            >
              {letter}
            </div>
          ))}
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>12,500+</span> creators
        </p>
      </div>
    </div>
  );
}
