import { ScrollView, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "../components/AppHeader";
import { ColorGuideWheel } from "../components/ColorGuideWheel";
import { ColorSwatchRow } from "../components/ColorSwatchRow";
import { SegmentedControl } from "../components/SegmentedControl";
import { getGoodOptions, getGreatMatches, neutralColors } from "../lib/colorGuide";
import { ClothingItem } from "../models/clothing";
import { colors } from "../theme/colors";
import { useState } from "react";

type Props = {
  item: ClothingItem;
  onBack: () => void;
};

export function ColorGuideScreen({ item, onBack }: Props) {
  const [mode, setMode] = useState<"matches" | "avoid" | "neutrals">("matches");
  const great = getGreatMatches(item.colorFamily);
  const good = getGoodOptions(item.colorFamily);

  return (
    <View style={styles.screen}>
      <AppHeader title="Color Guide" leftIcon="chevron-back" onLeftPress={onBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SegmentedControl options={["matches", "avoid", "neutrals"]} value={mode} onChange={setMode} />
        <View style={styles.wheelCard}>
          <ColorGuideWheel selected={item.colorFamily} colorsList={["cream", "sage", "olive", "tan", "brown", "navy", "gray", "white"]} />
          <Text style={styles.title}>{item.colorName ?? item.colorFamily}</Text>
          <Text style={styles.muted}>Your Color</Text>
        </View>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Great Matches</Text>
          <ColorSwatchRow colors={great} selected={item.colorFamily} size={28} />
        </View>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Good Options</Text>
          <ColorSwatchRow colors={mode === "neutrals" ? neutralColors : good} size={28} />
        </View>
        <Text style={styles.copy}>
          These suggestions come from the same deterministic compatibility matrix used by the outfit builder. {item.colorName ?? item.colorFamily} works best when it has a clear neutral anchor and similar saturation.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, gap: 16, paddingBottom: 34 },
  wheelCard: {
    alignItems: "center",
    gap: 8,
    padding: 20,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: { color: colors.text, fontSize: 22, fontWeight: "800", textTransform: "capitalize" },
  muted: { color: colors.textMuted, fontSize: 13 },
  panel: {
    gap: 12,
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  panelTitle: { color: colors.text, fontSize: 17, fontWeight: "800" },
  copy: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    paddingHorizontal: 4,
  },
});
