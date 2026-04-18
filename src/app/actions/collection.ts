// src/app/actions/collection.ts
"use server"

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ═══════════════════════════════════════════
// CREATE COLLECTION
// ═══════════════════════════════════════════

export async function createCollectionAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const isPublic = formData.get("isPublic") !== "false";

  if (!name || name.length < 1) {
    throw new Error("Collection name is required");
  }

  if (name.length > 50) {
    throw new Error("Collection name must be under 50 characters");
  }

  const collection = await prisma.collection.create({
    data: {
      name,
      description,
      isPublic,
      userId: session.user.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/collections");
  redirect(`/collections/${collection.id}`);
}

// ═══════════════════════════════════════════
// UPDATE COLLECTION
// ═══════════════════════════════════════════

export async function updateCollectionAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const collectionId = formData.get("collectionId") as string;
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const isPublic = formData.get("isPublic") !== "false";

  if (!name || name.length < 1) {
    throw new Error("Collection name is required");
  }

  // Verify ownership
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: { userId: true },
  });

  if (!collection || collection.userId !== session.user.id) {
    throw new Error("Forbidden");
  }

  await prisma.collection.update({
    where: { id: collectionId },
    data: { name, description, isPublic },
  });

  revalidatePath(`/collections/${collectionId}`);
  revalidatePath("/dashboard");
  redirect(`/collections/${collectionId}`);
}

// ═══════════════════════════════════════════
// DELETE COLLECTION
// ═══════════════════════════════════════════

export async function deleteCollectionAction(collectionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: { userId: true },
  });

  if (!collection || collection.userId !== session.user.id) {
    throw new Error("Forbidden");
  }

  await prisma.collection.delete({
    where: { id: collectionId },
  });

  revalidatePath("/dashboard");
  revalidatePath("/collections");
  redirect("/dashboard");
}

// ═══════════════════════════════════════════
// ADD PHOTO TO COLLECTION
// ═══════════════════════════════════════════

export async function addPhotoToCollectionAction(collectionId: string, photoId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Verify collection ownership
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: { userId: true },
  });

  if (!collection || collection.userId !== session.user.id) {
    throw new Error("Forbidden");
  }

  // Check if photo already in collection
  const existing = await prisma.collectionPhoto.findUnique({
    where: {
      collectionId_photoId: { collectionId, photoId },
    },
  });

  if (existing) return; // Already added

  await prisma.collectionPhoto.create({
    data: { collectionId, photoId },
  });

  revalidatePath(`/collections/${collectionId}`);
  revalidatePath("/dashboard");
}

// ═══════════════════════════════════════════
// REMOVE PHOTO FROM COLLECTION
// ═══════════════════════════════════════════

export async function removePhotoFromCollectionAction(collectionId: string, photoId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Verify collection ownership
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: { userId: true },
  });

  if (!collection || collection.userId !== session.user.id) {
    throw new Error("Forbidden");
  }

  await prisma.collectionPhoto.deleteMany({
    where: { collectionId, photoId },
  });

  revalidatePath(`/collections/${collectionId}`);
}

// ═══════════════════════════════════════════
// GET USER'S COLLECTIONS (for "Add to Collection" modal)
// ═══════════════════════════════════════════

export async function getUserCollectionsAction(photoId?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const collections = await prisma.collection.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { photos: true } },
      photos: photoId
        ? {
            where: { photoId },
            select: { id: true },
          }
        : { take: 0 },
    },
  });

  return collections.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    isPublic: c.isPublic,
    photoCount: c._count.photos,
    hasPhoto: photoId ? c.photos.length > 0 : false,
  }));
}
