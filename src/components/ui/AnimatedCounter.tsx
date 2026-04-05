"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  label: string;
  icon: React.ReactNode;
}

export default function AnimatedCounter({
  end,
  duration = 2000,
  suffix = "",
  prefix = "",
  label,
  icon,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTime: number;
          const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return (
    <div
      ref={ref}
      className="glass glass-hover rounded-2xl p-6 text-center group cursor-default transition-all duration-500 hover:scale-105"
    >
      <div className="flex items-center justify-center mb-3 text-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-300">
        {icon}
      </div>
      <div className="text-4xl md:text-5xl font-extrabold tracking-tight gradient-text-warm">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm font-medium mt-2" style={{ color: "var(--text-secondary)" }}>
        {label}
      </div>
    </div>
  );
}
