import { StyleSheet, View } from "react-native";

import { colorFamilyHex, colors } from "../theme/colors";
import { ColorFamily } from "../models/clothing";

type Props = {
  color: ColorFamily;
  size?: number;
  selected?: boolean;
};

export function ColorSwatch({ color, size = 22, selected = false }: Props) {
  return (
    <View
      style={[
        styles.swatch,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colorFamilyHex[color],
        },
        selected && styles.selected,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  swatch: {
    borderWidth: 1,
    borderColor: "rgba(247,242,232,0.38)",
  },
  selected: {
    borderWidth: 2,
    borderColor: colors.gold,
  },
});
