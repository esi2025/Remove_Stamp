export interface BoundingBox {
  x: number;      // 0 to 1 normalized
  y: number;      // 0 to 1 normalized
  width: number;  // 0 to 1 normalized
  height: number; // 0 to 1 normalized
}

export type FilterMode = "blue_stamp" | "red_stamp" | "dark_stroke" | "original_color" | "monochrome";

export interface ElementConfig {
  box: BoundingBox;
  threshold: number;      // Background removal threshold (0 - 255)
  colorMatchStrength: number; // Color matching multiplier for keying channels
  filterMode: FilterMode;
  strokeDensityBoost: number; // Boost ink density / darkness
  eraserPaths: { points: { x: number; y: number }[]; brushSize: number }[];
  rotation: number;           // Rotation angle in degrees (-180 to 180)
  contrast: number;           // Contrast adjustment level (-100 to 100)
}

export interface DetectionResult {
  stamp: BoundingBox | null;
  signature: BoundingBox | null;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  type: "stamp" | "signature";
  thumbnailUrl: string;
  filterMode: FilterMode;
  documentName: string;
}

