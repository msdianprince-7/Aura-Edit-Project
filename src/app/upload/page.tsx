// src/app/upload/page.tsx
import { uploadPhotoAction } from "./action";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AuthInput from "@/components/ui/AuthInput";
import Link from "next/link";

export default async function UploadPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="max-w-2xl mx-auto mt-8" style={{ animation: "slide-up 0.6s ease forwards" }}>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm mb-4 transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15,18 9,12 15,6" />
          </svg>
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Upload Photo
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Add a new image to your portfolio gallery
        </p>
      </div>

      {/* Upload form */}
      <form
        action={uploadPhotoAction}
        className="space-y-6 rounded-2xl p-8"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        {/* Image URL field */}
        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            Image URL
          </label>
          <AuthInput
            name="imageUrl"
            type="url"
            placeholder="https://images.unsplash.com/..."
            required
          />
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Paste a direct link to your image. Unsplash, Imgur, and other image hosts work.
          </p>
        </div>

        {/* Caption field */}
        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            Caption
            <span className="font-normal ml-1" style={{ color: "var(--text-muted)" }}>(optional)</span>
          </label>
          <AuthInput
            name="caption"
            type="text"
            placeholder="Late night coding vibes..."
            required={false}
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            style={{
              background: "linear-gradient(135deg, var(--accent-rose), var(--accent-amber))",
              color: "var(--bg-deep)",
              boxShadow: "0 4px 15px rgba(240, 112, 104, 0.2)",
            }}
          >
            Publish to Gallery
          </button>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 text-center"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
            }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}