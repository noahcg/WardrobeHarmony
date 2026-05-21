import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ColorSwatch } from "./ColorSwatch";
import { ClothingItem } from "../models/clothing";
import { colorFamilyHex, colors } from "../theme/colors";

type Props = {
  item: ClothingItem;
  selected?: boolean;
  compact?: boolean;
  onPress?: () => void;
};

const categoryIcon: Record<ClothingItem["category"], keyof typeof Ionicons.glyphMap> = {
  top: "shirt-outline",
  bottom: "reorder-four-outline",
  shoes: "footsteps-outline",
  outerwear: "body-outline",
  accessory: "watch-outline",
};

export function ClothingCard({ item, selected = false, compact = false, onPress }: Props) {
  return (
    <Pressable style={[styles.card, selected && styles.selected, compact && styles.compactCard]} onPress={onPress}>
      <View style={[styles.image, { backgroundColor: colorFamilyHex[item.colorFamily] }]}>
        <View style={styles.sheen} />
        <Ionicons name={categoryIcon[item.category]} size={compact ? 28 : 38} color="rgba(247,242,232,0.88)" />
      </View>
      <View style={styles.meta}>
        <Text numberOfLines={2} style={styles.name}>
          {item.name}
        </Text>
        <View style={styles.detailRow}>
          <ColorSwatch color={item.colorFamily} size={14} />
          <Text numberOfLines={1} style={styles.detail}>
            {item.colorName ?? item.colorFamily}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 188,
    borderRadius: 20,
    padding: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compactCard: {
    minHeight: 142,
  },
  selected: {
    borderColor: colors.gold,
    backgroundColor: "#12180F",
  },
  image: {
    height: 108,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  sheen: {
    position: "absolute",
    top: 0,
    right: -25,
    width: 80,
    height: 140,
    transform: [{ rotate: "22deg" }],
    backgroundColor: "rgba(255,255,255,0.09)",
  },
  meta: {
    gap: 7,
    paddingTop: 10,
  },
  name: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detail: {
    color: colors.textMuted,
    fontSize: 12,
    flex: 1,
  },
});
