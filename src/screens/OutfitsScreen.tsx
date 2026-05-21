import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { OutfitCard } from "../components/OutfitCard";
import { SegmentedControl } from "../components/SegmentedControl";
import { evaluateCompatibility } from "../lib/matchingEngine";
import { ClothingItem } from "../models/clothing";
import { Outfit } from "../models/outfit";
import { colors } from "../theme/colors";

type Props = {
  wardrobe: ClothingItem[];
  onOpenBuilder: () => void;
};

export function OutfitsScreen({ wardrobe, onOpenBuilder }: Props) {
  const [filter, setFilter] = useState<"all" | "favorites" | "recent">("all");
  const outfits = useMemo<Outfit[]>(() => {
    const tops = wardrobe.filter((item) => item.category === "top");
    const bottoms = wardrobe.filter((item) => item.category === "bottom");
    const shoes = wardrobe.filter((item) => item.category === "shoes");
    const outerwear = wardrobe.filter((item) => item.category === "outerwear");
    const sets = [
      { id: "first-saved", name: "Saved Foundation", items: [tops[0], bottoms[0], shoes[0]].filter(Boolean) as ClothingItem[] },
      { id: "soft-layer", name: "Soft Layer", items: [tops[1] ?? tops[0], bottoms[0], outerwear[0], shoes[0]].filter(Boolean) as ClothingItem[] },
      { id: "weekend", name: "Weekend Mix", items: [tops[2] ?? tops[0], bottoms[1] ?? bottoms[0], shoes[1] ?? shoes[0]].filter(Boolean) as ClothingItem[] },
      { id: "polished", name: "Polished Neutral", items: [tops[0], bottoms[0], outerwear[1] ?? outerwear[0], shoes[0]].filter(Boolean) as ClothingItem[] },
    ].filter((set) => set.items.length > 0);
    return sets.map((set) => {
      const result = evaluateCompatibility(set.items);
      return { ...set, score: result.score, rating: result.rating, reasons: result.reasons, warnings: result.warnings };
    });
  }, [wardrobe]);

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
        renderItem={({ item }) => <OutfitCard outfit={item} onPress={onOpenBuilder} />}
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
