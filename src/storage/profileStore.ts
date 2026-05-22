import * as FileSystem from "expo-file-system/legacy";

import { UserProfile } from "../models/profile";

const storageDir = `${FileSystem.documentDirectory ?? ""}wardrobe-harmony/`;
const profileFile = `${storageDir}profile.json`;

export async function loadProfile(): Promise<UserProfile> {
  await ensureStorage();
  const info = await FileSystem.getInfoAsync(profileFile);
  if (!info.exists) {
    await saveProfile({});
    return {};
  }

  const contents = await FileSystem.readAsStringAsync(profileFile);
  const parsed = JSON.parse(contents) as UserProfile;
  return parsed && typeof parsed === "object" ? parsed : {};
}

export async function saveProfile(profile: UserProfile) {
  await ensureStorage();
  await FileSystem.writeAsStringAsync(profileFile, JSON.stringify(profile, null, 2));
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

