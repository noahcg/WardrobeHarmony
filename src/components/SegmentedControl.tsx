import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";

type Props<T extends string> = {
  options: T[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.wrap}>
      {options.map((option) => {
        const active = option === value;
        return (
          <Pressable key={option} style={[styles.option, active && styles.active]} onPress={() => onChange(option)}>
            <Text style={[styles.label, active && styles.activeLabel]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  option: {
    flex: 1,
    minHeight: 34,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  active: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  activeLabel: {
    color: colors.cream,
  },
});
