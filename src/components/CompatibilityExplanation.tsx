import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { CompatibilityResult } from "../lib/matchingEngine";
import { colors } from "../theme/colors";

type Props = {
  result: CompatibilityResult;
};

export function CompatibilityExplanation({ result }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Why it works</Text>
      {result.reasons.map((reason) => (
        <View key={reason} style={styles.row}>
          <Ionicons name="checkmark-circle-outline" color={colors.sage} size={17} />
          <Text style={styles.text}>{reason}</Text>
        </View>
      ))}
      {result.warnings.length > 0 ? <Text style={styles.warningTitle}>Watch points</Text> : null}
      {result.warnings.map((warning) => (
        <View key={warning} style={styles.row}>
          <Ionicons name="alert-circle-outline" color={colors.amber} size={17} />
          <Text style={styles.text}>{warning}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
    gap: 10,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 2,
  },
  warningTitle: {
    color: colors.amber,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    gap: 9,
    alignItems: "flex-start",
  },
  text: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
});
