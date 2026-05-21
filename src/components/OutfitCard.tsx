import { Pressable, StyleSheet, Text, View } from "react-native";

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
  name: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
});
