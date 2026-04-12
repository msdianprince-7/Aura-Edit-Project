// src/app/upload/page.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { uploadFileAction, uploadUrlAction } from "./action";
import Link from "next/link";

type UploadMode = "file" | "url";
type UploadStatus = "idle" | "uploading" | "processing" | "error";

const ACCEPTED_TYPES = [
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

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadPage() {
  const [mode, setMode] = useState<UploadMode>("file");
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // File mode state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // URL mode state
  const [imageUrl, setImageUrl] = useState("");
  const [urlPreview, setUrlPreview] = useState(false);

  // Caption
  const [caption, setCaption] = useState("");

  // ── File handling ──────────────────────────

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `"${file.type || "unknown"}" is not a supported image format. Try JPEG, PNG, WebP, GIF, or SVG.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File is too large (${formatFileSize(file.size)}). Maximum size is 10 MB.`;
    }
    return null;
  }, []);

  const handleFileSelect = useCallback(
    (file: File) => {
      const error = validateFile(file);
      if (error) {
        setErrorMessage(error);
        setStatus("error");
        return;
      }

      setSelectedFile(file);
      setErrorMessage("");
      setStatus("idle");

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    },
    [validateFile]
  );

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMessage("");
    setStatus("idle");
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // ── Drag and Drop ──────────────────────────

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set false if we're leaving the dropzone (not entering a child)
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  // ── Upload Logic ───────────────────────────

  const handleSubmit = async () => {
    if (mode === "file") {
      if (!selectedFile) return;

      setStatus("uploading");
      setProgress(0);
      setErrorMessage("");

      try {
        // Animate progress while uploading
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 85) {
              clearInterval(progressInterval);
              return 85;
            }
            return prev + Math.random() * 15;
          });
        }, 200);

        // Build FormData with file + caption
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("caption", caption);

        // Call server action directly — handles file save + DB record
        const result = await uploadFileAction(formData);

        clearInterval(progressInterval);

        if (result?.error) {
          throw new Error(result.error);
        }

        setProgress(100);
        setStatus("processing");
        // redirect happens inside the server action
      } catch (err) {
        setStatus("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Upload failed. Please try again."
        );
        setProgress(0);
      }
    } else {
      // URL mode
      if (!imageUrl.trim()) return;

      setStatus("processing");
      setErrorMessage("");

      try {
        const result = await uploadUrlAction(imageUrl.trim(), caption);
        if (result?.error) {
          throw new Error(result.error);
        }
        // redirect happens inside the server action
      } catch (err) {
        setStatus("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to save. Please try again."
        );
      }
    }
  };

  const isSubmitDisabled =
    status === "uploading" ||
    status === "processing" ||
    (mode === "file" && !selectedFile) ||
    (mode === "url" && !imageUrl.trim());

  return (
    <div
      className="max-w-2xl mx-auto mt-8"
      style={{ animation: "slide-up 0.6s ease forwards" }}
    >
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm mb-4 transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15,18 9,12 15,6" />
          </svg>
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(240, 112, 104, 0.15), rgba(240, 196, 100, 0.15))",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent-rose)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17,8 12,3 7,8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div>
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Upload Photo
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
              Share your creativity with the community
            </p>
          </div>
        </div>
      </div>

      {/* Main card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        {/* Mode tabs */}
        <div
          className="flex border-b"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <button
            onClick={() => {
              setMode("file");
              setErrorMessage("");
              setStatus("idle");
            }}
            className={`upload-mode-tab flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 ${mode === "file" ? "active" : ""}`}
            style={{
              color: mode === "file" ? "var(--text-primary)" : "var(--text-muted)",
              background:
                mode === "file" ? "rgba(184, 140, 245, 0.04)" : "transparent",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17,8 12,3 7,8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload File
          </button>
          <button
            onClick={() => {
              setMode("url");
              setErrorMessage("");
              setStatus("idle");
            }}
            className={`upload-mode-tab flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 ${mode === "url" ? "active" : ""}`}
            style={{
              color: mode === "url" ? "var(--text-primary)" : "var(--text-muted)",
              background:
                mode === "url" ? "rgba(184, 140, 245, 0.04)" : "transparent",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            Paste URL
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* ── FILE UPLOAD MODE ─── */}
          {mode === "file" && (
            <div className="space-y-5">
              {/* Dropzone */}
              {!previewUrl ? (
                <div
                  className={`upload-dropzone relative rounded-2xl cursor-pointer ${isDragging ? "dragging" : ""}`}
                  style={{
                    border: "2px dashed var(--border-subtle)",
                    background: "var(--bg-deep)",
                    minHeight: "260px",
                  }}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
                    {/* Icon */}
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                      style={{
                        background: isDragging
                          ? "linear-gradient(135deg, rgba(184, 140, 245, 0.2), rgba(240, 112, 104, 0.2))"
                          : "linear-gradient(135deg, rgba(240, 112, 104, 0.08), rgba(184, 140, 245, 0.08))",
                        border: "1px solid var(--border-subtle)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {isDragging ? (
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--accent-lavender)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                          <polyline points="7,10 12,15 17,10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      ) : (
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--accent-rose)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21,15 16,10 5,21" />
                        </svg>
                      )}
                    </div>

                    {/* Text */}
                    <p
                      className="text-sm font-semibold mb-1"
                      style={{
                        color: isDragging
                          ? "var(--accent-lavender)"
                          : "var(--text-primary)",
                      }}
                    >
                      {isDragging
                        ? "Drop your image here"
                        : "Drag & drop your image here"}
                    </p>
                    <p
                      className="text-xs mb-4"
                      style={{ color: "var(--text-muted)" }}
                    >
                      or click to browse from your device
                    </p>

                    {/* Supported formats */}
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                      {["JPG", "PNG", "WebP", "GIF", "SVG", "AVIF"].map(
                        (fmt) => (
                          <span
                            key={fmt}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                            style={{
                              background: "var(--bg-elevated)",
                              color: "var(--text-muted)",
                              border: "1px solid var(--border-subtle)",
                            }}
                          >
                            {fmt}
                          </span>
                        )
                      )}
                      <span
                        className="text-[10px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        · Max 10 MB
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Preview */
                <div className="upload-preview relative rounded-2xl overflow-hidden">
                  <div
                    className="relative"
                    style={{
                      background: "var(--bg-deep)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "1rem",
                      overflow: "hidden",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full max-h-[400px] object-contain"
                      style={{ display: "block" }}
                    />

                    {/* Overlay with file info */}
                    <div
                      className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(13,10,18,0.9), transparent)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(240, 112, 104, 0.2), rgba(240, 196, 100, 0.2))",
                            border: "1px solid var(--border-subtle)",
                          }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--accent-amber)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect
                              x="3"
                              y="3"
                              width="18"
                              height="18"
                              rx="2"
                              ry="2"
                            />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21,15 16,10 5,21" />
                          </svg>
                        </div>
                        <div>
                          <p
                            className="text-xs font-semibold truncate max-w-[200px]"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {selectedFile?.name}
                          </p>
                          <p
                            className="text-[10px]"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {selectedFile && formatFileSize(selectedFile.size)} ·{" "}
                            {selectedFile?.type.split("/")[1]?.toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearFile();
                        }}
                        className="upload-remove-btn p-2 rounded-lg"
                        style={{
                          background: "rgba(240, 112, 104, 0.1)",
                          border: "1px solid rgba(240, 112, 104, 0.2)",
                          color: "var(--accent-rose)",
                        }}
                        title="Remove image"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload progress */}
              {status === "uploading" && (
                <div className="space-y-2" style={{ animation: "fade-in 0.3s ease" }}>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Uploading...
                    </span>
                    <span
                      className="text-xs font-bold tabular-nums"
                      style={{ color: "var(--accent-lavender)" }}
                    >
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: "var(--bg-elevated)" }}
                  >
                    <div
                      className="upload-progress-bar h-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {status === "processing" && (
                <div
                  className="flex items-center gap-2 text-xs font-medium"
                  style={{
                    color: "var(--accent-amber)",
                    animation: "fade-in 0.3s ease",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ animation: "spin-slow 1s linear infinite" }}
                  >
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Saving to your gallery...
                </div>
              )}
            </div>
          )}

          {/* ── URL MODE ─── */}
          {mode === "url" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Image URL
                </label>
                <div className="relative">
                  <div
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </div>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setUrlPreview(false);
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all duration-300 outline-none"
                    style={{
                      background: "var(--bg-deep)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--text-primary)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "var(--accent-lavender)";
                      e.currentTarget.style.boxShadow =
                        "0 0 0 3px rgba(184, 140, 245, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-subtle)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Paste a direct image link from Unsplash, Imgur, or any image host
                </p>
              </div>

              {/* URL Preview button */}
              {imageUrl.trim() && !urlPreview && (
                <button
                  onClick={() => setUrlPreview(true)}
                  className="text-xs font-medium flex items-center gap-1.5 transition-colors"
                  style={{ color: "var(--accent-lavender)" }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Preview image
                </button>
              )}

              {/* URL Preview image */}
              {urlPreview && imageUrl.trim() && (
                <div
                  className="upload-preview rounded-xl overflow-hidden"
                  style={{
                    background: "var(--bg-deep)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="URL Preview"
                    className="w-full max-h-[300px] object-contain"
                    onError={() => {
                      setUrlPreview(false);
                      setErrorMessage("Could not load image from this URL.");
                      setStatus("error");
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* ── CAPTION ─── */}
          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Caption
              <span
                className="font-normal ml-1"
                style={{ color: "var(--text-muted)" }}
              >
                (optional)
              </span>
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Describe your photo... ✨"
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 outline-none resize-none"
              style={{
                background: "var(--bg-deep)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--accent-lavender)";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(184, 140, 245, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border-subtle)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* ── ERROR MESSAGE ─── */}
          {status === "error" && errorMessage && (
            <div
              className="flex items-start gap-3 p-4 rounded-xl text-sm"
              style={{
                background: "rgba(240, 112, 104, 0.06)",
                border: "1px solid rgba(240, 112, 104, 0.15)",
                color: "var(--accent-rose)",
                animation: "slide-up 0.3s ease",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-0.5 shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ── SUBMIT ─── */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              className="flex-1 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2"
              style={{
                background: isSubmitDisabled
                  ? "var(--bg-elevated)"
                  : "linear-gradient(135deg, var(--accent-rose), var(--accent-amber))",
                color: isSubmitDisabled
                  ? "var(--text-muted)"
                  : "var(--bg-deep)",
                boxShadow: isSubmitDisabled
                  ? "none"
                  : "0 4px 15px rgba(240, 112, 104, 0.2)",
                cursor: isSubmitDisabled ? "not-allowed" : "pointer",
                transform: "scale(1)",
              }}
              onMouseEnter={(e) => {
                if (!isSubmitDisabled) {
                  e.currentTarget.style.transform = "scale(1.02)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {status === "uploading" ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    style={{ animation: "spin-slow 1s linear infinite" }}
                  >
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Uploading...
                </>
              ) : status === "processing" ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    style={{ animation: "spin-slow 1s linear infinite" }}
                  >
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17,8 12,3 7,8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Publish to Gallery
                </>
              )}
            </button>
            <Link
              href="/dashboard"
              className="px-6 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 text-center flex items-center"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)",
              }}
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>

      {/* Tips section */}
      <div
        className="mt-6 rounded-xl p-5 space-y-3"
        style={{
          background: "rgba(184, 140, 245, 0.03)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <div className="flex items-center gap-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent-amber)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--text-secondary)" }}
          >
            Pro Tips
          </span>
        </div>
        <ul className="space-y-1.5">
          {[
            "Use high resolution images for the best visual quality",
            "After uploading, use the editor to apply stunning filters",
            "Add a caption to help others discover your work",
          ].map((tip, i) => (
            <li
              key={i}
              className="text-xs flex items-start gap-2"
              style={{ color: "var(--text-muted)" }}
            >
              <span
                className="mt-1 w-1 h-1 rounded-full shrink-0"
                style={{ background: "var(--accent-lavender)" }}
              />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}