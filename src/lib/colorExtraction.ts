import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import jpeg from "jpeg-js";

import { ColorFamily, Saturation, Tone } from "../models/clothing";

type Rgb = {
  r: number;
  g: number;
  b: number;
};

export type DetectedGarmentColor = {
  colorFamily: ColorFamily;
  colorName: string;
  tone: Tone;
  saturation: Saturation;
  confidence: "low" | "medium" | "high";
  hex: string;
};

const colorCentroids: Record<ColorFamily, Rgb> = {
  black: { r: 18, g: 18, b: 17 },
  white: { r: 242, g: 238, b: 228 },
  gray: { r: 132, g: 132, b: 128 },
  navy: { r: 24, g: 35, b: 58 },
  blue: { r: 108, g: 151, b: 188 },
  brown: { r: 104, g: 67, b: 43 },
  tan: { r: 176, g: 138, b: 94 },
  cream: { r: 232, g: 219, b: 194 },
  green: { r: 78, g: 114, b: 88 },
  olive: { r: 100, g: 110, b: 66 },
  sage: { r: 158, g: 165, b: 111 },
  red: { r: 164, g: 64, b: 58 },
  burgundy: { r: 104, g: 38, b: 56 },
  pink: { r: 200, g: 135, b: 150 },
  purple: { r: 102, g: 80, b: 125 },
  yellow: { r: 210, g: 178, b: 80 },
  orange: { r: 195, g: 118, b: 62 },
};

export async function detectGarmentColor(imageUri: string): Promise<DetectedGarmentColor> {
  const sample = await ImageManipulator.manipulateAsync(imageUri, [{ resize: { width: 48 } }], {
    compress: 0.75,
    format: ImageManipulator.SaveFormat.JPEG,
    base64: true,
  });

  const base64 = sample.base64 ?? (await FileSystem.readAsStringAsync(sample.uri, { encoding: FileSystem.EncodingType.Base64 }));
  const bytes = base64ToBytes(base64);
  const decoded = jpeg.decode(bytes, { useTArray: true, tolerantDecoding: true });
  const pixels = extractCandidatePixels(decoded.data);
  const dominant = dominantColor(pixels);
  const colorFamily = nearestColorFamily(dominant);
  const hsl = rgbToHsl(dominant);
  const confidence = confidenceFor(colorFamily, dominant, pixels.length, decoded.width * decoded.height);

  return {
    colorFamily,
    colorName: readableColorName(colorFamily),
    tone: toneFor(hsl.l),
    saturation: saturationFor(hsl.s, colorFamily),
    confidence,
    hex: rgbToHex(dominant),
  };
}

function extractCandidatePixels(data: Uint8Array) {
  const pixels: Rgb[] = [];
  for (let index = 0; index < data.length; index += 4) {
    const rgb = { r: data[index], g: data[index + 1], b: data[index + 2] };
    const hsl = rgbToHsl(rgb);
    const max = Math.max(rgb.r, rgb.g, rgb.b);
    const min = Math.min(rgb.r, rgb.g, rgb.b);

    // Ignore likely white studio backgrounds, shadows, and near-black phone UI.
    if (hsl.l > 0.9 && max - min < 20) continue;
    if (hsl.l < 0.07) continue;
    pixels.push(rgb);
  }
  return pixels;
}

function dominantColor(pixels: Rgb[]) {
  if (pixels.length === 0) return colorCentroids.gray;

  const buckets = new Map<string, { count: number; total: Rgb }>();
  for (const pixel of pixels) {
    const key = `${Math.round(pixel.r / 24) * 24}-${Math.round(pixel.g / 24) * 24}-${Math.round(pixel.b / 24) * 24}`;
    const bucket = buckets.get(key) ?? { count: 0, total: { r: 0, g: 0, b: 0 } };
    bucket.count += 1;
    bucket.total.r += pixel.r;
    bucket.total.g += pixel.g;
    bucket.total.b += pixel.b;
    buckets.set(key, bucket);
  }

  const ranked = Array.from(buckets.values()).sort((a, b) => b.count - a.count);
  const best = ranked[0];
  return {
    r: Math.round(best.total.r / best.count),
    g: Math.round(best.total.g / best.count),
    b: Math.round(best.total.b / best.count),
  };
}

function nearestColorFamily(rgb: Rgb) {
  let best: ColorFamily = "gray";
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const [family, centroid] of Object.entries(colorCentroids) as [ColorFamily, Rgb][]) {
    const distance = perceptualDistance(rgb, centroid);
    if (distance < bestDistance) {
      best = family;
      bestDistance = distance;
    }
  }
  return best;
}

function confidenceFor(family: ColorFamily, rgb: Rgb, candidateCount: number, totalCount: number): "low" | "medium" | "high" {
  const distance = perceptualDistance(rgb, colorCentroids[family]);
  const coverage = candidateCount / totalCount;
  if (distance < 38 && coverage > 0.28) return "high";
  if (distance < 62 && coverage > 0.16) return "medium";
  return "low";
}

function perceptualDistance(a: Rgb, b: Rgb) {
  const rMean = (a.r + b.r) / 2;
  const r = a.r - b.r;
  const g = a.g - b.g;
  const blue = a.b - b.b;
  return Math.sqrt((2 + rMean / 256) * r * r + 4 * g * g + (2 + (255 - rMean) / 256) * blue * blue);
}

function rgbToHsl({ r, g, b }: Rgb) {
  const nr = r / 255;
  const ng = g / 255;
  const nb = b / 255;
  const max = Math.max(nr, ng, nb);
  const min = Math.min(nr, ng, nb);
  const l = (max + min) / 2;
  const delta = max - min;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return { s, l };
}

function toneFor(lightness: number): Tone {
  if (lightness < 0.33) return "dark";
  if (lightness > 0.68) return "light";
  return "medium";
}

function saturationFor(saturation: number, family: ColorFamily): Saturation {
  if (["black", "white", "gray", "navy", "brown", "tan", "cream"].includes(family)) return "neutral";
  if (saturation < 0.22) return "muted";
  if (saturation > 0.62) return "bright";
  return "rich";
}

function readableColorName(family: ColorFamily) {
  return family
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function rgbToHex({ r, g, b }: Rgb) {
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function base64ToBytes(base64: string) {
  const binary = globalThis.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}
