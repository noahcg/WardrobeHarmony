import { ScrollView, StyleSheet, Text, View } from "react-native";

import { ClothingCard } from "./ClothingCard";
import { ClothingItem } from "../models/clothing";
import { colors } from "../theme/colors";

type Props = {
  swaps: { item: ClothingItem; delta: number }[];
  onSelect: (item: ClothingItem) => void;
};

export function SuggestedSwaps({ swaps, onSelect }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Suggested swaps</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {swaps.map((swap) => (
          <View key={swap.item.id} style={styles.item}>
            <ClothingCard item={swap.item} compact onPress={() => onSelect(swap.item)} />
            <Text style={styles.delta}>+{swap.delta} harmony</Text>
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
    gap: 7,
  },
  delta: {
    color: colors.sage,
    fontSize: 12,
    fontWeight: "800",
  },
});
