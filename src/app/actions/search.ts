// src/app/actions/search.ts
"use server";

import prisma from "@/lib/prisma";

export type SearchResults = {
  users: {
    id: string;
    username: string;
    bio: string | null;
    _count: { followers: number; photos: number };
  }[];
  photos: {
    id: string;
    imageUrl: string;
    caption: string | null;
    user: { username: string };
    appliedEdit: { filterName: string } | null;
    _count: { likes: number; comments: number };
  }[];
  collections: {
    id: string;
    name: string;
    description: string | null;
    user: { username: string };
    _count: { photos: number };
    photos: {
      id: string;
      photo: { imageUrl: string };
    }[];
  }[];
};

export async function searchAction(
  query: string,
  limit: number = 5
): Promise<SearchResults> {
  const trimmed = query.trim();

  if (!trimmed || trimmed.length < 2) {
    return { users: [], photos: [], collections: [] };
  }

  const [users, photos, collections] = await Promise.all([
    // Search users by username
    prisma.user.findMany({
      where: {
        username: { contains: trimmed, mode: "insensitive" },
      },
      select: {
        id: true,
        username: true,
        bio: true,
        _count: { select: { followers: true, photos: true } },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    }),

    // Search photos by caption
    prisma.photo.findMany({
      where: {
        caption: { contains: trimmed, mode: "insensitive" },
      },
      select: {
        id: true,
        imageUrl: true,
        caption: true,
        user: { select: { username: true } },
        appliedEdit: { select: { filterName: true } },
        _count: { select: { likes: true, comments: true } },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    }),

    // Search collections by name
    prisma.collection.findMany({
      where: {
        name: { contains: trimmed, mode: "insensitive" },
        isPublic: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        user: { select: { username: true } },
        _count: { select: { photos: true } },
        photos: {
          take: 3,
          orderBy: { addedAt: "desc" },
          select: {
            id: true,
            photo: { select: { imageUrl: true } },
          },
        },
      },
      take: limit,
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return { users, photos, collections };
}
