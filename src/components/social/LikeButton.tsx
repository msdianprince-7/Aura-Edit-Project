"use client";

import { useState, useTransition } from "react";
import { toggleLikeAction } from "@/app/actions/social";

interface LikeButtonProps {
  photoId: string;
  initialLiked: boolean;
  initialCount: number;
  size?: "sm" | "md";
}

export default function LikeButton({
  photoId,
  initialLiked,
  initialCount,
  size = "md",
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();
  const [animating, setAnimating] = useState(false);

  const handleClick = () => {
    // Optimistic update
    const newLiked = !liked;
    setLiked(newLiked);
    setCount((c) => (newLiked ? c + 1 : c - 1));

    if (newLiked) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 600);
    }

    startTransition(async () => {
      try {
        await toggleLikeAction(photoId);
      } catch {
        // Revert on error
        setLiked(!newLiked);
        setCount((c) => (newLiked ? c - 1 : c + 1));
      }
    });
  };

  const iconSize = size === "sm" ? 16 : 20;

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="like-button flex items-center gap-1.5 transition-all duration-200 group"
      style={{
        color: liked ? "var(--accent-rose)" : "var(--text-muted)",
        opacity: isPending ? 0.7 : 1,
      }}
      title={liked ? "Unlike" : "Like"}
    >
      <div className={`relative ${animating ? "like-pop" : ""}`}>
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill={liked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-200 group-hover:scale-110"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        {/* Burst particles */}
        {animating && (
          <div className="like-burst">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="like-particle"
                style={{
                  transform: `rotate(${i * 60}deg)`,
                }}
              />
            ))}
          </div>
        )}
      </div>
      {count > 0 && (
        <span
          className={`font-semibold tabular-nums ${size === "sm" ? "text-xs" : "text-sm"}`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
