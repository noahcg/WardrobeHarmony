import { ScrollView, StyleSheet, Text, View } from "react-native";

import { ClothingCard } from "./ClothingCard";
import { ClothingItem } from "../models/clothing";
import { colors } from "../theme/colors";

type Props = {
  items: ClothingItem[];
  selectedItems: ClothingItem[];
  onToggle: (item: ClothingItem) => void;
};

export function ItemPicker({ items, selectedItems, onToggle }: Props) {
  const selectedIds = new Set(selectedItems.map((item) => item.id));
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Choose wardrobe pieces</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {items.map((item) => (
          <View key={item.id} style={styles.item}>
            <ClothingCard item={item} compact selected={selectedIds.has(item.id)} onPress={() => onToggle(item)} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  row: {
    gap: 12,
    paddingRight: 20,
  },
  item: {
    width: 144,
  },
});
