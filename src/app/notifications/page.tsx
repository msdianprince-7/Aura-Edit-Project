// src/app/notifications/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { markAllReadAction } from "@/app/actions/notification";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications | AuraEdit",
  description: "View your latest notifications on AuraEdit.",
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const notifications = await prisma.notification.findMany({
    where: { recipientId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      actor: {
        select: { id: true, username: true },
      },
      photo: {
        select: { id: true, caption: true, imageUrl: true },
      },
    },
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Group notifications by date
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { label: string; items: typeof notifications }[] = [];
  const todayItems = notifications.filter(
    (n) => n.createdAt.toDateString() === today.toDateString()
  );
  const yesterdayItems = notifications.filter(
    (n) => n.createdAt.toDateString() === yesterday.toDateString()
  );
  const olderItems = notifications.filter(
    (n) =>
      n.createdAt.toDateString() !== today.toDateString() &&
      n.createdAt.toDateString() !== yesterday.toDateString()
  );

  if (todayItems.length > 0) groups.push({ label: "Today", items: todayItems });
  if (yesterdayItems.length > 0) groups.push({ label: "Yesterday", items: yesterdayItems });
  if (olderItems.length > 0) groups.push({ label: "Earlier", items: olderItems });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "LIKE":
        return (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: "rgba(240, 112, 104, 0.15)",
              border: "1px solid rgba(240, 112, 104, 0.2)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--accent-rose)" stroke="none">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
        );
      case "COMMENT":
        return (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: "rgba(240, 196, 100, 0.15)",
              border: "1px solid rgba(240, 196, 100, 0.2)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        );
      case "FOLLOW":
        return (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: "rgba(184, 140, 245, 0.15)",
              border: "1px solid rgba(184, 140, 245, 0.2)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-lavender)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getNotificationLink = (n: typeof notifications[0]) => {
    if (n.type === "FOLLOW") return `/${n.actor.username}`;
    if (n.photo) return `/photo/${n.photo.id}`;
    return "/dashboard";
  };

  const getNotificationMessage = (n: typeof notifications[0]) => {
    switch (n.type) {
      case "LIKE":
        return (
          <>
            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
              @{n.actor.username}
            </span>{" "}
            liked your photo
            {n.photo?.caption && (
              <span style={{ color: "var(--text-muted)" }}>
                {" "}&quot;{n.photo.caption.slice(0, 40)}
                {n.photo.caption.length > 40 ? "..." : ""}&quot;
              </span>
            )}
          </>
        );
      case "COMMENT":
        return (
          <>
            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
              @{n.actor.username}
            </span>{" "}
            commented on your photo
            {n.photo?.caption && (
              <span style={{ color: "var(--text-muted)" }}>
                {" "}&quot;{n.photo.caption.slice(0, 40)}
                {n.photo.caption.length > 40 ? "..." : ""}&quot;
              </span>
            )}
          </>
        );
      case "FOLLOW":
        return (
          <>
            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
              @{n.actor.username}
            </span>{" "}
            started following you
          </>
        );
    }
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-2xl mx-auto" style={{ animation: "slide-up 0.6s ease forwards" }}>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm mb-4 transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15,18 9,12 15,6" />
          </svg>
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(184, 140, 245, 0.15), rgba(240, 112, 104, 0.15))",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-lavender)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                Notifications
              </h1>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <form action={markAllReadAction}>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: "rgba(184, 140, 245, 0.1)",
                  border: "1px solid rgba(184, 140, 245, 0.2)",
                  color: "var(--accent-lavender)",
                }}
              >
                Mark all read
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Notification groups */}
      {groups.length === 0 ? (
        <div
          className="text-center py-20 rounded-2xl"
          style={{
            background: "var(--bg-surface)",
            border: "2px dashed var(--border-subtle)",
          }}
        >
          <div
            className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(184, 140, 245, 0.1), rgba(240, 112, 104, 0.1))",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            No notifications yet
          </h3>
          <p className="text-sm max-w-sm mx-auto" style={{ color: "var(--text-muted)" }}>
            When someone likes your photos, comments, or follows you, notifications will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              <h2
                className="text-xs font-bold uppercase tracking-widest mb-3 px-1"
                style={{ color: "var(--text-muted)" }}
              >
                {group.label}
              </h2>
              <div
                className="rounded-2xl overflow-hidden divide-y"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                {group.items.map((n, index) => (
                  <Link
                    key={n.id}
                    href={getNotificationLink(n)}
                    className="notification-item flex items-start gap-4 px-5 py-4 transition-all duration-200"
                    style={{
                      background: n.read ? "transparent" : "rgba(184, 140, 245, 0.03)",
                      borderBottom: "1px solid var(--border-subtle)",
                      animation: `slide-up 0.4s ease forwards`,
                      animationDelay: `${index * 0.04}s`,
                      opacity: 0,
                    }}
                  >
                    {getNotificationIcon(n.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        {getNotificationMessage(n)}
                      </p>
                      <p
                        className="text-xs mt-1.5"
                        style={{
                          color: n.read ? "var(--text-muted)" : "var(--accent-lavender)",
                        }}
                      >
                        {getRelativeTime(n.createdAt)}
                      </p>
                    </div>
                    {!n.read && (
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0 mt-2 notification-unread-dot"
                        style={{
                          background: "var(--accent-rose)",
                          boxShadow: "0 0 8px rgba(240, 112, 104, 0.5)",
                        }}
                      />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
