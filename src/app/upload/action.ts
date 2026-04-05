// src/app/upload/actions.ts
"use server"

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function uploadPhotoAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const imageUrl = formData.get("imageUrl") as string;
  const caption = formData.get("caption") as string;

  if (!imageUrl) return;

  await prisma.photo.create({
    data: {
      imageUrl,
      caption,
      userId: session.user.id,
    }
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}