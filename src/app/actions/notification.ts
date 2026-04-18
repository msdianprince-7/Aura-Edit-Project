// src/app/actions/notification.ts
"use server"

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// ═══════════════════════════════════════════
// FETCH NOTIFICATIONS
// ═══════════════════════════════════════════

export async function getNotificationsAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const notifications = await prisma.notification.findMany({
    where: { recipientId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      actor: {
        select: { id: true, username: true },
      },
      photo: {
        select: { id: true, caption: true, imageUrl: true },
      },
    },
  });

  return notifications.map((n) => ({
    id: n.id,
    type: n.type,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
    actor: {
      id: n.actor.id,
      username: n.actor.username,
    },
    photo: n.photo
      ? {
          id: n.photo.id,
          caption: n.photo.caption,
          imageUrl: n.photo.imageUrl,
        }
      : null,
  }));
}

// ═══════════════════════════════════════════
// UNREAD COUNT
// ═══════════════════════════════════════════

export async function getUnreadCountAction(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) {
    return 0;
  }

  const count = await prisma.notification.count({
    where: {
      recipientId: session.user.id,
      read: false,
    },
  });

  return count;
}

// ═══════════════════════════════════════════
// MARK AS READ
// ═══════════════════════════════════════════

export async function markAllReadAction() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await prisma.notification.updateMany({
    where: {
      recipientId: session.user.id,
      read: false,
    },
    data: { read: true },
  });

  revalidatePath("/");
}

export async function markNotificationReadAction(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await prisma.notification.update({
    where: {
      id: notificationId,
      recipientId: session.user.id,
    },
    data: { read: true },
  });
}

// ═══════════════════════════════════════════
// CREATE NOTIFICATION (internal helper)
// ═══════════════════════════════════════════

export async function createNotification({
  type,
  recipientId,
  actorId,
  photoId,
}: {
  type: "LIKE" | "COMMENT" | "FOLLOW";
  recipientId: string;
  actorId: string;
  photoId?: string;
}) {
  // Don't notify yourself
  if (recipientId === actorId) return;

  await prisma.notification.create({
    data: {
      type,
      recipientId,
      actorId,
      photoId: photoId || null,
    },
  });
}

// ═══════════════════════════════════════════
// DELETE NOTIFICATION (for unlike/unfollow)
// ═══════════════════════════════════════════

export async function deleteNotification({
  type,
  recipientId,
  actorId,
  photoId,
}: {
  type: "LIKE" | "COMMENT" | "FOLLOW";
  recipientId: string;
  actorId: string;
  photoId?: string;
}) {
  // Find and delete matching notification
  const where: {
    type: "LIKE" | "COMMENT" | "FOLLOW";
    recipientId: string;
    actorId: string;
    photoId?: string | null;
  } = {
    type,
    recipientId,
    actorId,
  };

  if (photoId) {
    where.photoId = photoId;
  }

  // deleteMany is safe even if no match found
  await prisma.notification.deleteMany({ where });
}
