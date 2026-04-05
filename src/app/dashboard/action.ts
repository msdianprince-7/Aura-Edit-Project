// src/app/dashboard/actions.ts
"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function deletePhotoAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const id = formData.get("id") as string;
  if (!id) return;

  // Verify ownership before deleting
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo || photo.userId !== session.user.id) {
    throw new Error("Forbidden");
  }

  await prisma.photo.delete({ where: { id } });

  revalidatePath("/dashboard");
}