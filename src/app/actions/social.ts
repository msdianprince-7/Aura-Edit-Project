// src/app/actions/social.ts
"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { createNotification, deleteNotification } from "./notification";

// ═══════════════════════════════════════════
// LIKES
// ═══════════════════════════════════════════

export async function toggleLikeAction(photoId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // Get the photo to find its owner
  const photo = await prisma.photo.findUnique({
    where: { id: photoId },
    select: { userId: true },
  });

  if (!photo) throw new Error("Photo not found");

  const existingLike = await prisma.like.findUnique({
    where: {
      userId_photoId: { userId, photoId },
    },
  });

  if (existingLike) {
    await prisma.like.delete({
      where: { id: existingLike.id },
    });
    // Remove the like notification
    await deleteNotification({
      type: "LIKE",
      recipientId: photo.userId,
      actorId: userId,
      photoId,
    });
  } else {
    await prisma.like.create({
      data: { userId, photoId },
    });
    // Send like notification to photo owner
    await createNotification({
      type: "LIKE",
      recipientId: photo.userId,
      actorId: userId,
      photoId,
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/explore");
}

// ═══════════════════════════════════════════
// COMMENTS
// ═══════════════════════════════════════════

export async function addCommentAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const photoId = formData.get("photoId") as string;
  const content = (formData.get("content") as string)?.trim();

  if (!photoId || !content) return;

  // Get the photo to find its owner
  const photo = await prisma.photo.findUnique({
    where: { id: photoId },
    select: { userId: true },
  });

  if (!photo) return;

  await prisma.comment.create({
    data: {
      content,
      userId: session.user.id,
      photoId,
    },
  });

  // Send comment notification to photo owner
  await createNotification({
    type: "COMMENT",
    recipientId: photo.userId,
    actorId: session.user.id,
    photoId,
  });

  revalidatePath(`/photo/${photoId}`);
  revalidatePath("/explore");
}

export async function deleteCommentAction(commentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment || comment.userId !== session.user.id) {
    throw new Error("Forbidden");
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });

  revalidatePath(`/photo/${comment.photoId}`);
  revalidatePath("/explore");
}

// ═══════════════════════════════════════════
// FOLLOW
// ═══════════════════════════════════════════

export async function toggleFollowAction(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const followerId = session.user.id;

  // Can't follow yourself
  if (followerId === targetUserId) return;

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId: targetUserId },
    },
  });

  if (existingFollow) {
    await prisma.follow.delete({
      where: { id: existingFollow.id },
    });
    // Remove the follow notification
    await deleteNotification({
      type: "FOLLOW",
      recipientId: targetUserId,
      actorId: followerId,
    });
  } else {
    await prisma.follow.create({
      data: { followerId, followingId: targetUserId },
    });
    // Send follow notification
    await createNotification({
      type: "FOLLOW",
      recipientId: targetUserId,
      actorId: followerId,
    });
  }

  revalidatePath("/explore");
}

