import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "../components/AppHeader";
import { ColorSwatch } from "../components/ColorSwatch";
import { ColorSwatchRow } from "../components/ColorSwatchRow";
import { PrimaryButton } from "../components/PrimaryButton";
import { SegmentedControl } from "../components/SegmentedControl";
import { colors } from "../theme/colors";

type Props = {
  onOpenLink: () => void;
};

export function AddItemScreen({ onOpenLink }: Props) {
  const [mode, setMode] = useState<"photo" | "link" | "manual">("photo");

  return (
    <View style={styles.screen}>
      <AppHeader title="Add Item" leftIcon="close" onLeftPress={() => null} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SegmentedControl
          options={["photo", "link", "manual"]}
          value={mode}
          onChange={(value) => {
            setMode(value);
            if (value === "link") onOpenLink();
          }}
        />
        <View style={styles.photoCard}>
          <View style={styles.garment}>
            <Ionicons name="shirt-outline" size={82} color={colors.cream} />
          </View>
        </View>
        <View style={styles.panel}>
          <Text style={styles.kicker}>Detected</Text>
          <View style={styles.detectedRow}>
            <View style={styles.smallIcon}>
              <Ionicons name="shirt-outline" size={22} color={colors.gold} />
            </View>
            <View>
              <Text style={styles.title}>Button Down</Text>
              <Text style={styles.muted}>Long sleeve shirt</Text>
            </View>
          </View>
        </View>
        <View style={styles.panel}>
          <Text style={styles.kicker}>Color</Text>
          <View style={styles.colorRow}>
            <ColorSwatch color="sage" size={52} selected />
            <View>
              <Text style={styles.title}>Sage Green</Text>
              <Text style={styles.muted}>Confidence: High</Text>
            </View>
          </View>
          <ColorSwatchRow colors={["cream", "sage", "olive", "tan", "brown", "navy", "gray"]} selected="sage" />
        </View>
        <PrimaryButton label="Save Item" icon="checkmark" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 18,
    gap: 16,
    paddingBottom: 34,
  },
  photoCard: {
    height: 300,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  garment: {
    width: 180,
    height: 210,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9EA56F",
    borderWidth: 1,
    borderColor: "rgba(247,242,232,0.28)",
  },
  panel: {
    gap: 13,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  kicker: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  detectedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  smallIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceElevated,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  muted: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
});
