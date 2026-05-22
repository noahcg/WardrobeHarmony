import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconActionBar } from "../components/IconActionBar";
import { ItemPicker } from "../components/ItemPicker";
import { OutfitCanvas } from "../components/OutfitCanvas";
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

  const toggleItem = (item: ClothingItem) => {
    setItems((current) => {
      if (current.some((selected) => selected.id === item.id)) {
        return current.filter((selected) => selected.id !== item.id);
      }
      return [...current, item];
    });
  };

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

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <OutfitCanvas items={items} />
          <View style={styles.actionStrip}>
            <IconActionBar
              actions={[
                { icon: "bag-add-outline" },
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

          <ItemPicker items={wardrobe} selectedItems={items} onToggle={toggleItem} />
        </ScrollView>
      </View>
    </SafeAreaView>
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
    height: 48,
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
    paddingBottom: 30,
  },
  actionStrip: {
    marginTop: -2,
  },
  matchCard: {
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "rgba(191,169,124,0.1)",
    padding: 14,
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
    marginTop: 8,
    marginBottom: 5,
  },
  reason: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
  },
  swapsSection: {
    marginTop: 18,
    gap: 11,
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
    width: 92,
    height: 78,
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
