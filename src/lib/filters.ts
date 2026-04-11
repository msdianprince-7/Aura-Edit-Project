// src/lib/filters.ts
// Shared utility for building CSS filter strings from Edit data

export interface EditData {
  brightness: number;
  contrast: number;
  saturation: number;
  hueRotate: number;
  sepia: number;
  grayscale: number;
  blur: number;
  overlay?: string | null;
  filterName?: string;
}

export const DEFAULT_EDIT: EditData = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hueRotate: 0,
  sepia: 0,
  grayscale: 0,
  blur: 0,
  overlay: null,
  filterName: "None",
};

export function buildCssFilter(edit: EditData): string {
  const parts: string[] = [];

  if (edit.brightness !== 100) parts.push(`brightness(${edit.brightness}%)`);
  if (edit.contrast !== 100) parts.push(`contrast(${edit.contrast}%)`);
  if (edit.saturation !== 100) parts.push(`saturate(${edit.saturation}%)`);
  if (edit.hueRotate !== 0) parts.push(`hue-rotate(${edit.hueRotate}deg)`);
  if (edit.sepia !== 0) parts.push(`sepia(${edit.sepia}%)`);
  if (edit.grayscale !== 0) parts.push(`grayscale(${edit.grayscale}%)`);
  if (edit.blur !== 0) parts.push(`blur(${edit.blur}px)`);

  return parts.length > 0 ? parts.join(" ") : "none";
}

// Preset filters — each is a partial EditData override
export interface FilterPreset {
  name: string;
  icon: string;
  edits: Partial<EditData>;
}

export const FILTER_PRESETS: FilterPreset[] = [
  {
    name: "None",
    icon: "⊘",
    edits: { brightness: 100, contrast: 100, saturation: 100, hueRotate: 0, sepia: 0, grayscale: 0, blur: 0, overlay: null },
  },
  {
    name: "Vintage",
    icon: "📷",
    edits: { brightness: 110, contrast: 85, saturation: 70, sepia: 40, hueRotate: 0, grayscale: 0, blur: 0, overlay: "rgba(240, 196, 100, 0.12)" },
  },
  {
    name: "Noir",
    icon: "🖤",
    edits: { brightness: 105, contrast: 130, saturation: 0, grayscale: 100, sepia: 0, hueRotate: 0, blur: 0, overlay: null },
  },
  {
    name: "Warm Sunset",
    icon: "🌅",
    edits: { brightness: 108, contrast: 105, saturation: 130, hueRotate: -15, sepia: 20, grayscale: 0, blur: 0, overlay: "rgba(240, 112, 104, 0.1)" },
  },
  {
    name: "Cool Blue",
    icon: "❄️",
    edits: { brightness: 105, contrast: 110, saturation: 90, hueRotate: 30, sepia: 0, grayscale: 0, blur: 0, overlay: "rgba(100, 150, 240, 0.1)" },
  },
  {
    name: "Film Grain",
    icon: "🎞️",
    edits: { brightness: 95, contrast: 120, saturation: 85, sepia: 15, hueRotate: 0, grayscale: 0, blur: 0, overlay: "rgba(184, 140, 245, 0.08)" },
  },
  {
    name: "Dreamy",
    icon: "✨",
    edits: { brightness: 115, contrast: 90, saturation: 110, hueRotate: 10, sepia: 10, grayscale: 0, blur: 1, overlay: "rgba(184, 140, 245, 0.12)" },
  },
  {
    name: "Moody",
    icon: "🌑",
    edits: { brightness: 85, contrast: 125, saturation: 80, hueRotate: -5, sepia: 10, grayscale: 10, blur: 0, overlay: "rgba(13, 10, 18, 0.15)" },
  },
  {
    name: "Fade",
    icon: "🌫️",
    edits: { brightness: 120, contrast: 80, saturation: 70, sepia: 5, hueRotate: 0, grayscale: 20, blur: 0, overlay: null },
  },
];
