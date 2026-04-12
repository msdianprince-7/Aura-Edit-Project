// src/app/upload/action.ts
"use server"

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/avif",
  "image/heic",
  "image/heif",
  "image/bmp",
  "image/tiff",
];

function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "image/avif": ".avif",
    "image/heic": ".heic",
    "image/heif": ".heif",
    "image/bmp": ".bmp",
    "image/tiff": ".tiff",
  };
  return map[mimeType] || ".jpg";
}

// Upload a file and create a photo record — all in one server action
export async function uploadFileAction(formData: FormData): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to upload." };
  }

  const file = formData.get("file") as File | null;
  const caption = formData.get("caption") as string;

  if (!file || file.size === 0) {
    return { error: "No file provided." };
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: `Unsupported file type: ${file.type}. Please upload an image file.` };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return { error: "File too large. Maximum size is 10 MB." };
  }

  try {
    // Read file bytes
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const uniqueId = crypto.randomUUID();
    const ext = getExtension(file.type);
    const filename = `${uniqueId}${ext}`;

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Write file to disk
    const filepath = path.join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    // Create DB record
    const imageUrl = `/uploads/${filename}`;
    await prisma.photo.create({
      data: {
        imageUrl,
        caption: caption || null,
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/explore");
  } catch (err) {
    console.error("Upload error:", err);
    return { error: "Upload failed. Please try again." };
  }

  redirect("/dashboard");
}

// URL-based upload — create photo record from an external URL
export async function uploadUrlAction(imageUrl: string, caption: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to upload." };
  }

  if (!imageUrl || !imageUrl.trim()) {
    return { error: "Image URL is required." };
  }

  try {
    await prisma.photo.create({
      data: {
        imageUrl: imageUrl.trim(),
        caption: caption || null,
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/explore");
  } catch (err) {
    console.error("Upload error:", err);
    return { error: "Failed to save. Please try again." };
  }

  redirect("/dashboard");
}