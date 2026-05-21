import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { OutfitCanvas } from "./OutfitCanvas";
import { ScoreBadge } from "./ScoreBadge";
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
      <ScoreBadge score={outfit.score} rating={outfit.rating} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: 10,
    padding: 10,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  canvasWrap: {
    height: 160,
    overflow: "hidden",
    borderRadius: 18,
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
    fontSize: 15,
    fontWeight: "800",
  },
});
