import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import jpeg from "jpeg-js";

import { ColorFamily, Saturation, Tone } from "../models/clothing";

type Rgb = {
  r: number;
  g: number;
  b: number;
};

type Lab = {
  L: number;
  a: number;
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

const neutralFamilies: ColorFamily[] = ["black", "white", "gray", "navy", "brown", "tan", "cream"];

// Larger sample than before for more stable statistics; still tiny to decode quickly.
const SAMPLE_WIDTH = 144;

const centroidLab: Record<ColorFamily, Lab> = Object.fromEntries(
  (Object.entries(colorCentroids) as [ColorFamily, Rgb][]).map(([family, rgb]) => [family, rgbToLab(rgb)]),
) as Record<ColorFamily, Lab>;

export async function detectGarmentColor(imageUri: string): Promise<DetectedGarmentColor> {
  const sample = await ImageManipulator.manipulateAsync(imageUri, [{ resize: { width: SAMPLE_WIDTH } }], {
    compress: 0.85,
    format: ImageManipulator.SaveFormat.JPEG,
    base64: true,
  });

  const base64 = sample.base64 ?? (await FileSystem.readAsStringAsync(sample.uri, { encoding: FileSystem.EncodingType.Base64 }));
  const bytes = base64ToBytes(base64);
  const decoded = jpeg.decode(bytes, { useTArray: true, tolerantDecoding: true });

  const background = estimateBackground(decoded.data, decoded.width, decoded.height);
  const pixels = collectGarmentPixels(decoded.data, decoded.width, decoded.height, background);
  const { dominant, coverage } = dominantColor(pixels);

  const lab = rgbToLab(dominant);
  const colorFamily = nearestColorFamily(lab);
  const distance = deltaE(lab, centroidLab[colorFamily]);
  const chroma = Math.sqrt(lab.a * lab.a + lab.b * lab.b);

  return {
    colorFamily,
    colorName: readableColorName(colorFamily),
    tone: toneFor(lab.L),
    saturation: saturationFor(chroma, colorFamily),
    confidence: confidenceFor(distance, coverage),
    hex: rgbToHex(dominant),
  };
}

// Sample the four corners; product shots almost always have the garment centered,
// so the corners approximate the backdrop. If they agree, we can reject it later.
function estimateBackground(data: Uint8Array, width: number, height: number): { color: Rgb; uniform: boolean } {
  const patch = Math.max(2, Math.round(width * 0.06));
  const corners: [number, number][] = [
    [0, 0],
    [width - patch, 0],
    [0, height - patch],
    [width - patch, height - patch],
  ];

  const cornerMeans: Rgb[] = corners.map(([cx, cy]) => {
    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;
    for (let y = cy; y < cy + patch; y += 1) {
      for (let x = cx; x < cx + patch; x += 1) {
        const index = (y * width + x) * 4;
        r += data[index];
        g += data[index + 1];
        b += data[index + 2];
        count += 1;
      }
    }
    return { r: r / count, g: g / count, b: b / count };
  });

  const color = {
    r: Math.round(mean(cornerMeans.map((c) => c.r))),
    g: Math.round(mean(cornerMeans.map((c) => c.g))),
    b: Math.round(mean(cornerMeans.map((c) => c.b))),
  };

  // Corners "agree" when each is close to their average → likely a clean studio backdrop.
  const spread = mean(cornerMeans.map((c) => perceptualDistance(c, color)));
  return { color, uniform: spread < 26 };
}

function collectGarmentPixels(data: Uint8Array, width: number, height: number, background: { color: Rgb; uniform: boolean }) {
  // Two passes: first restricted to the centre (where the garment sits), and if that
  // leaves too little signal, a looser pass over the whole frame.
  const centred = gatherPixels(data, width, height, background, { x0: 0.18, x1: 0.82, y0: 0.12, y1: 0.9 });
  if (centred.length >= 60) return centred;
  return gatherPixels(data, width, height, background, { x0: 0.05, x1: 0.95, y0: 0.04, y1: 0.96 });
}

function gatherPixels(
  data: Uint8Array,
  width: number,
  height: number,
  background: { color: Rgb; uniform: boolean },
  region: { x0: number; x1: number; y0: number; y1: number },
) {
  const pixels: { rgb: Rgb; lab: Lab }[] = [];
  const xStart = Math.floor(width * region.x0);
  const xEnd = Math.ceil(width * region.x1);
  const yStart = Math.floor(height * region.y0);
  const yEnd = Math.ceil(height * region.y1);

  for (let y = yStart; y < yEnd; y += 1) {
    for (let x = xStart; x < xEnd; x += 1) {
      const index = (y * width + x) * 4;
      const rgb = { r: data[index], g: data[index + 1], b: data[index + 2] };
      const max = Math.max(rgb.r, rgb.g, rgb.b);
      const min = Math.min(rgb.r, rgb.g, rgb.b);
      const lightness = (max + min) / 510;

      // Blown-out / paper-white backdrop and near-black shadow or letterboxing.
      if (lightness > 0.93 && max - min < 22) continue;
      if (lightness < 0.05) continue;
      // Pixels matching a clean studio backdrop.
      if (background.uniform && perceptualDistance(rgb, background.color) < 30) continue;

      pixels.push({ rgb, lab: rgbToLab(rgb) });
    }
  }
  return pixels;
}

function dominantColor(pixels: { rgb: Rgb; lab: Lab }[]): { dominant: Rgb; coverage: number } {
  if (pixels.length === 0) return { dominant: colorCentroids.gray, coverage: 0 };

  // Bucket in LAB so perceptually-similar shades group together.
  const step = 10;
  const buckets = new Map<string, { count: number; r: number; g: number; b: number }>();
  for (const { rgb, lab } of pixels) {
    const key = `${Math.round(lab.L / step)}_${Math.round(lab.a / step)}_${Math.round(lab.b / step)}`;
    const bucket = buckets.get(key) ?? { count: 0, r: 0, g: 0, b: 0 };
    bucket.count += 1;
    bucket.r += rgb.r;
    bucket.g += rgb.g;
    bucket.b += rgb.b;
    buckets.set(key, bucket);
  }

  const ranked = Array.from(buckets.values())
    .map((bucket) => ({
      count: bucket.count,
      mean: { r: bucket.r / bucket.count, g: bucket.g / bucket.count, b: bucket.b / bucket.count },
    }))
    .sort((a, b) => b.count - a.count);

  // Merge buckets close to the leading one so a garment whose tone spills across
  // bucket boundaries (folds, shadows) still aggregates into one colour.
  const topLab = rgbToLab(ranked[0].mean);
  let count = 0;
  let r = 0;
  let g = 0;
  let b = 0;
  for (const bucket of ranked) {
    if (deltaE(rgbToLab(bucket.mean), topLab) < 16) {
      count += bucket.count;
      r += bucket.mean.r * bucket.count;
      g += bucket.mean.g * bucket.count;
      b += bucket.mean.b * bucket.count;
    }
  }

  return {
    dominant: { r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) },
    coverage: count / pixels.length,
  };
}

