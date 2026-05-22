import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppHeader } from "../components/AppHeader";
import { ColorSwatch } from "../components/ColorSwatch";
import { ColorSwatchRow } from "../components/ColorSwatchRow";
import { FilterChip } from "../components/FilterChip";
import { PrimaryButton } from "../components/PrimaryButton";
import { SegmentedControl } from "../components/SegmentedControl";
import { detectGarmentColor, DetectedGarmentColor } from "../lib/colorExtraction";
import { persistItemImage } from "../storage/wardrobeStore";
import { ClothingCategory, ClothingItem, ColorFamily, Formality, Pattern, Saturation, Tone } from "../models/clothing";
import { colors } from "../theme/colors";

type Props = {
  editingItem?: ClothingItem;
  onOpenLink: () => void;
  onClose: () => void;
  onSave: (item: ClothingItem) => void;
};

const colorOptions: ColorFamily[] = ["black", "white", "gray", "navy", "blue", "brown", "tan", "cream", "olive", "sage", "burgundy"];
const categoryOptions: ClothingCategory[] = ["top", "bottom", "shoes", "outerwear", "accessory"];
const formalityOptions: Formality[] = ["casual", "smart-casual", "business", "formal"];
const patternOptions: Pattern[] = ["solid", "stripe", "plaid", "check", "graphic", "texture"];

