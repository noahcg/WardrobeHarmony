import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { AppHeader } from "../components/AppHeader";
import { CompatibilityExplanation } from "../components/CompatibilityExplanation";
import { IconActionBar } from "../components/IconActionBar";
import { ItemPicker } from "../components/ItemPicker";
import { OutfitCanvas } from "../components/OutfitCanvas";
import { ScoreBadge } from "../components/ScoreBadge";
import { SuggestedSwaps } from "../components/SuggestedSwaps";
import { evaluateCompatibility, findSuggestedSwaps } from "../lib/matchingEngine";
import { ClothingItem } from "../models/clothing";
import { colors } from "../theme/colors";

type Props = {
  wardrobe: ClothingItem[];
  initialItems: ClothingItem[];
  onClose: () => void;
  onOpenColorGuide: (item: ClothingItem) => void;
};

export function OutfitBuilderScreen({ wardrobe, initialItems, onClose, onOpenColorGuide }: Props) {
  const [items, setItems] = useState<ClothingItem[]>(initialItems);
  const result = useMemo(() => evaluateCompatibility(items), [items]);
  const swaps = useMemo(() => findSuggestedSwaps(items, wardrobe), [items, wardrobe]);

  const toggleItem = (item: ClothingItem) => {
    setItems((current) => {
      if (current.some((selected) => selected.id === item.id)) {
        return current.filter((selected) => selected.id !== item.id);
      }
      return [...current, item];
    });
  };

  const selectSwap = (item: ClothingItem) => {
    setItems((current) => {
      const replaceIndex = current.findIndex((selected) => selected.category === item.category);
      if (replaceIndex === -1) return [...current, item];
      return current.map((selected, index) => (index === replaceIndex ? item : selected));
    });
  };

  return (
    <View style={styles.screen}>
      <AppHeader title="Outfit Builder" leftIcon="close" rightLabel="Save" onLeftPress={onClose} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <OutfitCanvas items={items} />
        <View style={styles.floating}>
          <IconActionBar
            actions={[
              { icon: "add" },
              { icon: "color-palette-outline", onPress: () => items[0] && onOpenColorGuide(items[0]) },
              { icon: "shuffle-outline", onPress: () => setItems(getShuffleOutfit(wardrobe)) },
              { icon: "heart-outline" },
            ]}
          />
        </View>
        <ScoreBadge score={result.score} rating={result.rating} />
        <CompatibilityExplanation result={result} />
        <ItemPicker items={wardrobe} selectedItems={items} onToggle={toggleItem} />
        <SuggestedSwaps swaps={swaps} onSelect={selectSwap} />
      </ScrollView>
    </View>
  );
}

function getShuffleOutfit(wardrobe: ClothingItem[]) {
  const top = wardrobe.filter((item) => item.category === "top").at(1) ?? wardrobe.find((item) => item.category === "top");
  const bottom = wardrobe.filter((item) => item.category === "bottom").at(1) ?? wardrobe.find((item) => item.category === "bottom");
  const shoes = wardrobe.filter((item) => item.category === "shoes").at(1) ?? wardrobe.find((item) => item.category === "shoes");
  return [top, bottom, shoes].filter(Boolean) as ClothingItem[];
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 18,
    paddingBottom: 38,
    gap: 16,
  },
  floating: {
    marginTop: -42,
  },
});
