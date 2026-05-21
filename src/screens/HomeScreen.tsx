import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { LogoLockup } from "../components/LogoLockup";
import { OutfitCanvas } from "../components/OutfitCanvas";
import { PrimaryButton } from "../components/PrimaryButton";
import { evaluateCompatibility } from "../lib/matchingEngine";
import { ClothingCategory, ClothingItem } from "../models/clothing";
import { colors } from "../theme/colors";

type Props = {
  wardrobe: ClothingItem[];
  onOpenBuilder: () => void;
  onOpenColorGuide: () => void;
};

const categoryOrder: ClothingCategory[] = ["top", "bottom", "outerwear", "shoes", "accessory"];

export function HomeScreen({ wardrobe, onOpenBuilder, onOpenColorGuide }: Props) {
  const todayItems = getTodayItems(wardrobe);
  const result = evaluateCompatibility(todayItems);
  const counts = categoryOrder.map((category) => ({
    category,
    count: wardrobe.filter((item) => item.category === category).length,
  }));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <LogoLockup compact />
        <Pressable style={styles.iconButton} onPress={onOpenColorGuide}>
          <Ionicons name="notifications-outline" size={20} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.wardrobeCard}>
        <View>
          <Text style={styles.kicker}>Your Wardrobe</Text>
          <Text style={styles.count}>{wardrobe.length}</Text>
          <Text style={styles.muted}>items organized by color, role, and season</Text>
        </View>
        <View style={styles.donut}>
          <View style={styles.donutInner}>
            <Text style={styles.donutNumber}>{wardrobe.length}</Text>
            <Text style={styles.donutLabel}>saved</Text>
          </View>
        </View>
      </View>

      <View style={styles.breakdown}>
        {counts.map((entry) => (
          <View key={entry.category} style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>{entry.category}</Text>
            <Text style={styles.breakdownCount}>{entry.count}</Text>
          </View>
        ))}
      </View>

      <View style={styles.pickCard}>
        <View style={styles.pickHeader}>
          <View>
            <Text style={styles.kicker}>Today's Pick</Text>
            <Text style={styles.pickTitle}>{todayItems.map((item) => item.colorFamily).join(", ")}</Text>
            <Text style={styles.muted}>Cool, 68°F</Text>
          </View>
          <View style={styles.scorePill}>
            <Text style={styles.scoreText}>{result.score}</Text>
            <Text style={styles.scoreLabel}>{result.rating}</Text>
          </View>
        </View>
        <OutfitCanvas items={todayItems} />
        <PrimaryButton label="Open Outfit Builder" icon="color-wand-outline" onPress={onOpenBuilder} />
      </View>
    </ScrollView>
  );
}

function getTodayItems(wardrobe: ClothingItem[]) {
  const top = wardrobe.find((item) => item.category === "top");
  const bottom = wardrobe.find((item) => item.category === "bottom");
  const shoes = wardrobe.find((item) => item.category === "shoes");
  return [top, bottom, shoes].filter(Boolean) as ClothingItem[];
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  wardrobeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    padding: 16,
  },
  kicker: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  count: {
    color: colors.text,
    fontSize: 40,
    fontWeight: "800",
  },
  muted: {
    color: colors.textMuted,
    fontSize: 13,
  },
  donut: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 12,
    borderTopColor: colors.gold,
    borderRightColor: colors.sage,
    borderBottomColor: colors.tan,
    borderLeftColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  donutInner: {
    alignItems: "center",
  },
  donutNumber: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  donutLabel: {
    color: colors.textMuted,
    fontSize: 11,
  },
  breakdown: {
    gap: 8,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  breakdownLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  breakdownCount: {
    color: colors.sage,
    fontSize: 14,
    fontWeight: "800",
  },
  pickCard: {
    gap: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
  },
  pickHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  pickTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "800",
    marginTop: 3,
  },
  scorePill: {
    minWidth: 64,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "center",
    backgroundColor: "rgba(158,165,111,0.16)",
    borderWidth: 1,
    borderColor: colors.border,
  },
  scoreText: {
    color: colors.gold,
    fontSize: 21,
    fontWeight: "900",
  },
  scoreLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "800",
  },
});
