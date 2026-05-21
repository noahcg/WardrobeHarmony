import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { OutfitCanvas } from "./OutfitCanvas";
import { Outfit } from "../models/outfit";
import { colors } from "../theme/colors";

type Props = {
  outfit: Outfit;
  onPress?: () => void;
};

export function OutfitCard({ outfit, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.canvasWrap}>
        <OutfitCanvas items={outfit.items} />
        {outfit.favorite ? (
          <View style={styles.favorite}>
            <Ionicons name="heart" size={15} color={colors.background} />
          </View>
        ) : null}
      </View>
      <Text style={styles.name}>{outfit.name}</Text>
      <Text style={styles.meta}>
        {outfit.score} harmony · {outfit.rating}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: 8,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  canvasWrap: {
    height: 142,
    overflow: "hidden",
    borderRadius: 9,
  },
  favorite: {
    position: "absolute",
    right: 8,
    top: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  meta: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },
});
