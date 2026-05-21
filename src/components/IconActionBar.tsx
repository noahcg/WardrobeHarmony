import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { colors } from "../theme/colors";

type Action = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
};

export function IconActionBar({ actions }: { actions: Action[] }) {
  return (
    <View style={styles.bar}>
      {actions.map((action, index) => (
        <Pressable key={`${action.icon}-${index}`} style={styles.button} onPress={action.onPress}>
          <Ionicons name={action.icon} size={20} color={colors.cream} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
    padding: 8,
    alignSelf: "center",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(5,11,14,0.86)",
  },
  button: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceElevated,
  },
});
