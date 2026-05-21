import { StyleSheet, Text, View } from "react-native";

import { HangerLogo } from "./HangerLogo";
import { colors } from "../theme/colors";

type Props = {
  compact?: boolean;
};

export function LogoLockup({ compact = false }: Props) {
  return (
    <View style={styles.row}>
      <HangerLogo size={compact ? 34 : 48} />
      <View>
        <Text style={[styles.wordmark, compact && styles.compactWordmark]}>
          <Text style={styles.wardrobe}>Wardrobe</Text>
          <Text style={styles.harmony}>Harmony</Text>
        </Text>
        {!compact ? <Text style={styles.tagline}>Color confidence. Outfits that work.</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  wordmark: {
    fontSize: 25,
    lineHeight: 29,
    fontWeight: "700",
    letterSpacing: 0,
  },
  compactWordmark: {
    fontSize: 19,
    lineHeight: 23,
  },
  wardrobe: {
    color: colors.cream,
  },
  harmony: {
    color: colors.sage,
  },
  tagline: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 3,
  },
});
