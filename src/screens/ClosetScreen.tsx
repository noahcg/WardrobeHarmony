import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ClothingCard } from "../components/ClothingCard";
import { FilterChip } from "../components/FilterChip";
import { mockWardrobe } from "../data/mockWardrobe";
import { ClothingCategory, ClothingItem } from "../models/clothing";
import { colors } from "../theme/colors";

type Filter = "all" | ClothingCategory;

type Props = {
  onOpenItem: (item: ClothingItem) => void;
  onBuild: (items: ClothingItem[]) => void;
};

const filters: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "top", label: "Tops" },
  { key: "bottom", label: "Bottoms" },
  { key: "outerwear", label: "Outerwear" },
];

export function ClosetScreen({ onOpenItem, onBuild }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    return mockWardrobe.filter((item) => {
      const matchesFilter = filter === "all" || item.category === filter;
      const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Closet</Text>
        <Pressable style={styles.iconButton} onPress={() => onBuild([mockWardrobe[0], mockWardrobe[1], mockWardrobe[8]])}>
          <Ionicons name="options-outline" size={20} color={colors.text} />
        </Pressable>
      </View>
      <View style={styles.search}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search wardrobe"
          placeholderTextColor={colors.textDim}
          style={styles.input}
        />
      </View>
      <View style={styles.filters}>
        {filters.map((entry) => (
          <FilterChip key={entry.key} label={entry.label} active={filter === entry.key} onPress={() => setFilter(entry.key)} />
        ))}
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => <ClothingCard item={item} onPress={() => onOpenItem(item)} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 18,
    gap: 14,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  grid: {
    gap: 12,
    paddingBottom: 20,
  },
  gridRow: {
    gap: 12,
    marginBottom: 12,
  },
});
