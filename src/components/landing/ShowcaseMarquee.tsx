"use client";

import { useRef, useState, useEffect } from "react";

// Curated aesthetic sample images from Unsplash
const showcaseImages = [
  {
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop",
    caption: "Mountain Serenity",
  },
  {
    url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=500&fit=crop",
    caption: "Ocean Dreams",
  },
  {
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
    caption: "Portrait Light",
  },
  {
    url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=500&fit=crop",
    caption: "Morning Fog",
  },
  {
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=500&fit=crop",
    caption: "Starlit Peaks",
  },
  {
    url: "https://images.unsplash.com/photo-1501436513145-30f24e19fcc8?w=400&h=500&fit=crop",
    caption: "Golden Hour",
  },
  {
    url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=500&fit=crop",
    caption: "Stage Glow",
  },
  {
    url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=500&fit=crop",
    caption: "Neon Nights",
  },
];

export default function ShowcaseMarquee() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Duplicate for seamless loop
  const allImages = [...showcaseImages, ...showcaseImages];

  return (
    <section ref={containerRef} className="py-20 relative overflow-hidden">
      {/* Section header */}
      <div className="text-center mb-12 px-4">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          A gallery of <span className="gradient-text-lavender">inspiration</span>
        </h2>
        <p className="mt-4 text-lg" style={{ color: "var(--text-secondary)" }}>
          See what creators are building with AuraEdit.
        </p>
      </div>

      {/* Marquee container */}
      <div className="relative">
        {/* Left fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
          style={{
            background: `linear-gradient(to right, var(--bg-deep), transparent)`,
          }}
        />
        {/* Right fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
          style={{
            background: `linear-gradient(to left, var(--bg-deep), transparent)`,
          }}
        />

        {/* Scrolling row */}
        <div
          className="flex gap-6 w-max"
          style={{
            animation: isVisible ? "marquee 40s linear infinite" : "none",
          }}
        >
          {allImages.map((img, i) => (
            <div
              key={i}
              className="group relative w-[280px] h-[360px] rounded-2xl overflow-hidden flex-shrink-0 border transition-all duration-500 hover:scale-105"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              {/* Image */}
              <img
                src={img.url}
                alt={img.caption}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              {/* Overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6"
                style={{
                  background: "linear-gradient(to top, rgba(13, 10, 18, 0.9) 0%, rgba(13, 10, 18, 0.2) 40%, transparent 100%)",
                }}
              >
                <div>
                  <p className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>
                    {img.caption}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--accent-amber)" }}>
                    ✦ AuraEdit Creator
                  </p>
                </div>
              </div>
              {/* Corner accent */}
              <div
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 glass"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-rose)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
