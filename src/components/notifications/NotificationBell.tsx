"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  getNotificationsAction,
  getUnreadCountAction,
  markAllReadAction,
  markNotificationReadAction,
} from "@/app/actions/notification";

type NotificationData = {
  id: string;
  type: "LIKE" | "COMMENT" | "FOLLOW";
  read: boolean;
  createdAt: string;
  actor: { id: string; username: string };
  photo: { id: string; caption: string | null; imageUrl: string } | null;
};

interface NotificationBellProps {
  initialUnreadCount: number;
}

export default function NotificationBell({ initialUnreadCount }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Poll for unread count every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const count = await getUnreadCountAction();
        setUnreadCount(count);
      } catch {
        // silently fail
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Fetch notifications when dropdown opens
  const handleOpen = useCallback(async () => {
    setOpen((prev) => !prev);
    if (!open) {
      setLoading(true);
      try {
        const data = await getNotificationsAction();
        setNotifications(data);
      } catch {
        // handle error silently
      } finally {
        setLoading(false);
      }
    }
  }, [open]);

  // Mark all as read
  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllReadAction();
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
    } catch {
      // silently fail
    }
  }, []);

  // Mark single as read
  const handleClickNotification = useCallback(async (notificationId: string) => {
    try {
      await markNotificationReadAction(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silently fail
    }
    setOpen(false);
  }, []);

  // Get icon based on notification type
  const getNotificationIcon = (type: NotificationData["type"]) => {
    switch (type) {
      case "LIKE":
        return (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: "rgba(240, 112, 104, 0.15)",
              border: "1px solid rgba(240, 112, 104, 0.2)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--accent-rose)" stroke="none">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
        );
      case "COMMENT":
        return (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: "rgba(240, 196, 100, 0.15)",
              border: "1px solid rgba(240, 196, 100, 0.2)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        );
      case "FOLLOW":
        return (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: "rgba(184, 140, 245, 0.15)",
              border: "1px solid rgba(184, 140, 245, 0.2)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-lavender)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
        );
    }
  };

  // Get message based on notification type
  const getNotificationMessage = (n: NotificationData) => {
    switch (n.type) {
      case "LIKE":
        return (
          <>
            <span style={{ color: "var(--text-primary)" }} className="font-semibold">
              @{n.actor.username}
            </span>{" "}
            liked your photo
            {n.photo?.caption && (
              <span style={{ color: "var(--text-muted)" }}> &quot;{n.photo.caption.slice(0, 30)}{n.photo.caption.length > 30 ? "..." : ""}&quot;</span>
            )}
          </>
        );
      case "COMMENT":
        return (
          <>
            <span style={{ color: "var(--text-primary)" }} className="font-semibold">
              @{n.actor.username}
            </span>{" "}
            commented on your photo
            {n.photo?.caption && (
              <span style={{ color: "var(--text-muted)" }}> &quot;{n.photo.caption.slice(0, 30)}{n.photo.caption.length > 30 ? "..." : ""}&quot;</span>
            )}
          </>
        );
      case "FOLLOW":
        return (
          <>
            <span style={{ color: "var(--text-primary)" }} className="font-semibold">
              @{n.actor.username}
            </span>{" "}
            started following you
          </>
        );
    }
  };

  // Get link based on notification type
  const getNotificationLink = (n: NotificationData) => {
    if (n.type === "FOLLOW") return `/${n.actor.username}`;
    if (n.photo) return `/photo/${n.photo.id}`;
    return "/dashboard";
  };

  // Relative time
  const getRelativeTime = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div ref={panelRef} className="relative">
      {/* Bell trigger */}
      <button
        onClick={handleOpen}
        className="notification-bell relative p-2 rounded-xl transition-all duration-200"
        style={{
          background: open ? "var(--bg-elevated)" : "transparent",
          border: `1px solid ${open ? "var(--border-hover)" : "transparent"}`,
          color: "var(--text-secondary)",
        }}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="notification-badge absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold px-1"
            style={{
              background: "linear-gradient(135deg, var(--accent-rose), var(--accent-coral))",
              color: "var(--bg-deep)",
              boxShadow: "0 2px 8px rgba(240, 112, 104, 0.4)",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="notification-dropdown absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl overflow-hidden"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-hover)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            animation: "notification-slide-in 0.25s ease forwards",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{
                    background: "rgba(240, 112, 104, 0.15)",
                    color: "var(--accent-rose)",
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium transition-colors duration-200"
                style={{ color: "var(--accent-lavender)" }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="notification-list max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex flex-col gap-1 p-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl">
                    <div className="w-8 h-8 rounded-full skeleton shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 skeleton" />
                      <div className="h-2 w-1/3 skeleton" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center py-12 px-6">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{
                    background: "linear-gradient(135deg, rgba(184, 140, 245, 0.1), rgba(240, 112, 104, 0.1))",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                  No notifications yet
                </p>
                <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                  When someone likes, comments, or follows you, it&apos;ll show up here.
                </p>
              </div>
            ) : (
              <div className="py-1">
                {notifications.map((n, index) => (
                  <Link
                    key={n.id}
                    href={getNotificationLink(n)}
                    onClick={() => handleClickNotification(n.id)}
                    className="notification-item flex items-start gap-3 px-4 py-3 mx-1 my-0.5 rounded-xl transition-all duration-200"
                    style={{
                      background: n.read ? "transparent" : "rgba(184, 140, 245, 0.04)",
                      animation: `slide-up 0.3s ease forwards`,
                      animationDelay: `${index * 0.03}s`,
                      opacity: 0,
                    }}
                  >
                    {/* Icon */}
                    {getNotificationIcon(n.type)}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        {getNotificationMessage(n)}
                      </p>
                      <p
                        className="text-[10px] mt-1 font-medium"
                        style={{
                          color: n.read ? "var(--text-muted)" : "var(--accent-lavender)",
                        }}
                      >
                        {getRelativeTime(n.createdAt)}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!n.read && (
                      <div
                        className="w-2 h-2 rounded-full shrink-0 mt-2 notification-unread-dot"
                        style={{
                          background: "var(--accent-rose)",
                          boxShadow: "0 0 6px rgba(240, 112, 104, 0.5)",
                        }}
                      />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div
              className="px-5 py-3 text-center"
              style={{ borderTop: "1px solid var(--border-subtle)" }}
            >
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="text-xs font-medium transition-colors"
                style={{ color: "var(--accent-lavender)" }}
              >
                View all notifications →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
