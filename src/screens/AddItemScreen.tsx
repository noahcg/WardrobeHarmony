import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppHeader } from "../components/AppHeader";
import { ColorSwatch } from "../components/ColorSwatch";
import { FilterChip } from "../components/FilterChip";
import { SegmentedControl } from "../components/SegmentedControl";
import { SelectField, SelectOption } from "../components/SelectField";
import { detectGarmentColor, DetectedGarmentColor } from "../lib/colorExtraction";
import { persistItemImage } from "../storage/wardrobeStore";
import { ClothingCategory, ClothingItem, ColorFamily, Formality, Pattern, Saturation, Season, Tone } from "../models/clothing";
import { colors } from "../theme/colors";

type Props = {
  editingItem?: ClothingItem;
  onOpenLink: () => void;
  onClose: () => void;
  onSave: (item: ClothingItem) => void;
};

const colorOptions: SelectOption<ColorFamily>[] = (
  ["black", "white", "gray", "navy", "blue", "brown", "tan", "cream", "olive", "sage", "burgundy"] as ColorFamily[]
).map((value) => ({
  value,
  label: colorFamilyLabel(value),
  leading: <ColorSwatch color={value} size={22} />,
}));

const categoryOptions: SelectOption<ClothingCategory>[] = [
  { value: "top", label: "Tops" },
  { value: "bottom", label: "Bottoms" },
  { value: "shoes", label: "Shoes" },
  { value: "outerwear", label: "Outerwear" },
  { value: "accessory", label: "Accessories" },
];

const toneOptions: SelectOption<Tone>[] = [
  { value: "light", label: "Light" },
  { value: "medium", label: "Medium" },
  { value: "dark", label: "Dark" },
];

const saturationOptions: SelectOption<Saturation>[] = [
  { value: "neutral", label: "Neutral" },
  { value: "muted", label: "Muted" },
  { value: "rich", label: "Rich" },
  { value: "bright", label: "Bright" },
];

const formalityOptions: SelectOption<Formality>[] = [
  { value: "casual", label: "Casual" },
  { value: "smart-casual", label: "Smart-Casual" },
  { value: "business", label: "Business" },
  { value: "formal", label: "Formal" },
];

const patternOptions: SelectOption<Pattern>[] = [
  { value: "solid", label: "Solid" },
  { value: "stripe", label: "Stripe" },
  { value: "plaid", label: "Plaid" },
  { value: "check", label: "Check" },
  { value: "graphic", label: "Graphic" },
  { value: "texture", label: "Texture" },
];

const seasonOptions: { value: Season; label: string }[] = [
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "fall", label: "Fall" },
  { value: "winter", label: "Winter" },
  { value: "all-season", label: "All-Season" },
];

export function AddItemScreen({ editingItem, onOpenLink, onClose, onSave }: Props) {
  const [mode, setMode] = useState<"photo" | "link" | "manual">("photo");
  const [imageUri, setImageUri] = useState<string | undefined>(editingItem?.imageUrl);
  const [name, setName] = useState(editingItem?.name ?? "");
  const [colorFamily, setColorFamily] = useState<ColorFamily>(editingItem?.colorFamily ?? "sage");
  const [category, setCategory] = useState<ClothingCategory>(editingItem?.category ?? "top");
  const [tone, setTone] = useState<Tone>(editingItem?.tone ?? "medium");
  const [saturation, setSaturation] = useState<Saturation>(editingItem?.saturation ?? "muted");
  const [formality, setFormality] = useState<Formality>(editingItem?.formality ?? "smart-casual");
  const [pattern, setPattern] = useState<Pattern>(editingItem?.pattern ?? "solid");
  const [seasons, setSeasons] = useState<Season[]>(editingItem?.seasons ?? ["summer"]);
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

  const choosePhotoSource = () => {
    Alert.alert("Add photo", "Capture a new photo or import one from your library.", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Library", onPress: pickImage },
      { text: "Cancel", style: "cancel" },
    ]);
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

  const toggleSeason = (season: Season) => {
    setSeasons((current) =>
      current.includes(season) ? current.filter((value) => value !== season) : [...current, season],
    );
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
        subcategory: editingItem?.subcategory,
        colorName: colorFamilyLabel(colorFamily),
        colorFamily,
        tone,
        saturation,
        formality,
        pattern,
        seasons: seasons.length ? seasons : ["all-season"],
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
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
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
              <View style={styles.placeholder}>
                <Ionicons name="shirt-outline" size={72} color={colors.sageDark} />
                <Text style={styles.placeholderText}>Photograph or import a clothing item</Text>
              </View>
            )}
            <Pressable style={styles.cameraFab} onPress={choosePhotoSource}>
              <Ionicons name="camera" size={20} color={colors.cream} />
            </Pressable>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Sage Green Shirt"
              placeholderTextColor={colors.textDim}
              style={styles.input}
            />
          </View>

          <SelectField label="Category" value={category} options={categoryOptions} onChange={setCategory} />

          <View style={styles.grid}>
            <View style={styles.col}>
              <SelectField label="Color Family" value={colorFamily} options={colorOptions} onChange={setColorFamily} />
              {isDetectingColor ? <Text style={styles.hint}>Detecting from photo…</Text> : null}
            </View>
            <View style={styles.col}>
              <SelectField label="Tone" value={tone} options={toneOptions} onChange={setTone} />
            </View>
          </View>

          <View style={styles.grid}>
            <View style={styles.col}>
              <SelectField label="Saturation" value={saturation} options={saturationOptions} onChange={setSaturation} />
            </View>
            <View style={styles.col}>
              <SelectField label="Formality" value={formality} options={formalityOptions} onChange={setFormality} />
            </View>
          </View>

          <SelectField label="Pattern" value={pattern} options={patternOptions} onChange={setPattern} />

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Season</Text>
            <View style={styles.chipRow}>
              {seasonOptions.map((option) => (
                <FilterChip
                  key={option.value}
                  label={option.label}
                  active={seasons.includes(option.value)}
                  onPress={() => toggleSeason(option.value)}
                />
              ))}
            </View>
          </View>

          <Pressable style={styles.saveButton} onPress={saveItem} disabled={isSaving}>
            <Text style={styles.saveLabel}>{isSaving ? "Saving…" : editingItem ? "Save Changes" : "Save Item"}</Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function colorFamilyLabel(value: ColorFamily) {
  if (value === "sage") return "Sage Green";
  return value.charAt(0).toUpperCase() + value.slice(1);
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
    gap: 16,
    paddingBottom: 34,
  },
  photoCard: {
    height: 230,
    borderRadius: 14,
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
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  placeholderText: {
    color: colors.sageDark,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 12,
    textAlign: "center",
  },
  cameraFab: {
    position: "absolute",
    right: 14,
    bottom: 14,
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(3,9,12,0.82)",
  },
  fieldGroup: {
    gap: 7,
  },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    minHeight: 50,
    borderRadius: 10,
    paddingHorizontal: 14,
    color: colors.text,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    gap: 12,
  },
  col: {
    flex: 1,
    gap: 7,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  saveButton: {
    minHeight: 54,
    borderRadius: 13,
    backgroundColor: colors.sage,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  saveLabel: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "800",
  },
});
