import { StyleSheet, View } from "react-native";

import { ColorSwatch } from "./ColorSwatch";
import { ColorFamily } from "../models/clothing";

type Props = {
  colors: ColorFamily[];
  selected?: ColorFamily;
  size?: number;
};

export function ColorSwatchRow({ colors, selected, size }: Props) {
  return (
    <View style={styles.row}>
      {colors.map((color) => (
        <ColorSwatch key={color} color={color} selected={selected === color} size={size} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
  },
});
