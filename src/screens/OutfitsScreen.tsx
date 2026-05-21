import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { OutfitCard } from "../components/OutfitCard";
import { SegmentedControl } from "../components/SegmentedControl";
import { mockWardrobe } from "../data/mockWardrobe";
import { evaluateCompatibility } from "../lib/matchingEngine";
import { Outfit } from "../models/outfit";
import { colors } from "../theme/colors";

type Props = {
  onOpenBuilder: () => void;
};

export function OutfitsScreen({ onOpenBuilder }: Props) {
  const [filter, setFilter] = useState<"all" | "favorites" | "recent">("all");
  const outfits = useMemo<Outfit[]>(() => {
    const sets = [
      { id: "sage-office", name: "Soft Office", items: [mockWardrobe[0], mockWardrobe[1], mockWardrobe[7]] },
      { id: "cream-denim", name: "Cream Denim", items: [mockWardrobe[6], mockWardrobe[5], mockWardrobe[8]] },
      { id: "blazer-blue", name: "Navy Blazer", items: [mockWardrobe[10], mockWardrobe[1], mockWardrobe[13], mockWardrobe[7]] },
      { id: "fall-layer", name: "Fall Layer", items: [mockWardrobe[9], mockWardrobe[11], mockWardrobe[12]] },
    ];
    return sets.map((set) => {
      const result = evaluateCompatibility(set.items);
      return { ...set, score: result.score, rating: result.rating, reasons: result.reasons, warnings: result.warnings };
    });
  }, []);

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
