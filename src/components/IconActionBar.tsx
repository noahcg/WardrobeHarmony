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
    justifyContent: "space-between",
    gap: 0,
    paddingVertical: 7,
    paddingHorizontal: 12,
    alignSelf: "stretch",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(5,11,14,0.86)",
  },
  button: {
    flex: 1,
    height: 34,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
});
