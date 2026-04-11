"use client";

import { useState, useTransition } from "react";
import { toggleFollowAction } from "@/app/actions/social";

interface FollowButtonProps {
  targetUserId: string;
  initialFollowing: boolean;
  followerCount: number;
}

export default function FollowButton({
  targetUserId,
  initialFollowing,
  followerCount,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(followerCount);
  const [isPending, startTransition] = useTransition();
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    const newFollowing = !following;
    setFollowing(newFollowing);
    setCount((c) => (newFollowing ? c + 1 : c - 1));

    startTransition(async () => {
      try {
        await toggleFollowAction(targetUserId);
      } catch {
        setFollowing(!newFollowing);
        setCount((c) => (newFollowing ? c - 1 : c + 1));
      }
    });
  };

  const label = following
    ? hovered
      ? "Unfollow"
      : "Following"
    : "Follow";

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={isPending}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02]"
        style={{
          background: following
            ? hovered
              ? "rgba(240, 112, 104, 0.15)"
              : "var(--bg-elevated)"
            : "linear-gradient(135deg, var(--accent-rose), var(--accent-amber))",
          border: `1px solid ${
            following
              ? hovered
                ? "rgba(240, 112, 104, 0.3)"
                : "var(--border-subtle)"
              : "transparent"
          }`,
          color: following
            ? hovered
              ? "var(--accent-rose)"
              : "var(--text-primary)"
            : "var(--bg-deep)",
          opacity: isPending ? 0.7 : 1,
          minWidth: "100px",
        }}
      >
        {isPending ? "..." : label}
      </button>
      <div className="text-center">
        <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
          {count}
        </p>
        <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          {count === 1 ? "follower" : "followers"}
        </p>
      </div>
    </div>
  );
}
