import { Pressable, StyleSheet, Text } from "react-native";

import { colors } from "../theme/colors";

type Props = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

export function FilterChip({ label, active = false, onPress }: Props) {
  return (
    <Pressable style={[styles.chip, active && styles.active]} onPress={onPress}>
      <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  active: {
    backgroundColor: "rgba(158,165,111,0.18)",
    borderColor: colors.sage,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  activeLabel: {
    color: colors.cream,
  },
});