function nearestColorFamily(lab: Lab): ColorFamily {
  let best: ColorFamily = "gray";
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const [family, centroid] of Object.entries(centroidLab) as [ColorFamily, Lab][]) {
    const distance = deltaE(lab, centroid);
    if (distance < bestDistance) {
      best = family;
      bestDistance = distance;
    }
  }
  return best;
}

function confidenceFor(distance: number, coverage: number): "low" | "medium" | "high" {
  if (distance < 13 && coverage > 0.35) return "high";
  if (distance < 26 && coverage > 0.18) return "medium";
  return "low";
}

function toneFor(lightness: number): Tone {
  // LAB lightness, 0–100.
  if (lightness < 38) return "dark";
  if (lightness > 72) return "light";
  return "medium";
}

function saturationFor(chroma: number, family: ColorFamily): Saturation {
  if (neutralFamilies.includes(family)) return "neutral";
  if (chroma < 16) return "muted";
  if (chroma > 48) return "bright";
  return "rich";
}

function mean(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

// Cheap RGB distance used only for backdrop rejection.
function perceptualDistance(a: Rgb, b: Rgb) {
  const rMean = (a.r + b.r) / 2;
  const r = a.r - b.r;
  const g = a.g - b.g;
  const blue = a.b - b.b;
  return Math.sqrt((2 + rMean / 256) * r * r + 4 * g * g + (2 + (255 - rMean) / 256) * blue * blue);
}

function srgbToLinear(channel: number) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function rgbToLab({ r, g, b }: Rgb): Lab {
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);
  const x = R * 0.4124 + G * 0.3576 + B * 0.1805;
  const y = R * 0.2126 + G * 0.7152 + B * 0.0722;
  const z = R * 0.0193 + G * 0.1192 + B * 0.9505;
  const xn = 0.95047;
  const yn = 1.0;
  const zn = 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(x / xn);
  const fy = f(y / yn);
  const fz = f(z / zn);
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

function deltaE(a: Lab, b: Lab) {
  const dL = a.L - b.L;
  const da = a.a - b.a;
  const db = a.b - b.b;
  return Math.sqrt(dL * dL + da * da + db * db);
}

function readableColorName(family: ColorFamily) {
  return family
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function rgbToHex({ r, g, b }: Rgb) {
  return `#${[r, g, b].map((value) => Math.max(0, Math.min(255, value)).toString(16).padStart(2, "0")).join("")}`;
}

function base64ToBytes(base64: string) {
  const binary = globalThis.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}
