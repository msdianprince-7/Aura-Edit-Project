"use client";

import { useState, useTransition, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { saveEditAction } from "@/app/edit/[photoId]/action";
import {
  EditData,
  DEFAULT_EDIT,
  buildCssFilter,
  FILTER_PRESETS,
} from "@/lib/filters";

interface PhotoEditorProps {
  photo: {
    id: string;
    imageUrl: string;
    caption: string | null;
  };
  existingEdit: EditData | null;
}

interface SliderConfig {
  key: keyof EditData;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  icon: string;
}

const SLIDERS: SliderConfig[] = [
  { key: "brightness", label: "Brightness", min: 0, max: 200, step: 1, unit: "%", icon: "☀️" },
  { key: "contrast", label: "Contrast", min: 0, max: 200, step: 1, unit: "%", icon: "◐" },
  { key: "saturation", label: "Saturation", min: 0, max: 200, step: 1, unit: "%", icon: "🎨" },
  { key: "hueRotate", label: "Hue Rotate", min: -180, max: 180, step: 1, unit: "°", icon: "🔄" },
  { key: "sepia", label: "Sepia", min: 0, max: 100, step: 1, unit: "%", icon: "🟤" },
  { key: "grayscale", label: "Grayscale", min: 0, max: 100, step: 1, unit: "%", icon: "⚫" },
  { key: "blur", label: "Blur", min: 0, max: 20, step: 1, unit: "px", icon: "🌫️" },
];

const OVERLAY_COLORS = [
  null,
  "rgba(240, 112, 104, 0.12)",
  "rgba(240, 196, 100, 0.12)",
  "rgba(184, 140, 245, 0.12)",
  "rgba(100, 150, 240, 0.12)",
  "rgba(100, 240, 180, 0.10)",
  "rgba(13, 10, 18, 0.20)",
  "rgba(255, 255, 255, 0.08)",
];

const OVERLAY_LABELS = ["None", "Rose", "Amber", "Lavender", "Azure", "Mint", "Shadow", "Mist"];

export default function PhotoEditor({ photo, existingEdit }: PhotoEditorProps) {
  const [edits, setEdits] = useState<EditData>(existingEdit || { ...DEFAULT_EDIT });
  const [activeTab, setActiveTab] = useState<"presets" | "adjust" | "overlay">("presets");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [compareMode, setCompareMode] = useState(false);

  const filterString = buildCssFilter(edits);

  const updateEdit = useCallback((key: keyof EditData, value: number | string | null) => {
    setEdits((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }, []);

  const applyPreset = useCallback((preset: typeof FILTER_PRESETS[0]) => {
    setEdits((prev) => ({
      ...prev,
      ...preset.edits,
      filterName: preset.name,
    }));
    setSaved(false);
  }, []);

  const resetAll = useCallback(() => {
    setEdits({ ...DEFAULT_EDIT });
    setSaved(false);
  }, []);

  const handleSave = useCallback(() => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("photoId", photo.id);
      formData.set("filterName", edits.filterName || "None");
      formData.set("overlay", edits.overlay || "");
      formData.set("brightness", String(edits.brightness));
      formData.set("contrast", String(edits.contrast));
      formData.set("saturation", String(edits.saturation));
      formData.set("hueRotate", String(edits.hueRotate));
      formData.set("sepia", String(edits.sepia));
      formData.set("grayscale", String(edits.grayscale));
      formData.set("blur", String(edits.blur));
      await saveEditAction(formData);
      setSaved(true);
    });
  }, [photo.id, edits, startTransition]);

  return (
    <div className="editor-layout" style={{ animation: "slide-up 0.6s ease forwards" }}>
      {/* Header */}
      <div className="mb-6">
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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Photo Editor
            </h1>
            {photo.caption && (
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{photo.caption}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Compare toggle */}
            <button
              onClick={() => setCompareMode(!compareMode)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                background: compareMode ? "rgba(184, 140, 245, 0.15)" : "var(--bg-elevated)",
                border: `1px solid ${compareMode ? "rgba(184, 140, 245, 0.3)" : "var(--border-subtle)"}`,
                color: compareMode ? "var(--accent-lavender)" : "var(--text-secondary)",
              }}
            >
              {compareMode ? "◉ Original" : "○ Compare"}
            </button>
            {/* Reset */}
            <button
              onClick={resetAll}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)",
              }}
            >
              ↺ Reset
            </button>
            {/* Save */}
            <button
              onClick={handleSave}
              disabled={isPending}
              className="px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50"
              style={{
                background: saved
                  ? "linear-gradient(135deg, #34d399, #10b981)"
                  : "linear-gradient(135deg, var(--accent-rose), var(--accent-amber))",
                color: "var(--bg-deep)",
                boxShadow: "0 4px 15px rgba(240, 112, 104, 0.2)",
              }}
            >
              {isPending ? "Saving..." : saved ? "✓ Saved" : "Save Edit"}
            </button>
          </div>
        </div>
      </div>

      {/* Main editor area */}
      <div className="editor-grid">
        {/* Preview panel */}
        <div
          className="editor-preview rounded-2xl overflow-hidden relative"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {/* Filter indicator badge */}
          <div
            className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: "rgba(13, 10, 18, 0.7)",
              backdropFilter: "blur(8px)",
              border: "1px solid var(--border-subtle)",
              color: "var(--accent-amber)",
            }}
          >
            {edits.filterName || "None"}
          </div>

          {/* Photo */}
          <div className="relative w-full aspect-[4/5] sm:aspect-[3/4]">
            <Image
              src={photo.imageUrl}
              alt={photo.caption || "Editing photo"}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover transition-all duration-300"
              style={{
                filter: compareMode ? "none" : filterString,
              }}
              priority
            />
            {/* Overlay */}
            {!compareMode && edits.overlay && (
              <div
                className="absolute inset-0 z-10 pointer-events-none transition-all duration-300"
                style={{ background: edits.overlay }}
              />
            )}
          </div>
        </div>

        {/* Controls panel */}
        <div
          className="editor-controls rounded-2xl p-5 sm:p-6 flex flex-col"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {/* Tab selector */}
          <div
            className="flex rounded-xl p-1 mb-6"
            style={{ background: "var(--bg-elevated)" }}
          >
            {(["presets", "adjust", "overlay"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize"
                style={{
                  background: activeTab === tab ? "var(--bg-surface)" : "transparent",
                  color: activeTab === tab ? "var(--text-primary)" : "var(--text-muted)",
                  boxShadow: activeTab === tab ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
                }}
              >
                {tab === "presets" ? "✦ Presets" : tab === "adjust" ? "◎ Adjust" : "◇ Overlay"}
              </button>
            ))}
          </div>

          {/* Presets tab */}
          {activeTab === "presets" && (
            <div className="grid grid-cols-3 gap-2 overflow-y-auto flex-1 editor-scroll">
              {FILTER_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="p-3 rounded-xl text-center transition-all duration-200 hover:scale-[1.03] group"
                  style={{
                    background: edits.filterName === preset.name ? "rgba(184, 140, 245, 0.12)" : "var(--bg-elevated)",
                    border: `1px solid ${edits.filterName === preset.name ? "rgba(184, 140, 245, 0.3)" : "var(--border-subtle)"}`,
                  }}
                >
                  <div className="text-2xl mb-1">{preset.icon}</div>
                  <div
                    className="text-xs font-medium"
                    style={{
                      color: edits.filterName === preset.name ? "var(--accent-lavender)" : "var(--text-secondary)",
                    }}
                  >
                    {preset.name}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Adjust tab */}
          {activeTab === "adjust" && (
            <div className="space-y-4 overflow-y-auto flex-1 editor-scroll pr-1">
              {SLIDERS.map((slider) => (
                <div key={slider.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
                      <span>{slider.icon}</span>
                      {slider.label}
                    </label>
                    <span
                      className="text-xs font-mono px-2 py-0.5 rounded-md"
                      style={{
                        background: "var(--bg-elevated)",
                        color: "var(--accent-amber)",
                      }}
                    >
                      {edits[slider.key] as number}{slider.unit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={slider.min}
                    max={slider.max}
                    step={slider.step}
                    value={edits[slider.key] as number}
                    onChange={(e) => updateEdit(slider.key, parseFloat(e.target.value))}
                    className="editor-slider w-full"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Overlay tab */}
          {activeTab === "overlay" && (
            <div className="space-y-4 flex-1">
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Add a subtle color tint to your photo
              </p>
              <div className="grid grid-cols-4 gap-3">
                {OVERLAY_COLORS.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => updateEdit("overlay", color)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 hover:scale-[1.05]"
                    style={{
                      background: edits.overlay === color ? "rgba(184, 140, 245, 0.12)" : "var(--bg-elevated)",
                      border: `1px solid ${edits.overlay === color ? "rgba(184, 140, 245, 0.3)" : "var(--border-subtle)"}`,
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full border-2"
                      style={{
                        background: color || "linear-gradient(135deg, #333, #555)",
                        borderColor: edits.overlay === color ? "var(--accent-lavender)" : "var(--border-subtle)",
                      }}
                    >
                      {!color && (
                        <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: "var(--text-muted)" }}>
                          ⊘
                        </div>
                      )}
                    </div>
                    <span
                      className="text-xs font-medium"
                      style={{
                        color: edits.overlay === color ? "var(--accent-lavender)" : "var(--text-muted)",
                      }}
                    >
                      {OVERLAY_LABELS[i]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
