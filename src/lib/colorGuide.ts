import { ColorFamily } from "../models/clothing";

export const neutralColors: ColorFamily[] = ["black", "white", "gray", "navy", "brown", "tan", "cream"];

const pairings: Record<ColorFamily, ColorFamily[]> = {
  black: ["white", "gray", "tan", "cream", "sage"],
  white: ["navy", "black", "gray", "olive", "tan", "blue", "sage"],
  gray: ["white", "navy", "black", "burgundy", "blue", "cream"],
  navy: ["white", "gray", "cream", "tan", "olive", "sage", "burgundy", "blue"],
  blue: ["navy", "tan", "brown", "white", "gray", "cream"],
  brown: ["cream", "blue", "tan", "sage", "white", "navy"],
  tan: ["white", "navy", "sage", "black", "cream", "olive", "blue"],
  cream: ["navy", "olive", "sage", "brown", "gray", "black", "burgundy"],
  green: ["cream", "navy", "tan", "white", "brown"],
  olive: ["cream", "white", "navy", "tan", "black", "brown"],
  sage: ["navy", "cream", "tan", "white", "brown", "black"],
  red: ["navy", "white", "gray", "cream"],
  burgundy: ["navy", "gray", "cream", "white", "tan"],
  pink: ["navy", "gray", "cream", "white", "tan"],
  purple: ["gray", "cream", "navy", "white"],
  yellow: ["navy", "gray", "white", "tan"],
  orange: ["navy", "cream", "tan", "brown"],
};

export const safeColorPairings = pairings;

export function getGreatMatches(color: ColorFamily): ColorFamily[] {
  return safeColorPairings[color] ?? [];
}

export function getGoodOptions(color: ColorFamily): ColorFamily[] {
  const great = new Set(getGreatMatches(color));
  return neutralColors.filter((option) => option !== color && !great.has(option));
}

export function areColorsCompatible(a: ColorFamily, b: ColorFamily) {
  return a === b || neutralColors.includes(a) || neutralColors.includes(b) || safeColorPairings[a]?.includes(b);
}
