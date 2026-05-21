import * as FileSystem from "expo-file-system/legacy";

import { mockWardrobe } from "../data/mockWardrobe";
import { ClothingItem } from "../models/clothing";

const storageDir = `${FileSystem.documentDirectory ?? ""}wardrobe-harmony/`;
const imagesDir = `${storageDir}images/`;
const wardrobeFile = `${storageDir}wardrobe.json`;

export async function loadWardrobe(): Promise<ClothingItem[]> {
  await ensureStorage();
  const fileInfo = await FileSystem.getInfoAsync(wardrobeFile);
  if (!fileInfo.exists) {
    await saveWardrobe(mockWardrobe);
    return mockWardrobe;
  }

  const contents = await FileSystem.readAsStringAsync(wardrobeFile);
  const parsed = JSON.parse(contents) as ClothingItem[];
  return Array.isArray(parsed) ? parsed : mockWardrobe;
}

export async function saveWardrobe(items: ClothingItem[]) {
  await ensureStorage();
  await FileSystem.writeAsStringAsync(wardrobeFile, JSON.stringify(items, null, 2));
}

export async function persistItemImage(sourceUri: string, itemId: string) {
  await ensureStorage();
  const extension = getExtension(sourceUri);
  const destination = `${imagesDir}${itemId}.${extension}`;
  await FileSystem.copyAsync({ from: sourceUri, to: destination });
  return destination;
}

export async function deleteStoredImage(imageUri?: string) {
  if (!imageUri?.startsWith(imagesDir)) return;
  const info = await FileSystem.getInfoAsync(imageUri);
  if (info.exists) {
    await FileSystem.deleteAsync(imageUri, { idempotent: true });
  }
}

async function ensureStorage() {
  if (!FileSystem.documentDirectory) {
    throw new Error("File storage is not available on this device.");
  }
  await ensureDirectory(storageDir);
  await ensureDirectory(imagesDir);
}

async function ensureDirectory(uri: string) {
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(uri, { intermediates: true });
  }
}

function getExtension(uri: string) {
  const cleanUri = uri.split("?")[0];
  const match = cleanUri.match(/\.([a-zA-Z0-9]+)$/);
  return match?.[1]?.toLowerCase() ?? "jpg";
}
