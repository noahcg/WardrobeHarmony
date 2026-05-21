import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";

type Props = {
  title: string;
  message: string;
};

export function EmptyState({ title, message }: Props) {
  return (
    <View style={styles.wrap}>
      <Ionicons name="shirt-outline" size={30} color={colors.gold} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    gap: 8,
    padding: 28,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
  },
  message: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
});
