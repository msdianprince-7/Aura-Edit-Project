// src/app/collections/[id]/edit/page.tsx
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { updateCollectionAction } from "@/app/actions/collection";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Collection | AuraEdit",
  description: "Edit your collection on AuraEdit.",
};

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const resolvedParams = await params;
  const collectionId = resolvedParams.id;

  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: {
      id: true,
      name: true,
      description: true,
      isPublic: true,
      userId: true,
    },
  });

  if (!collection || collection.userId !== session.user.id) {
    notFound();
  }

  return (
    <div className="max-w-xl mx-auto mt-8" style={{ animation: "slide-up 0.6s ease forwards" }}>
      {/* Header */}
      <Link
        href={`/collections/${collectionId}`}
        className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors"
        style={{ color: "var(--text-muted)" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15,18 9,12 15,6" />
        </svg>
        Back to Collection
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(184, 140, 245, 0.15), rgba(240, 196, 100, 0.15))",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-lavender)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Edit Collection
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            Update your collection details
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        action={updateCollectionAction}
        className="rounded-2xl p-8 space-y-6"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <input type="hidden" name="collectionId" value={collectionId} />

        {/* Name */}
        <div className="space-y-2">
          <label
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Collection Name
          </label>
          <input
            name="name"
            type="text"
            defaultValue={collection.name}
            required
            maxLength={50}
            placeholder="e.g. Street Photography"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-300"
            style={{
              background: "var(--bg-deep)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
            }}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
              e.currentTarget.style.borderColor = "var(--accent-lavender)";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(184, 140, 245, 0.1)";
            }}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
              e.currentTarget.style.borderColor = "var(--border-subtle)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Description
            <span className="font-normal ml-1" style={{ color: "var(--text-muted)" }}>(optional)</span>
          </label>
          <textarea
            name="description"
            defaultValue={collection.description || ""}
            rows={3}
            placeholder="Describe this collection..."
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-300 resize-none"
            style={{
              background: "var(--bg-deep)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
            }}
            onFocus={(e: React.FocusEvent<HTMLTextAreaElement>) => {
              e.currentTarget.style.borderColor = "var(--accent-lavender)";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(184, 140, 245, 0.1)";
            }}
            onBlur={(e: React.FocusEvent<HTMLTextAreaElement>) => {
              e.currentTarget.style.borderColor = "var(--border-subtle)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Visibility */}
        <div className="space-y-2">
          <label
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Visibility
          </label>
          <div className="flex gap-3">
            <label
              className="flex-1 flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <input
                type="radio"
                name="isPublic"
                value="true"
                defaultChecked={collection.isPublic}
                className="accent-[var(--accent-lavender)]"
              />
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>🌐 Public</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Anyone can view</p>
              </div>
            </label>
            <label
              className="flex-1 flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <input
                type="radio"
                name="isPublic"
                value="false"
                defaultChecked={!collection.isPublic}
                className="accent-[var(--accent-lavender)]"
              />
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>🔒 Private</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Only you can see</p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-[1.01]"
          style={{
            background: "linear-gradient(135deg, var(--accent-rose), var(--accent-amber))",
            color: "var(--bg-deep)",
            boxShadow: "0 4px 15px rgba(240, 112, 104, 0.2)",
          }}
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
