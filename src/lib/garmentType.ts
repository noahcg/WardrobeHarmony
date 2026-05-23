import ImageLabeling, { Label } from "@react-native-ml-kit/image-labeling";

import { ClothingCategory } from "../models/clothing";

export type DetectedGarmentType = {
  category: ClothingCategory;
  subcategory?: string;
  confidence: "low" | "medium" | "high";
  rawLabel: string;
};

type Rule = {
  category: ClothingCategory;
  keywords: string[];
};

// Checked in priority order so e.g. "denim jacket" lands in outerwear, not bottoms.
const rules: Rule[] = [
  {
    category: "shoes",
    keywords: ["shoe", "sneaker", "boot", "sandal", "footwear", "loafer", "heel", "trainer", "slipper"],
  },
  {
    category: "outerwear",
    keywords: ["coat", "jacket", "blazer", "parka", "hoodie", "overcoat", "raincoat", "windbreaker", "cardigan", "suit", "outerwear"],
  },
  {
    category: "bottom",
    keywords: ["jean", "trouser", "pant", "short", "skirt", "legging", "chino", "denim", "sweatpant"],
  },
  {
    category: "accessory",
    keywords: ["hat", "cap", "beanie", "bag", "handbag", "backpack", "purse", "belt", "watch", "scarf", "tie", "glove", "sock", "sunglass", "necklace", "jewel", "wallet", "bracelet"],
  },
  {
    category: "top",
    keywords: ["shirt", "t-shirt", "tee", "blouse", "sweater", "jersey", "polo", "sleeve", "pullover", "turtleneck", "tank", "vest", "dress", "knit"],
  },
];

// Labels too generic to use as a subcategory name.
const genericLabels = new Set(["clothing", "fashion", "textile", "pattern", "outerwear", "footwear", "sleeve"]);

export async function detectGarmentType(imageUri: string): Promise<DetectedGarmentType | undefined> {
  let labels: Label[];
  try {
    labels = await ImageLabeling.label(imageUri);
  } catch (error) {
    // Native module not present (e.g. running before a dev-client rebuild) — fail soft.
    console.warn("Garment type detection unavailable", error);
    return undefined;
  }

  const ranked = [...labels].sort((a, b) => b.confidence - a.confidence);

  // Prefer a specific label (e.g. "Shirt") for naming; fall back to a generic
  // one (e.g. "Sleeve", "Footwear") only to classify when nothing specific hits.
  return matchLabels(ranked, false) ?? matchLabels(ranked, true);
}

function matchLabels(ranked: Label[], allowGeneric: boolean): DetectedGarmentType | undefined {
  for (const label of ranked) {
    const text = label.text.toLowerCase();
    const isGeneric = genericLabels.has(text);
    if (isGeneric && !allowGeneric) continue;
    for (const rule of rules) {
      if (rule.keywords.some((keyword) => text.includes(keyword))) {
        return {
          category: rule.category,
          subcategory: isGeneric ? undefined : titleCase(label.text),
          confidence: confidenceFor(label.confidence),
          rawLabel: label.text,
        };
      }
    }
  }
  return undefined;
}

function confidenceFor(score: number): "low" | "medium" | "high" {
  if (score > 0.6) return "high";
  if (score >= 0.35) return "medium";
  return "low";
}

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
