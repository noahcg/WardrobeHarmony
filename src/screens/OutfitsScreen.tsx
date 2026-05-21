import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { EmptyState } from "../components/EmptyState";
import { OutfitCard } from "../components/OutfitCard";
import { SegmentedControl } from "../components/SegmentedControl";
import { evaluateCompatibility } from "../lib/matchingEngine";
import { ClothingItem } from "../models/clothing";
import { Outfit, SavedOutfit } from "../models/outfit";
import { colors } from "../theme/colors";

type Props = {
  wardrobe: ClothingItem[];
  savedOutfits: SavedOutfit[];
  onOpenBuilder: () => void;
  onOpenOutfit: (outfit: SavedOutfit) => void;
};

export function OutfitsScreen({ wardrobe, savedOutfits, onOpenBuilder, onOpenOutfit }: Props) {
  const [filter, setFilter] = useState<"all" | "favorites" | "recent">("all");
  const outfits = useMemo<Outfit[]>(() => {
    return savedOutfits
      .filter((saved) => (filter === "favorites" ? saved.favorite : true))
      .sort((a, b) => (filter === "recent" ? b.updatedAt.localeCompare(a.updatedAt) : b.createdAt.localeCompare(a.createdAt)))
      .map((saved) => {
        const items = saved.itemIds.map((id) => wardrobe.find((item) => item.id === id)).filter(Boolean) as ClothingItem[];
        return { ...saved, items };
      })
      .filter((set) => set.items.length > 0)
      .map((set) => {
        const result = evaluateCompatibility(set.items);
        return {
          ...set,
          score: result.score,
          rating: result.rating,
          reasons: result.reasons,
          warnings: result.warnings,
        };
      });
  }, [filter, savedOutfits, wardrobe]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Outfits</Text>
        <Pressable style={styles.addButton} onPress={onOpenBuilder}>
          <Ionicons name="add" size={24} color={colors.background} />
        </Pressable>
      </View>
      <SegmentedControl options={["all", "favorites", "recent"]} value={filter} onChange={setFilter} />
      <FlatList
        data={outfits}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => {
          const saved = savedOutfits.find((outfit) => outfit.id === item.id);
          return <OutfitCard outfit={item} onPress={() => (saved ? onOpenOutfit(saved) : onOpenBuilder())} />;
        }}
        ListEmptyComponent={<EmptyState title="No saved outfits" message="Build and save an outfit to start your outfit library." />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: 18, gap: 14 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { color: colors.text, fontSize: 30, fontWeight: "800" },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  grid: { gap: 12, paddingBottom: 28 },
  row: { gap: 12, marginBottom: 12 },
});
