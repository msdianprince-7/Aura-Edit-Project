"use client";

import { useRef, useState, useEffect } from "react";

const features = [
  {
    title: "Upload & Curate",
    description:
      "Drag, drop, and organize your visual masterpieces. Support for any image format with instant preview.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-rose)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="17,8 12,3 7,8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
    gradient: "from-[var(--accent-rose)] to-[var(--accent-coral)]",
    glowColor: "var(--glow-rose)",
  },
  {
    title: "Edit & Transform",
    description:
      "Apply stunning filters, adjust brightness & contrast, and add overlays to perfect your aesthetic.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
    gradient: "from-[var(--accent-amber)] to-[var(--accent-rose)]",
    glowColor: "var(--glow-amber)",
  },
  {
    title: "Share Your Aura",
    description:
      "Get a unique profile link. Share your curated portfolio across social platforms in one click.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-lavender)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
    gradient: "from-[var(--accent-lavender)] to-[var(--accent-rose-light)]",
    glowColor: "var(--glow-lavender)",
  },
];

export default function FeaturesGrid() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-4 relative">
      {/* Section header */}
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <div
          className="inline-block text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full glass mb-6"
          style={{ color: "var(--accent-lavender)" }}
        >
          How it works
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Three steps to your{" "}
          <span className="gradient-text-rose">perfect portfolio</span>
        </h2>
        <p className="mt-4 text-lg" style={{ color: "var(--text-secondary)" }}>
          Simple, powerful, and built for the modern creator.
        </p>
      </div>

      {/* Feature cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, i) => (
          <div
            key={feature.title}
            className="group relative glass rounded-2xl p-8 transition-all duration-500 hover:scale-[1.03] cursor-default"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(40px)",
              transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.15}s`,
            }}
          >
            {/* Hover glow */}
            <div
              className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
              style={{
                background: `radial-gradient(circle at center, ${feature.glowColor}, transparent 70%)`,
                filter: "blur(30px)",
              }}
            />

            {/* Step number */}
            <div
              className="absolute top-6 right-6 text-7xl font-black opacity-5 group-hover:opacity-10 transition-opacity duration-300"
              style={{ color: "var(--text-primary)" }}
            >
              {i + 1}
            </div>

            {/* Icon */}
            <div
              className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
              style={{ opacity: 0.9 }}
            >
              <div style={{ filter: "brightness(10)" }}>{feature.icon}</div>
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
              {feature.title}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {feature.description}
            </p>

            {/* Bottom accent line */}
            <div
              className={`h-0.5 w-0 group-hover:w-full bg-gradient-to-r ${feature.gradient} mt-6 transition-all duration-500 rounded-full`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
