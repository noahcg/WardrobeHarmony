import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

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
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.photo} />
        ) : (
          <>
            <View style={styles.productMat} />
            <View style={[styles.garmentShadow, item.category === "shoes" && styles.shoeShadow]} />
            <View
              style={[
                styles.garment,
                { backgroundColor: colorFamilyHex[item.colorFamily] },
                item.category === "bottom" && styles.pants,
                item.category === "shoes" && styles.shoe,
                item.category === "outerwear" && styles.outerwear,
              ]}
            >
              <Ionicons name={categoryIcon[item.category]} size={compact ? 25 : 34} color="rgba(247,242,232,0.78)" />
            </View>
          </>
        )}
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
    minHeight: 178,
    borderRadius: 18,
    padding: 7,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  compactCard: {
    minHeight: 132,
  },
  selected: {
    borderColor: colors.gold,
    backgroundColor: "#12180F",
  },
  image: {
    height: 114,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  productMat: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.productMat,
  },
  garmentShadow: {
    position: "absolute",
    width: 78,
    height: 88,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.22)",
    transform: [{ translateY: 7 }],
  },
  shoeShadow: {
    width: 92,
    height: 36,
    borderRadius: 18,
  },
  garment: {
    width: 78,
    height: 88,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  outerwear: {
    width: 84,
    height: 94,
  },
  pants: {
    width: 58,
    height: 98,
    borderRadius: 16,
  },
  shoe: {
    width: 96,
    height: 42,
    borderRadius: 20,
  },
  meta: {
    gap: 7,
    paddingTop: 9,
    paddingHorizontal: 2,
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
