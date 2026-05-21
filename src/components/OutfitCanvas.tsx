import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, View } from "react-native";

import { ClothingItem } from "../models/clothing";
import { colorFamilyHex, colors } from "../theme/colors";

type Props = {
  items: ClothingItem[];
};

const positions: Record<ClothingItem["category"], object> = {
  outerwear: { top: 18, left: 32, transform: [{ rotate: "-9deg" }] },
  top: { top: 34, right: 46, transform: [{ rotate: "8deg" }] },
  bottom: { bottom: 40, left: 70, transform: [{ rotate: "-5deg" }] },
  shoes: { bottom: 26, right: 44, transform: [{ rotate: "12deg" }] },
  accessory: { top: 146, right: 26, transform: [{ rotate: "-15deg" }] },
};

const icon: Record<ClothingItem["category"], keyof typeof Ionicons.glyphMap> = {
  top: "shirt-outline",
  bottom: "reorder-four-outline",
  shoes: "footsteps-outline",
  outerwear: "body-outline",
  accessory: "watch-outline",
};

export function OutfitCanvas({ items }: Props) {
  return (
    <View style={styles.canvas}>
      <View style={styles.ring} />
      {items.map((item) => (
        <View
          key={item.id}
          style={[
            styles.piece,
            positions[item.category],
            { backgroundColor: colorFamilyHex[item.colorFamily] },
            item.category === "bottom" && styles.bottom,
            item.category === "shoes" && styles.shoes,
            item.category === "accessory" && styles.accessory,
          ]}
        >
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.photo} />
          ) : (
            <Ionicons name={icon[item.category]} size={item.category === "accessory" ? 24 : 40} color="rgba(247,242,232,0.88)" />
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    height: 310,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    overflow: "hidden",
  },
  ring: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: "rgba(199,162,74,0.2)",
    top: 35,
    left: 54,
  },
  piece: {
    position: "absolute",
    width: 108,
    height: 118,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(247,242,232,0.32)",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bottom: {
    width: 92,
    height: 142,
  },
  shoes: {
    width: 96,
    height: 72,
    borderRadius: 22,
  },
  accessory: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
});
