// src/app/search/page.tsx
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { buildCssFilter } from "@/lib/filters";
import LikeButton from "@/components/social/LikeButton";
import SearchPageClient from "./SearchPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search | AuraEdit",
  description: "Search for users, photos, and collections on AuraEdit.",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q?.trim() || "";
  const session = await auth();
  const currentUserId = session?.user?.id || null;

  let users: {
    id: string;
    username: string;
    bio: string | null;
    _count: { followers: number; photos: number; following: number };
  }[] = [];

  let photos: {
    id: string;
    imageUrl: string;
    caption: string | null;
    createdAt: Date;
    user: { username: string };
    appliedEdit: {
      filterName: string;
      brightness: number;
      contrast: number;
      saturation: number;
      hueRotate: number;
      sepia: number;
      grayscale: number;
      blur: number;
      overlay: string | null;
    } | null;
    likes: { userId: string }[];
    _count: { comments: number };
  }[] = [];

  let collections: {
    id: string;
    name: string;
    description: string | null;
    user: { username: string };
    _count: { photos: number };
    photos: {
      id: string;
      photo: { imageUrl: string };
    }[];
  }[] = [];

  if (query.length >= 2) {
    [users, photos, collections] = await Promise.all([
      prisma.user.findMany({
        where: {
          username: { contains: query, mode: "insensitive" },
        },
        select: {
          id: true,
          username: true,
          bio: true,
          _count: { select: { followers: true, photos: true, following: true } },
        },
        take: 20,
        orderBy: { createdAt: "desc" },
      }),
      prisma.photo.findMany({
        where: {
          caption: { contains: query, mode: "insensitive" },
        },
        select: {
          id: true,
          imageUrl: true,
          caption: true,
          createdAt: true,
          user: { select: { username: true } },
          appliedEdit: true,
          likes: { select: { userId: true } },
          _count: { select: { comments: true } },
        },
        take: 20,
        orderBy: { createdAt: "desc" },
      }),
      prisma.collection.findMany({
        where: {
          name: { contains: query, mode: "insensitive" },
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
        take: 20,
        orderBy: { updatedAt: "desc" },
      }),
    ]);
  }

  return (
    <SearchPageClient
      initialQuery={query}
      users={users}
      photos={photos.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        filterString: p.appliedEdit
          ? buildCssFilter({
              brightness: p.appliedEdit.brightness,
              contrast: p.appliedEdit.contrast,
              saturation: p.appliedEdit.saturation,
              hueRotate: p.appliedEdit.hueRotate,
              sepia: p.appliedEdit.sepia,
              grayscale: p.appliedEdit.grayscale,
              blur: p.appliedEdit.blur,
            })
          : "none",
        overlay: p.appliedEdit?.overlay || null,
        filterName: p.appliedEdit?.filterName || null,
        isLiked: currentUserId
          ? p.likes.some((l) => l.userId === currentUserId)
          : false,
        likeCount: p.likes.length,
      }))}
      collections={collections}
      currentUserId={currentUserId}
    />
  );
}
