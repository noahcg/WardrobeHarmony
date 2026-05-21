import { areColorsCompatible, neutralColors, safeColorPairings } from "./colorGuide";
import { ClothingItem, Formality, Pattern, Saturation, Tone } from "../models/clothing";
import { OutfitRating } from "../models/outfit";

export type CompatibilityResult = {
  score: number;
  rating: OutfitRating;
  reasons: string[];
  warnings: string[];
};

const toneValue: Record<Tone, number> = {
  light: 1,
  medium: 2,
  dark: 3,
};

const formalityValue: Record<Formality, number> = {
  casual: 1,
  "smart-casual": 2,
  business: 3,
  formal: 4,
};

const loudPatterns: Pattern[] = ["plaid", "floral", "graphic", "stripe", "check"];
const brightSaturations: Saturation[] = ["bright", "rich"];

export function getRating(score: number): OutfitRating {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Risky";
  return "Avoid";
}

export function evaluateCompatibility(items: ClothingItem[]): CompatibilityResult {
  if (items.length === 0) {
    return {
      score: 0,
      rating: "Avoid",
      reasons: [],
      warnings: ["Add at least one top and one bottom to evaluate the outfit."],
    };
  }

  let score = 55;
  const reasons: string[] = [];
  const warnings: string[] = [];

  const families = items.map((item) => item.colorFamily);
  const uniqueFamilies = Array.from(new Set(families));
  const neutralCount = families.filter((family) => neutralColors.includes(family)).length;

  if (neutralCount >= Math.max(1, items.length - 1)) {
    score += 12;
    reasons.push("The outfit uses an anchor neutral, which keeps the combination versatile.");
  }

  let compatiblePairs = 0;
  let checkedPairs = 0;
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      checkedPairs += 1;
      const a = items[i].colorFamily;
      const b = items[j].colorFamily;
      if (areColorsCompatible(a, b)) {
        compatiblePairs += 1;
        if (safeColorPairings[a]?.includes(b) || safeColorPairings[b]?.includes(a)) {
          reasons.push(`${label(a)} and ${label(b)} are a common harmonious pairing.`);
        }
      }
    }
  }

  if (checkedPairs > 0) {
    const pairRatio = compatiblePairs / checkedPairs;
    score += Math.round(pairRatio * 18);
    if (pairRatio < 0.55) {
      score -= 14;
      warnings.push("Several color pairings are not in the safe harmony set.");
    }
  }

  const tones = items.map((item) => item.tone);
  const toneSpread = Math.max(...tones.map((tone) => toneValue[tone])) - Math.min(...tones.map((tone) => toneValue[tone]));
  if (toneSpread >= 2) {
    score += 10;
    reasons.push("The outfit has balanced light and dark contrast.");
  } else if (uniqueFamilies.length > 1) {
    score += 4;
    reasons.push("The outfit keeps contrast soft without becoming one-note.");
  } else {
    score -= 6;
    warnings.push("The outfit may feel low contrast because the tones are very similar.");
  }

  const saturationSet = new Set(items.map((item) => item.saturation));
  const brightCount = items.filter((item) => brightSaturations.includes(item.saturation)).length;
  if (saturationSet.has("muted") && (saturationSet.has("neutral") || saturationSet.size === 1)) {
    score += 9;
    reasons.push("Muted and neutral saturation levels keep the outfit calm and cohesive.");
  }
  if (brightCount === 1 && neutralCount > 0) {
    score += 4;
    reasons.push("One richer color is balanced by neutral pieces.");
  }
  if (brightCount > 1) {
    score -= 12;
    warnings.push("Multiple bright or rich colors can compete visually.");
  }

  const patternedItems = items.filter((item) => item.pattern !== "solid");
  const loudPatternCount = items.filter((item) => loudPatterns.includes(item.pattern)).length;
  if (patternedItems.length === 0) {
    score += 6;
    reasons.push("Solid pieces make this a safe, clean combination.");
  } else if (patternedItems.length === 1) {
    score += 7;
    reasons.push("One patterned or textured piece adds interest without making the outfit busy.");
  } else {
    score -= loudPatternCount > 1 ? 14 : 6;
    warnings.push("Multiple patterns or textures may feel visually busy.");
  }

  const formalities = items.map((item) => item.formality);
  const formalitySpread =
    Math.max(...formalities.map((formality) => formalityValue[formality])) -
    Math.min(...formalities.map((formality) => formalityValue[formality]));
  if (formalitySpread <= 1) {
    score += 8;
    reasons.push("The formality levels are closely aligned.");
  } else if (formalitySpread >= 3) {
    score -= 14;
    warnings.push("The formality levels are far apart, so the outfit may feel mismatched.");
  } else {
    warnings.push("The colors work, but the formality levels are slightly different.");
  }

  const hasTop = items.some((item) => item.category === "top");
  const hasBottom = items.some((item) => item.category === "bottom");
  const hasShoes = items.some((item) => item.category === "shoes");
  if (hasTop && hasBottom) {
    score += 10;
    reasons.push("The outfit has a clear top and bottom foundation.");
  } else {
    score -= 15;
    warnings.push("Add at least one top and one bottom for a complete outfit read.");
  }
  if (hasShoes) {
    score += 5;
    reasons.push("Shoes complete the outfit and help balance the color story.");
  }

  const finalScore = Math.max(0, Math.min(100, score));
  return {
    score: finalScore,
    rating: getRating(finalScore),
    reasons: unique(reasons).slice(0, 5),
    warnings: unique(warnings).slice(0, 4),
  };
}

export function findSuggestedSwaps(selected: ClothingItem[], wardrobe: ClothingItem[]) {
  const selectedIds = new Set(selected.map((item) => item.id));
  const baseline = evaluateCompatibility(selected).score;

  return wardrobe
    .filter((candidate) => !selectedIds.has(candidate.id))
    .map((candidate) => {
      const replaceIndex = selected.findIndex((item) => item.category === candidate.category);
      const testItems =
        replaceIndex >= 0
          ? selected.map((item, index) => (index === replaceIndex ? candidate : item))
          : [...selected, candidate];
      const result = evaluateCompatibility(testItems);
      return { item: candidate, result, delta: result.score - baseline };
    })
    .filter((swap) => swap.delta >= 0 || swap.result.score >= 72)
    .sort((a, b) => b.result.score - a.result.score)
    .slice(0, 6);
}

function label(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}
