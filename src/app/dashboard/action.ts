// src/app/dashboard/actions.ts
"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deletePhotoAction(formData: FormData) {

  const id = formData.get("id") as string;
  if (!id) return;


  await prisma.photo.delete({
    where: { 
      id: id 
    }
  });

  revalidatePath("/dashboard");
}