export type ClothingCategory = "top" | "bottom" | "shoes" | "outerwear" | "accessory";

export type ColorFamily =
  | "black"
  | "white"
  | "gray"
  | "navy"
  | "blue"
  | "brown"
  | "tan"
  | "cream"
  | "green"
  | "olive"
  | "sage"
  | "red"
  | "burgundy"
  | "pink"
  | "purple"
  | "yellow"
  | "orange";

export type Tone = "light" | "medium" | "dark";
export type Saturation = "neutral" | "muted" | "rich" | "bright";
export type Formality = "casual" | "smart-casual" | "business" | "formal";
export type Pattern = "solid" | "stripe" | "plaid" | "check" | "floral" | "graphic" | "texture";
export type Season = "spring" | "summer" | "fall" | "winter" | "all-season";

export type ClothingItem = {
  id: string;
  name: string;
  category: ClothingCategory;
  subcategory?: string;
  colorName?: string;
  colorFamily: ColorFamily;
  secondaryColorFamily?: ColorFamily;
  tone: Tone;
  saturation: Saturation;
  formality: Formality;
  pattern: Pattern;
  seasons: Season[];
  imageUrl?: string;
  confidence?: "low" | "medium" | "high";
  notes?: string;
  tags?: string[];
};
