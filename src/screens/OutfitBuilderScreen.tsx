import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconActionBar } from "../components/IconActionBar";
import { evaluateCompatibility, findSuggestedSwaps } from "../lib/matchingEngine";
import { ClothingItem } from "../models/clothing";
import { colorFamilyHex, colors } from "../theme/colors";

type Props = {
  wardrobe: ClothingItem[];
  initialItems: ClothingItem[];
  onClose: () => void;
  onSaveOutfit: (items: ClothingItem[]) => void;
  onOpenColorGuide: (item: ClothingItem) => void;
};

export function OutfitBuilderScreen({ wardrobe, initialItems, onClose, onSaveOutfit, onOpenColorGuide }: Props) {
  const [items, setItems] = useState<ClothingItem[]>(initialItems);
  const result = useMemo(() => evaluateCompatibility(items), [items]);
  const swaps = useMemo(() => findSuggestedSwaps(items, wardrobe), [items, wardrobe]);

  const selectSwap = (item: ClothingItem) => {
    setItems((current) => {
      const replaceIndex = current.findIndex((selected) => selected.category === item.category);
      if (replaceIndex === -1) return [...current, item];
      return current.map((selected, index) => (index === replaceIndex ? item : selected));
    });
  };

  const saveOutfit = () => {
    if (items.length < 2) {
      Alert.alert("Add more items", "Choose at least two pieces before saving an outfit.");
      return;
    }
    onSaveOutfit(items);
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.cream} />
          </Pressable>
          <Text style={styles.headerTitle}>Outfit Builder</Text>
          <Pressable style={styles.saveButton} onPress={saveOutfit}>
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
        </View>

        <ScrollView bounces={false} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ReferenceFlatLay items={items} />
          <View style={styles.actionStrip}>
            <IconActionBar
              actions={[
                { icon: "bag-add-outline", onPress: () => setItems((current) => [...current, wardrobe.find((item) => !current.some((selected) => selected.id === item.id)) ?? current[0]].filter(Boolean)) },
                { icon: "color-palette-outline", onPress: () => items[0] && onOpenColorGuide(items[0]) },
                { icon: "shuffle-outline", onPress: () => setItems(getShuffleOutfit(wardrobe)) },
                { icon: "heart-outline", onPress: saveOutfit },
              ]}
            />
          </View>

          <View style={styles.matchCard}>
            <View style={styles.matchHeader}>
              <Text style={styles.matchTitle}>{result.rating} Match</Text>
              <View style={styles.scoreRing}>
                <Text style={styles.scoreText}>{result.score}</Text>
              </View>
            </View>

            <Text style={styles.whyTitle}>Why it works</Text>
            {[...result.reasons, ...result.warnings].slice(0, 3).map((reason) => (
              <Text key={reason} style={styles.reason}>
                • {reason}
              </Text>
            ))}
          </View>

          <View style={styles.swapsSection}>
            <Text style={styles.swapsTitle}>Suggested swaps</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.swapsRow}>
              {swaps.map((swap) => (
                <Pressable key={swap.item.id} style={styles.swapCard} onPress={() => selectSwap(swap.item)}>
                  {swap.item.imageUrl ? (
                    <Image source={{ uri: swap.item.imageUrl }} style={styles.photo} />
                  ) : (
                    <View style={[styles.swapGarment, { backgroundColor: colorFamilyHex[swap.item.colorFamily] }]}>
                      <Ionicons name={iconFor(swap.item.category)} size={30} color="rgba(247,242,232,0.82)" />
                    </View>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function ReferenceFlatLay({ items }: { items: ClothingItem[] }) {
  const outerwear = items.find((item) => item.category === "outerwear") ?? items.find((item) => item.category === "top");
  const top = items.find((item) => item.category === "top");
  const bottom = items.find((item) => item.category === "bottom");
  const shoes = items.find((item) => item.category === "shoes");
  const accessory = items.find((item) => item.category === "accessory");

  return (
    <View style={styles.canvas}>
      {bottom ? <ReferencePiece item={bottom} style={[styles.canvasPiece, styles.pantsPiece]} shapeStyle={styles.pantsShape} iconSize={34} /> : null}
      {top && top.id !== outerwear?.id ? <ReferencePiece item={top} style={[styles.canvasPiece, styles.teePiece]} shapeStyle={styles.teeShape} iconSize={32} /> : null}
      {outerwear ? <ReferencePiece item={outerwear} style={[styles.canvasPiece, styles.jacketPiece]} shapeStyle={styles.jacketShape} iconSize={48} /> : null}
      {accessory ? <ReferencePiece item={accessory} style={[styles.canvasPiece, styles.watchPiece]} shapeStyle={styles.watchShape} iconSize={22} /> : null}
      {shoes ? <ReferencePiece item={shoes} style={[styles.canvasPiece, styles.shoePiece]} shapeStyle={styles.shoeShape} iconSize={31} /> : null}
    </View>
  );
}

function ReferencePiece({
  item,
  style,
  shapeStyle,
  iconSize,
}: {
  item: ClothingItem;
  style: object;
  shapeStyle: object;
  iconSize: number;
}) {
  return (
    <View style={style}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.photo} />
      ) : (
        <View style={[styles.referenceGarment, shapeStyle, { backgroundColor: colorFamilyHex[item.colorFamily] }]}>
          <Ionicons name={iconFor(item.category)} size={iconSize} color="rgba(247,242,232,0.84)" />
        </View>
      )}
    </View>
  );
}

function getShuffleOutfit(wardrobe: ClothingItem[]) {
  const top = wardrobe.filter((item) => item.category === "top").at(1) ?? wardrobe.find((item) => item.category === "top");
  const bottom = wardrobe.filter((item) => item.category === "bottom").at(1) ?? wardrobe.find((item) => item.category === "bottom");
  const shoes = wardrobe.filter((item) => item.category === "shoes").at(1) ?? wardrobe.find((item) => item.category === "shoes");
  return [top, bottom, shoes].filter(Boolean) as ClothingItem[];
}

function iconFor(category: ClothingItem["category"]) {
  const icons: Record<ClothingItem["category"], keyof typeof Ionicons.glyphMap> = {
    top: "shirt-outline",
    bottom: "reorder-four-outline",
    shoes: "footsteps-outline",
    outerwear: "body-outline",
    accessory: "watch-outline",
  };
  return icons[category];
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 44,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
  },
  headerTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  saveButton: {
    minWidth: 44,
    alignItems: "flex-end",
  },
  saveText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  canvas: {
    height: 286,
    borderRadius: 0,
    backgroundColor: "#050B0E",
    overflow: "hidden",
  },
  canvasPiece: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.46,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
  },
  jacketPiece: {
    top: 8,
    left: 34,
    width: 196,
    height: 176,
  },
  teePiece: {
    top: 76,
    left: 104,
    width: 62,
    height: 74,
  },
  pantsPiece: {
    top: 114,
    left: 92,
    width: 98,
    height: 138,
  },
  shoePiece: {
    right: 18,
    bottom: 26,
    width: 122,
    height: 68,
  },
  watchPiece: {
    right: 26,
    top: 94,
    width: 36,
    height: 84,
  },
  referenceGarment: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
  },
  jacketShape: {
    width: 172,
    height: 158,
    borderRadius: 24,
  },
  teeShape: {
    width: 54,
    height: 66,
    borderRadius: 14,
  },
  pantsShape: {
    width: 76,
    height: 128,
    borderRadius: 18,
  },
  shoeShape: {
    width: 112,
    height: 48,
    borderRadius: 24,
  },
  watchShape: {
    width: 30,
    height: 72,
    borderRadius: 15,
  },
  actionStrip: {
    marginTop: 0,
  },
  matchCard: {
    marginTop: 8,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "rgba(191,169,124,0.1)",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 11,
  },
  matchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  matchTitle: {
    color: colors.sage,
    fontSize: 18,
    fontWeight: "900",
  },
  scoreRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 4,
    borderTopColor: colors.sage,
    borderLeftColor: colors.sage,
    borderRightColor: colors.gold,
    borderBottomColor: colors.sageDark,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreText: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
  },
  whyTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 2,
    marginBottom: 4,
  },
  reason: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 17,
  },
  swapsSection: {
    marginTop: 13,
    gap: 9,
  },
  swapsTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  swapsRow: {
    gap: 13,
    paddingRight: 20,
  },
  swapCard: {
    width: 88,
    height: 72,
    borderRadius: 8,
    backgroundColor: colors.productMat,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  swapGarment: {
    width: 64,
    height: 62,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  photo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});
