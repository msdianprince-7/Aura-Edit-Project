// src/app/actions/feed.ts
"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export type FeedPhoto = {
  id: string;
  imageUrl: string;
  caption: string | null;
  createdAt: string;
  user: {
    id: string;
    username: string;
  };
  appliedEdit: {
    filterName: string;
    overlay: string | null;
    brightness: number;
    contrast: number;
    saturation: number;
    hueRotate: number;
    sepia: number;
    grayscale: number;
    blur: number;
  } | null;
  likes: { userId: string }[];
  _count: { comments: number };
};

export type FeedResult = {
  photos: FeedPhoto[];
  nextCursor: string | null;
};

export async function getFeedAction(
  cursor?: string,
  limit: number = 20
): Promise<FeedResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { photos: [], nextCursor: null };
  }

  const userId = session.user.id;

  // Get the list of user IDs the current user follows
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  const followingIds = following.map((f) => f.followingId);

  if (followingIds.length === 0) {
    return { photos: [], nextCursor: null };
  }

  // Fetch photos from followed users with cursor pagination
  const photos = await prisma.photo.findMany({
    where: {
      userId: { in: followingIds },
      ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1, // Fetch one extra to determine if there's a next page
    include: {
      user: {
        select: { id: true, username: true },
      },
      appliedEdit: true,
      likes: { select: { userId: true } },
      _count: { select: { comments: true } },
    },
  });

  let nextCursor: string | null = null;

  if (photos.length > limit) {
    const lastPhoto = photos.pop()!;
    nextCursor = lastPhoto.createdAt.toISOString();
  }

  // Serialize dates for client consumption
  const serialized: FeedPhoto[] = photos.map((photo) => ({
    id: photo.id,
    imageUrl: photo.imageUrl,
    caption: photo.caption,
    createdAt: photo.createdAt.toISOString(),
    user: photo.user,
    appliedEdit: photo.appliedEdit
      ? {
          filterName: photo.appliedEdit.filterName,
          overlay: photo.appliedEdit.overlay,
          brightness: photo.appliedEdit.brightness,
          contrast: photo.appliedEdit.contrast,
          saturation: photo.appliedEdit.saturation,
          hueRotate: photo.appliedEdit.hueRotate,
          sepia: photo.appliedEdit.sepia,
          grayscale: photo.appliedEdit.grayscale,
          blur: photo.appliedEdit.blur,
        }
      : null,
    likes: photo.likes,
    _count: photo._count,
  }));

  return { photos: serialized, nextCursor };
}
