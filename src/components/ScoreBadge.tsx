import { StyleSheet, Text, View } from "react-native";

import { OutfitRating } from "../models/outfit";
import { colors } from "../theme/colors";

type Props = {
  score: number;
  rating: OutfitRating;
};

export function ScoreBadge({ score, rating }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.score}>{score}</Text>
      <View>
        <Text style={styles.rating}>{rating}</Text>
        <Text style={styles.caption}>Harmony score</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(158,165,111,0.14)",
  },
  score: {
    color: colors.gold,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "800",
  },
  rating: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  caption: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
});
