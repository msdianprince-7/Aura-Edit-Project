// src/app/edit/[photoId]/page.tsx
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import PhotoEditor from "@/components/editor/PhotoEditor";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Photo Editor | AuraEdit",
  description: "Apply stunning filters, adjust brightness, contrast, and more to your photos.",
};

export default async function EditPage({ params }: { params: Promise<{ photoId: string }> }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const resolvedParams = await params;
  const photoId = resolvedParams.photoId;

  const photo = await prisma.photo.findUnique({
    where: { id: photoId },
    include: { appliedEdit: true },
  });

  if (!photo) {
    notFound();
  }

  // Verify ownership
  if (photo.userId !== session.user.id) {
    redirect("/dashboard");
  }

  const existingEdit = photo.appliedEdit
    ? {
        brightness: photo.appliedEdit.brightness,
        contrast: photo.appliedEdit.contrast,
        saturation: (photo.appliedEdit as Record<string, unknown>).saturation as number ?? 100,
        hueRotate: (photo.appliedEdit as Record<string, unknown>).hueRotate as number ?? 0,
        sepia: (photo.appliedEdit as Record<string, unknown>).sepia as number ?? 0,
        grayscale: (photo.appliedEdit as Record<string, unknown>).grayscale as number ?? 0,
        blur: (photo.appliedEdit as Record<string, unknown>).blur as number ?? 0,
        overlay: photo.appliedEdit.overlay,
        filterName: photo.appliedEdit.filterName,
      }
    : null;

  return (
    <PhotoEditor
      photo={{
        id: photo.id,
        imageUrl: photo.imageUrl,
        caption: photo.caption,
      }}
      existingEdit={existingEdit}
    />
  );
}
