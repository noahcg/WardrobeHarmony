import { ClothingItem } from "./clothing";

export type OutfitRating = "Excellent" | "Good" | "Risky" | "Avoid";

export type Outfit = {
  id: string;
  name: string;
  items: ClothingItem[];
  score: number;
  rating: OutfitRating;
  reasons: string[];
  warnings: string[];
  favorite?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type SavedOutfit = {
  id: string;
  name: string;
  itemIds: string[];
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
};
