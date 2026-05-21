import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text } from "react-native";

import { colors } from "../theme/colors";

type Props = {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
};

export function PrimaryButton({ label, icon, onPress }: Props) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      {icon ? <Ionicons name={icon} color={colors.background} size={18} /> : null}
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  label: {
    color: colors.background,
    fontSize: 15,
    fontWeight: "800",
  },
});
