import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, View } from "react-native";

import { ClothingItem } from "../models/clothing";
import { colorFamilyHex, colors } from "../theme/colors";

type Props = {
  items: ClothingItem[];
};

const positions: Record<ClothingItem["category"], object> = {
  outerwear: { top: 18, left: 28, transform: [{ rotate: "-5deg" }] },
  top: { top: 28, right: 42, transform: [{ rotate: "5deg" }] },
  bottom: { bottom: 38, left: 76, transform: [{ rotate: "-3deg" }] },
  shoes: { bottom: 26, right: 42, transform: [{ rotate: "-5deg" }] },
  accessory: { top: 118, right: 24, transform: [{ rotate: "4deg" }] },
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
      <View style={styles.vignette} />
      {items.map((item) => (
        <View
          key={item.id}
          style={[
            styles.piece,
            positions[item.category],
            { backgroundColor: item.imageUrl ? colorFamilyHex[item.colorFamily] : colors.productMat },
            item.category === "bottom" && styles.bottom,
            item.category === "shoes" && styles.shoes,
            item.category === "accessory" && styles.accessory,
          ]}
        >
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.photo} />
          ) : (
            <View
              style={[
                styles.garment,
                { backgroundColor: colorFamilyHex[item.colorFamily] },
                item.category === "bottom" && styles.garmentBottom,
                item.category === "shoes" && styles.garmentShoe,
                item.category === "accessory" && styles.garmentAccessory,
              ]}
            >
              <Ionicons name={icon[item.category]} size={item.category === "accessory" ? 22 : 38} color="rgba(247,242,232,0.82)" />
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    height: 310,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#050B0E",
    overflow: "hidden",
  },
  vignette: {
    position: "absolute",
    left: 18,
    right: 18,
    top: 18,
    bottom: 18,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.025)",
    borderWidth: 1,
    borderColor: "rgba(191,169,124,0.14)",
  },
  piece: {
    position: "absolute",
    width: 116,
    height: 128,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    shadowColor: "#000",
    shadowOpacity: 0.42,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bottom: {
    width: 86,
    height: 148,
  },
  shoes: {
    width: 104,
    height: 60,
    borderRadius: 18,
  },
  accessory: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  garment: {
    width: 78,
    height: 92,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  garmentBottom: {
    width: 52,
    height: 108,
    borderRadius: 15,
  },
  garmentShoe: {
    width: 82,
    height: 34,
    borderRadius: 17,
  },
  garmentAccessory: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
});