export function AddItemScreen({ editingItem, onOpenLink, onClose, onSave }: Props) {
  const [mode, setMode] = useState<"photo" | "link" | "manual">("photo");
  const [imageUri, setImageUri] = useState<string | undefined>(editingItem?.imageUrl);
  const [name, setName] = useState(editingItem?.name ?? "New Wardrobe Item");
  const [subcategory, setSubcategory] = useState(editingItem?.subcategory ?? "Button Down");
  const [colorFamily, setColorFamily] = useState<ColorFamily>(editingItem?.colorFamily ?? "sage");
  const [category, setCategory] = useState<ClothingCategory>(editingItem?.category ?? "top");
  const [tone, setTone] = useState<Tone>(editingItem?.tone ?? "medium");
  const [saturation, setSaturation] = useState<Saturation>(editingItem?.saturation ?? "muted");
  const [formality, setFormality] = useState<Formality>(editingItem?.formality ?? "smart-casual");
  const [pattern, setPattern] = useState<Pattern>(editingItem?.pattern ?? "solid");
  const [isSaving, setIsSaving] = useState(false);
  const [detectedColor, setDetectedColor] = useState<DetectedGarmentColor>();
  const [isDetectingColor, setIsDetectingColor] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Photos permission needed", "Allow photo access to import clothes into your wardrobe.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.9,
    });
    if (!result.canceled) {
      await useSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Camera permission needed", "Allow camera access to photograph clothes.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.9,
    });
    if (!result.canceled) {
      await useSelectedImage(result.assets[0].uri);
    }
  };

  const useSelectedImage = async (uri: string) => {
    setImageUri(uri);
    setIsDetectingColor(true);
    try {
      const detection = await detectGarmentColor(uri);
      setDetectedColor(detection);
      setColorFamily(detection.colorFamily);
      setTone(detection.tone);
      setSaturation(detection.saturation);
    } catch (error) {
      console.warn("Could not detect garment color", error);
      Alert.alert("Color detection failed", "The photo was added, but color can be corrected manually.");
    } finally {
      setIsDetectingColor(false);
    }
  };

  const saveItem = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert("Name required", "Add a clear item name before saving.");
      return;
    }

    setIsSaving(true);
    try {
      const id = editingItem?.id ?? `${trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now()}`;
      const savedImage = imageUri && imageUri !== editingItem?.imageUrl ? await persistItemImage(imageUri, id) : imageUri;
      onSave({
        ...editingItem,
        id,
        name: trimmedName,
        category,
        subcategory: subcategory.trim() || undefined,
        colorName: label(colorFamily),
        colorFamily,
        tone,
        saturation,
        formality,
        pattern,
        seasons: editingItem?.seasons ?? ["all-season"],
        imageUrl: savedImage,
        confidence: detectedColor?.confidence ?? editingItem?.confidence ?? "medium",
        notes:
          editingItem?.notes ??
          (detectedColor
            ? `Color detected from photo as ${detectedColor.colorName} (${detectedColor.confidence} confidence).`
            : "Added from your iPhone. Color and clothing details are editable metadata."),
        tags: editingItem?.tags ?? ["user-added"],
      });
    } catch (error) {
      Alert.alert("Could not save item", error instanceof Error ? error.message : "Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.screen}>
        <AppHeader title={editingItem ? "Edit Item" : "Add Item"} leftIcon="close" onLeftPress={onClose} />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <SegmentedControl
            options={["photo", "link", "manual"]}
            value={mode}
            onChange={(value) => {
              setMode(value);
              if (value === "link") onOpenLink();
            }}
          />
          <View style={styles.photoCard}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.photo} />
            ) : (
              <View style={styles.garment}>
                <Ionicons name="shirt-outline" size={82} color={colors.cream} />
                <Text style={styles.photoHint}>Photograph or import a clothing item</Text>
              </View>
            )}
            <View style={styles.photoActions}>
              <Pressable style={styles.photoButton} onPress={takePhoto}>
                <Ionicons name="camera-outline" size={18} color={colors.background} />
                <Text style={styles.photoButtonText}>Camera</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={pickImage}>
                <Ionicons name="images-outline" size={18} color={colors.cream} />
                <Text style={styles.secondaryButtonText}>Library</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.panel}>
            <Text style={styles.kicker}>Item Details</Text>
            <TextInput value={name} onChangeText={setName} placeholder="Item name" placeholderTextColor={colors.textDim} style={styles.input} />
            <TextInput
              value={subcategory}
              onChangeText={setSubcategory}
              placeholder="Subcategory"
              placeholderTextColor={colors.textDim}
              style={styles.input}
            />
            <View style={styles.chipRow}>
              {categoryOptions.map((option) => (
                <FilterChip key={option} label={label(option)} active={category === option} onPress={() => setCategory(option)} />
              ))}
            </View>
          </View>
          <View style={styles.panel}>
            <Text style={styles.kicker}>Color</Text>
            <View style={styles.colorRow}>
              <ColorSwatch color={colorFamily} size={52} selected />
              <View>
                <Text style={styles.title}>{label(colorFamily)}</Text>
                <Text style={styles.muted}>
                  {isDetectingColor
                    ? "Detecting from photo..."
                    : detectedColor
                      ? `Detected ${detectedColor.confidence} confidence · ${detectedColor.hex}`
                      : "Detected from photo or manually corrected"}
                </Text>
              </View>
            </View>
            <ColorSwatchRow colors={colorOptions} selected={colorFamily} />
            <View style={styles.chipRow}>
              {colorOptions.map((option) => (
                <FilterChip key={option} label={label(option)} active={colorFamily === option} onPress={() => setColorFamily(option)} />
              ))}
            </View>
          </View>
          <View style={styles.panel}>
            <Text style={styles.kicker}>Harmony Metadata</Text>
            <SegmentedControl options={["light", "medium", "dark"]} value={tone} onChange={setTone} />
            <SegmentedControl options={["neutral", "muted", "rich", "bright"]} value={saturation} onChange={setSaturation} />
            <View style={styles.chipRow}>
              {formalityOptions.map((option) => (
                <FilterChip key={option} label={label(option)} active={formality === option} onPress={() => setFormality(option)} />
              ))}
            </View>
            <View style={styles.chipRow}>
              {patternOptions.map((option) => (
                <FilterChip key={option} label={label(option)} active={pattern === option} onPress={() => setPattern(option)} />
              ))}
            </View>
          </View>
          <PrimaryButton label={isSaving ? "Saving..." : editingItem ? "Save Changes" : "Save Item"} icon="checkmark" onPress={saveItem} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function label(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    gap: 13,
    paddingBottom: 34,
  },
  photoCard: {
    height: 292,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.productMat,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  garment: {
    width: 184,
    height: 214,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9EA56F",
    borderWidth: 1,
    borderColor: "rgba(247,242,232,0.28)",
  },
  photoHint: {
    color: colors.cream,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 12,
    textAlign: "center",
    paddingHorizontal: 18,
  },
  photoActions: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: "row",
    gap: 10,
  },
  photoButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 23,
    backgroundColor: colors.gold,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  photoButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 23,
    backgroundColor: "rgba(5,11,14,0.78)",
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  secondaryButtonText: {
    color: colors.cream,
    fontSize: 14,
    fontWeight: "800",
  },
  panel: {
    gap: 13,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  kicker: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  detectedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  smallIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceElevated,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  muted: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  input: {
    minHeight: 48,
    borderRadius: 10,
    paddingHorizontal: 14,
    color: colors.text,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});
