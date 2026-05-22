import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "../components/EmptyState";
import { ClothingCategory, ClothingItem } from "../models/clothing";
import { colorFamilyHex, colors } from "../theme/colors";

type Filter = "all" | ClothingCategory;

type Props = {
  wardrobe: ClothingItem[];
  onOpenItem: (item: ClothingItem) => void;
  onBuild: (items: ClothingItem[]) => void;
};

const filters: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "top", label: "Tops" },
  { key: "bottom", label: "Bottoms" },
  { key: "outerwear", label: "Outerwear" },
];

export function ClosetScreen({ wardrobe, onOpenItem, onBuild }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    return wardrobe.filter((item) => {
      const matchesFilter = filter === "all" || item.category === filter;
      const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [filter, query, wardrobe]);

  const starterOutfit = [
    wardrobe.find((item) => item.category === "top"),
    wardrobe.find((item) => item.category === "bottom"),
    wardrobe.find((item) => item.category === "shoes"),
  ].filter(Boolean) as ClothingItem[];

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.screen}>
        <Text style={styles.title}>Closet</Text>

        <View style={styles.search}>
          <Ionicons name="search-outline" size={15} color={colors.textMuted} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Search" placeholderTextColor={colors.textDim} style={styles.input} />
        </View>

        <View style={styles.filterRow}>
          <View style={styles.filters}>
            {filters.map((entry) => (
              <Pressable key={entry.key} style={[styles.chip, filter === entry.key && styles.activeChip]} onPress={() => setFilter(entry.key)}>
                <Text style={[styles.chipText, filter === entry.key && styles.activeChipText]}>{entry.label}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.filterIcon} onPress={() => onBuild(starterOutfit)}>
            <Ionicons name="filter-outline" size={22} color={colors.cream} />
          </Pressable>
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => <ClosetGridItem item={item} onPress={() => onOpenItem(item)} />}
          ListEmptyComponent={<EmptyState title="No items found" message="Adjust the filter or add a new clothing item to your wardrobe." />}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

function ClosetGridItem({ item, onPress }: { item: ClothingItem; onPress: () => void }) {
  return (
    <Pressable style={styles.itemWrap} onPress={onPress}>
      <View style={styles.imageCard}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.photo} />
        ) : (
          <View style={[styles.garmentShape, { backgroundColor: colorFamilyHex[item.colorFamily] }, garmentShapeStyle(item.category)]}>
            <Ionicons name={iconFor(item.category)} size={item.category === "shoes" ? 24 : 32} color="rgba(247,242,232,0.82)" />
          </View>
        )}
      </View>
      <Text numberOfLines={1} style={styles.itemName}>
        {shortName(item)}
      </Text>
      <Text numberOfLines={1} style={styles.itemColor}>
        {item.colorName ?? label(item.colorFamily)}
      </Text>
    </Pressable>
  );
}

function iconFor(category: ClothingCategory) {
  const icons: Record<ClothingCategory, keyof typeof Ionicons.glyphMap> = {
    top: "shirt-outline",
    bottom: "reorder-four-outline",
    shoes: "footsteps-outline",
    outerwear: "body-outline",
    accessory: "watch-outline",
  };
  return icons[category];
}

function shortName(item: ClothingItem) {
  return item.subcategory || item.name.replace(/\b(Sage|Green|Navy|White|Gray|Cream|Brown|Blue|Black|Tan|Burgundy)\b/gi, "").trim() || item.name;
}

function label(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function garmentShapeStyle(category: ClothingCategory) {
  if (category === "bottom") return styles.garmentBottom;
  if (category === "shoes") return styles.garmentShoe;
  if (category === "accessory") return styles.garmentAccessory;
  return null;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    backgroundColor: colors.background,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    lineHeight: 31,
    fontWeight: "800",
    marginBottom: 12,
  },
  search: {
    height: 37,
    borderRadius: 8,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "rgba(191,169,124,0.08)",
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    paddingVertical: 0,
  },
  filterRow: {
    marginTop: 12,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  filters: {
    flexDirection: "row",
    gap: 7,
    flexShrink: 1,
  },
  chip: {
    height: 27,
    paddingHorizontal: 13,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "rgba(191,169,124,0.08)",
  },
  activeChip: {
    backgroundColor: colors.cream,
    borderColor: colors.cream,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
  },
  activeChipText: {
    color: colors.background,
  },
  filterIcon: {
    width: 31,
    height: 31,
    alignItems: "center",
    justifyContent: "center",
  },
  grid: {
    paddingBottom: 18,
  },
  gridRow: {
    gap: 13,
    marginBottom: 18,
  },
  itemWrap: {
    flex: 1,
    maxWidth: "31.8%",
  },
  imageCard: {
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: colors.productMat,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  photo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  garmentShape: {
    width: "72%",
    height: "78%",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.26)",
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
  },
  garmentBottom: {
    width: "48%",
    height: "82%",
    borderRadius: 11,
  },
  garmentShoe: {
    width: "78%",
    height: "42%",
    borderRadius: 15,
  },
  garmentAccessory: {
    width: "58%",
    height: "58%",
    borderRadius: 22,
  },
  itemName: {
    color: colors.text,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
    marginTop: 6,
  },
  itemColor: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
  },
});
