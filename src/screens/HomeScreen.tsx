import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ColorSwatchRow } from "../components/ColorSwatchRow";
import { HangerLogo } from "../components/HangerLogo";
import { LogoLockup } from "../components/LogoLockup";
import { OutfitCanvas } from "../components/OutfitCanvas";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScoreBadge } from "../components/ScoreBadge";
import { evaluateCompatibility } from "../lib/matchingEngine";
import { mockWardrobe } from "../data/mockWardrobe";
import { ClothingCategory } from "../models/clothing";
import { colors } from "../theme/colors";

type Props = {
  onOpenBuilder: () => void;
  onOpenColorGuide: () => void;
};

const categoryOrder: ClothingCategory[] = ["top", "bottom", "outerwear", "shoes", "accessory"];
const todayItems = [mockWardrobe[0], mockWardrobe[1], mockWardrobe[7]];

export function HomeScreen({ onOpenBuilder, onOpenColorGuide }: Props) {
  const result = evaluateCompatibility(todayItems);
  const counts = categoryOrder.map((category) => ({
    category,
    count: mockWardrobe.filter((item) => item.category === category).length,
  }));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <LogoLockup compact />
        <Pressable style={styles.iconButton} onPress={onOpenColorGuide}>
          <Ionicons name="notifications-outline" size={20} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <View style={styles.appTile}>
          <HangerLogo size={76} />
        </View>
        <Text style={styles.heroTitle}>
          <Text style={styles.cream}>Wardrobe</Text>
          <Text style={styles.sage}>Harmony</Text>
        </Text>
        <Text style={styles.tagline}>Color confidence. Outfits that work.</Text>
        <ColorSwatchRow colors={["cream", "sage", "olive", "tan", "brown", "navy"]} />
      </View>

      <View style={styles.wardrobeCard}>
        <View>
          <Text style={styles.kicker}>Your Wardrobe</Text>
          <Text style={styles.count}>128</Text>
          <Text style={styles.muted}>items organized by color, role, and season</Text>
        </View>
        <View style={styles.donut}>
          <View style={styles.donutInner}>
            <Text style={styles.donutNumber}>{mockWardrobe.length}</Text>
            <Text style={styles.donutLabel}>mock</Text>
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
            <Text style={styles.pickTitle}>Sage, navy, cognac</Text>
            <Text style={styles.muted}>Cool, 68°F</Text>
          </View>
          <ScoreBadge score={result.score} rating={result.rating} />
        </View>
        <OutfitCanvas items={todayItems} />
        <PrimaryButton label="Open Outfit Builder" icon="color-wand-outline" onPress={onOpenBuilder} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 18,
    paddingBottom: 28,
    gap: 18,
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
  hero: {
    alignItems: "center",
    gap: 12,
    padding: 22,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  appTile: {
    width: 112,
    height: 112,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
  },
  cream: { color: colors.cream },
  sage: { color: colors.sage },
  tagline: {
    color: colors.textMuted,
    fontSize: 14,
  },
  wardrobeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    padding: 18,
  },
  kicker: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  count: {
    color: colors.text,
    fontSize: 42,
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
    borderRadius: 16,
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
    borderRadius: 28,
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
});
