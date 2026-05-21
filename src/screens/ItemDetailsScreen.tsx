import { Ionicons } from "@expo/vector-icons";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "../components/AppHeader";
import { ColorSwatch } from "../components/ColorSwatch";
import { ColorSwatchRow } from "../components/ColorSwatchRow";
import { IconActionBar } from "../components/IconActionBar";
import { ClothingItem } from "../models/clothing";
import { colorFamilyHex, colors } from "../theme/colors";

type Props = {
  item: ClothingItem;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onOpenColorGuide: () => void;
};

export function ItemDetailsScreen({ item, onBack, onEdit, onDelete, onOpenColorGuide }: Props) {
  const confirmDelete = () => {
    Alert.alert("Delete item?", `${item.name} will be removed from your wardrobe.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onDelete },
    ]);
  };

  return (
    <View style={styles.screen}>
      <AppHeader title="Item Details" leftIcon="chevron-back" rightIcon="ellipsis-horizontal" onLeftPress={onBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.image, { backgroundColor: colorFamilyHex[item.colorFamily] }]}>
          {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.photo} /> : <Ionicons name="shirt-outline" size={96} color={colors.cream} />}
          <Pressable style={styles.edit} onPress={onEdit}>
            <Ionicons name="create-outline" size={20} color={colors.background} />
          </Pressable>
        </View>
        <View>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.subcategory}>{item.subcategory}</Text>
        </View>
        <View style={styles.panel}>
          <Text style={styles.kicker}>Color</Text>
          <View style={styles.colorRow}>
            <ColorSwatch color={item.colorFamily} size={52} selected />
            <View>
              <Text style={styles.panelTitle}>{item.colorName ?? item.colorFamily}</Text>
              <Text style={styles.muted}>Family: {item.colorFamily}</Text>
            </View>
          </View>
          <ColorSwatchRow colors={["cream", "sage", "olive", "tan", "brown", "navy", "gray"]} selected={item.colorFamily} />
        </View>
        <View style={styles.panel}>
          <Text style={styles.kicker}>Notes</Text>
          <Text style={styles.muted}>{item.notes ?? "No notes yet."}</Text>
          <View style={styles.tags}>
            {item.tags?.map((tag) => (
              <Text key={tag} style={styles.tag}>
                {tag}
              </Text>
            ))}
          </View>
        </View>
        <IconActionBar
          actions={[
            { icon: "trash-outline", onPress: confirmDelete },
            { icon: "heart-outline" },
            { icon: "share-social-outline", onPress: onOpenColorGuide },
            { icon: "create-outline", onPress: onEdit },
          ]}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 14, paddingBottom: 34 },
  image: {
    height: 320,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderStrong,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  edit: {
    position: "absolute",
    right: 18,
    bottom: 18,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { color: colors.text, fontSize: 28, fontWeight: "800" },
  subcategory: { color: colors.textMuted, fontSize: 15, marginTop: 3 },
  panel: {
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
  },
  kicker: { color: colors.gold, fontSize: 12, fontWeight: "800", textTransform: "uppercase" },
  colorRow: { flexDirection: "row", alignItems: "center", gap: 13 },
  panelTitle: { color: colors.text, fontSize: 18, fontWeight: "800", textTransform: "capitalize" },
  muted: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    color: colors.cream,
    backgroundColor: "rgba(158,165,111,0.16)",
    borderColor: colors.border,
    borderWidth: 1,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    fontSize: 12,
    fontWeight: "700",
  },
});
