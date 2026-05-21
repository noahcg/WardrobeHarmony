import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";

type Props = {
  title?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  rightLabel?: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
};

export function AppHeader({ title, leftIcon, rightIcon, rightLabel, onLeftPress, onRightPress }: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.side}>
        {leftIcon ? (
          <Pressable style={styles.iconButton} onPress={onLeftPress}>
            <Ionicons name={leftIcon} size={20} color={colors.text} />
          </Pressable>
        ) : null}
      </View>
      {title ? <Text style={styles.title}>{title}</Text> : <View />}
      <View style={[styles.side, styles.right]}>
        {rightIcon ? (
          <Pressable style={styles.iconButton} onPress={onRightPress}>
            <Ionicons name={rightIcon} size={20} color={colors.text} />
          </Pressable>
        ) : rightLabel ? (
          <Pressable onPress={onRightPress}>
            <Text style={styles.save}>{rightLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },
  side: {
    width: 64,
  },
  right: {
    alignItems: "flex-end",
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  save: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: "700",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
