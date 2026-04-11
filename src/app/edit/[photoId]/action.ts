// src/app/edit/[photoId]/action.ts
"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function saveEditAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const photoId = formData.get("photoId") as string;
  if (!photoId) throw new Error("Missing photoId");

  // Verify ownership
  const photo = await prisma.photo.findUnique({ where: { id: photoId } });
  if (!photo || photo.userId !== session.user.id) {
    throw new Error("Forbidden");
  }

  const editData = {
    filterName: formData.get("filterName") as string || "None",
    overlay: formData.get("overlay") as string || null,
    brightness: parseInt(formData.get("brightness") as string) || 100,
    contrast: parseInt(formData.get("contrast") as string) || 100,
    saturation: parseInt(formData.get("saturation") as string) || 100,
    hueRotate: parseInt(formData.get("hueRotate") as string) || 0,
    sepia: parseInt(formData.get("sepia") as string) || 0,
    grayscale: parseInt(formData.get("grayscale") as string) || 0,
    blur: parseInt(formData.get("blur") as string) || 0,
  };

  // Upsert: create or update the Edit record
  await prisma.edit.upsert({
    where: { photoId },
    create: {
      ...editData,
      photoId,
    },
    update: editData,
  });

  revalidatePath("/dashboard");
  revalidatePath(`/edit/${photoId}`);
}
