"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const userId = session.user.id;
  const username = formData.get("username") as string;
  const bio = formData.get("bio") as string;

  if (!username || username.trim() === "") {
    return { error: "Username is required" };
  }

  // Basic validation for username
  const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
  if (cleanUsername.length < 3) {
    return { error: "Username must be at least 3 characters long and contain only letters, numbers, and underscores" };
  }

  try {
    // Check if username is taken by someone else
    const existing = await prisma.user.findFirst({
      where: {
        username: cleanUsername,
        id: { not: userId },
      },
    });

    if (existing) {
      return { error: "Username is already taken" };
    }

    const cleanBio = bio?.trim() || null;

    await prisma.user.update({
      where: { id: userId },
      data: {
        username: cleanUsername,
        bio: cleanBio,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/explore");
    revalidatePath(`/${cleanUsername}`);

    return { success: "Profile updated successfully!" };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: "An unexpected error occurred while updating the profile." };
  }
}
