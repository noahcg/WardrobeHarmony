import { Ionicons } from "@expo/vector-icons";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ColorSwatch } from "../components/ColorSwatch";
import { ClothingItem } from "../models/clothing";
import { colorFamilyHex, colors } from "../theme/colors";

type Props = {
  item: ClothingItem;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onOpenColorGuide: () => void;
};

const familyRow = ["sage", "olive", "tan", "brown", "cream", "navy", "black"] as const;

export function ItemDetailsScreen({ item, onBack, onEdit, onDelete, onOpenColorGuide }: Props) {
  const confirmDelete = () => {
    Alert.alert("Delete item?", `${item.name} will be removed from your wardrobe.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onDelete },
    ]);
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={24} color={colors.cream} />
          </Pressable>
          <Text style={styles.headerTitle}>Item Details</Text>
          <Pressable style={styles.headerButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color={colors.cream} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.imageCard}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.photo} />
            ) : (
              <View style={[styles.garmentFallback, { backgroundColor: colorFamilyHex[item.colorFamily] }]}>
                <Ionicons name="shirt-outline" size={92} color="rgba(247,242,232,0.84)" />
              </View>
            )}
            <Pressable style={styles.editButton} onPress={onEdit}>
              <Ionicons name="create-outline" size={18} color={colors.cream} />
            </Pressable>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>
              {label(item.category)}  •  {label(item.formality)}  •  {label(item.pattern)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Color</Text>
            <View style={styles.colorRow}>
              <ColorSwatch color={item.colorFamily} size={34} selected />
              <View>
                <Text style={styles.colorName}>{item.colorName ?? label(item.colorFamily)}</Text>
                <Text style={styles.subtle}>Confidence: {label(item.confidence ?? "medium")}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Color Family</Text>
            <View style={styles.swatchRow}>
              {familyRow.map((family) => (
                <View
                  key={family}
                  style={[
                    styles.familySwatch,
                    { backgroundColor: colorFamilyHex[family] },
                    item.colorFamily === family && styles.activeFamilySwatch,
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.note}>{item.notes ?? "No notes yet."}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tags}>
              {(item.tags?.length ? item.tags : ["Casual", "Spring", "Work"]).map((tag) => (
                <Text key={tag} style={styles.tag}>
                  {label(tag)}
                </Text>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <Pressable style={styles.bottomAction} onPress={confirmDelete}>
            <Ionicons name="trash-outline" size={22} color={colors.cream} />
          </Pressable>
          <Pressable style={styles.bottomAction}>
            <Ionicons name="heart-outline" size={22} color={colors.cream} />
          </Pressable>
          <Pressable style={styles.bottomAction} onPress={onOpenColorGuide}>
            <Ionicons name="share-social-outline" size={22} color={colors.cream} />
          </Pressable>
          <Pressable style={styles.bottomAction} onPress={onEdit}>
            <Ionicons name="ellipsis-vertical" size={22} color={colors.cream} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function label(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 48,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 92,
  },
  imageCard: {
    height: 246,
    borderRadius: 8,
    backgroundColor: colors.productMat,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  garmentFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: {
    position: "absolute",
    right: 12,
    bottom: 12,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  titleBlock: {
    paddingTop: 18,
    paddingBottom: 10,
  },
  name: {
    color: colors.text,
    fontSize: 21,
    lineHeight: 26,
    fontWeight: "900",
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 3,
  },
  divider: {
    height: 1,
    marginTop: 8,
    backgroundColor: "rgba(239,231,216,0.08)",
  },
  section: {
    paddingTop: 18,
    paddingBottom: 8,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 9,
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  colorName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  subtle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  swatchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  familySwatch: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  activeFamilySwatch: {
    borderColor: colors.cream,
    borderWidth: 2,
  },
  note: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  tags: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  tag: {
    color: colors.cream,
    backgroundColor: colors.surfaceElevated,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    fontSize: 11,
    fontWeight: "800",
  },
  bottomBar: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 16,
    height: 58,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "rgba(191,169,124,0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  bottomAction: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
