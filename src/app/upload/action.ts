// src/app/upload/actions.ts
"use server"

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function uploadPhotoAction(formData: FormData) {

  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const imageUrl = formData.get("imageUrl") as string;
  const caption = formData.get("caption") as string;

  if (!imageUrl) return;

  let user = await prisma.user.findFirst();
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        username: "admin_creator",
        email: "admin@auraedit.com",
      }
    });
  }

  await prisma.photo.create({
    data: {
      imageUrl: imageUrl,
      caption: caption,
      userId: user.id,
    }
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}