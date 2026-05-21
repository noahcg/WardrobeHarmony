import * as FileSystem from "expo-file-system/legacy";

import { SavedOutfit } from "../models/outfit";

const storageDir = `${FileSystem.documentDirectory ?? ""}wardrobe-harmony/`;
const outfitsFile = `${storageDir}outfits.json`;

export async function loadSavedOutfits(): Promise<SavedOutfit[]> {
  await ensureStorage();
  const info = await FileSystem.getInfoAsync(outfitsFile);
  if (!info.exists) {
    await saveOutfits([]);
    return [];
  }
  const contents = await FileSystem.readAsStringAsync(outfitsFile);
  const parsed = JSON.parse(contents) as SavedOutfit[];
  return Array.isArray(parsed) ? parsed : [];
}

export async function saveOutfits(outfits: SavedOutfit[]) {
  await ensureStorage();
  await FileSystem.writeAsStringAsync(outfitsFile, JSON.stringify(outfits, null, 2));
}

async function ensureStorage() {
  if (!FileSystem.documentDirectory) {
    throw new Error("File storage is not available on this device.");
  }
  const info = await FileSystem.getInfoAsync(storageDir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(storageDir, { intermediates: true });
  }
}
