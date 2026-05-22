import { Ionicons } from "@expo/vector-icons";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HangerLogo } from "../components/HangerLogo";
import { evaluateCompatibility } from "../lib/matchingEngine";
import { ClothingCategory, ClothingItem } from "../models/clothing";
import { CurrentWeather } from "../models/weather";
import { colorFamilyHex, colors } from "../theme/colors";

type Props = {
  wardrobe: ClothingItem[];
  firstName?: string;
  weather?: CurrentWeather;
  onUpdateFirstName: (firstName: string | undefined) => Promise<void>;
  onOpenBuilder: () => void;
  onOpenColorGuide: () => void;
};

const categoryOrder: ClothingCategory[] = ["top", "bottom", "outerwear", "shoes", "accessory"];

export function HomeScreen({ wardrobe, firstName, weather, onUpdateFirstName, onOpenBuilder, onOpenColorGuide }: Props) {
  const todayItems = getTodayItems(wardrobe);
  const result = evaluateCompatibility(todayItems);
  const trimmedName = firstName?.trim();
  const weatherLine = formatWeatherLine(weather);
  const counts = categoryOrder.map((category) => ({
    category,
    count: wardrobe.filter((item) => item.category === category).length,
  }));

  const editFirstName = () => {
    Alert.prompt(
      "Your first name",
      "WardrobeHarmony uses this only on your device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: (value?: string) => {
            const cleanValue = value?.trim();
            onUpdateFirstName(cleanValue || undefined).catch((error) => {
              console.warn("Could not save profile", error);
            });
          },
        },
      ],
      "plain-text",
      trimmedName ?? "",
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <HangerLogo size={26} />
            <Text style={styles.wordmark}>
              <Text style={styles.wordmarkCream}>Wardrobe</Text>
              <Text style={styles.wordmarkGold}>Harmony</Text>
            </Text>
          </View>
          <Pressable style={styles.bellButton} onPress={onOpenColorGuide}>
            <Ionicons name="notifications-outline" size={19} color={colors.text} />
          </Pressable>
        </View>

        <Pressable style={styles.greetingRow} onPress={editFirstName}>
          <Ionicons name="sunny-outline" size={24} color={colors.gold} />
          <View>
            <Text style={styles.greeting}>{trimmedName ? `Good morning, ${trimmedName}` : "Good morning"}</Text>
            <Text style={styles.greetingSub}>{trimmedName ? "Let's build your best outfit." : "Add your name for a personal home screen."}</Text>
          </View>
        </Pressable>

        <Pressable style={styles.todayCard} onPress={onOpenBuilder}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Today's Pick</Text>
              <Text style={styles.sectionSub}>{weatherLine}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.cream} />
          </View>
          <MiniFlatLay items={todayItems} />
        </Pressable>

        <View style={styles.wardrobeCard}>
          <View style={styles.wardrobeTop}>
            <View>
              <Text style={styles.sectionTitle}>Your Wardrobe</Text>
              <Text style={styles.itemCount}>{wardrobe.length}</Text>
              <Text style={styles.sectionSub}>Items</Text>
            </View>
            <View style={styles.donut}>
              <View style={styles.donutHole} />
            </View>
          </View>

          <View style={styles.breakdown}>
            {counts.map((entry) => (
              <View key={entry.category} style={styles.breakdownRow}>
                <View style={styles.breakdownLabelRow}>
                  <View style={[styles.categoryDot, categoryDotStyle(entry.category)]} />
                  <Text style={styles.breakdownLabel}>{label(entry.category)}</Text>
                </View>
                <View style={styles.rule} />
                <Text style={styles.breakdownCount}>{entry.count}</Text>
              </View>
            ))}
          </View>
        </View>

        <Pressable style={styles.suggestedCard} onPress={onOpenBuilder}>
          <View>
            <Text style={styles.sectionTitle}>Suggested Outfit</Text>
            <Text style={styles.matchText}>{result.rating} Match</Text>
          </View>
          <View style={styles.suggestedBody}>
            <View style={styles.suggestedItems}>
              {todayItems.slice(0, 4).map((item) => (
                <MiniItem key={item.id} item={item} />
              ))}
            </View>
            <View style={styles.scoreRing}>
              <Text style={styles.score}>{result.score}</Text>
            </View>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function MiniFlatLay({ items }: { items: ClothingItem[] }) {
  return (
    <View style={styles.flatLay}>
      {items.slice(0, 4).map((item) => (
        <View key={item.id} style={[styles.flatLayPiece, flatLayPieceStyle(item.category)]}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.photo} />
          ) : (
            <View style={[styles.garmentShape, { backgroundColor: colorFamilyHex[item.colorFamily] }, garmentShapeStyle(item.category)]}>
              <Ionicons name={iconFor(item.category)} size={item.category === "accessory" ? 18 : 30} color="rgba(247,242,232,0.82)" />
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

function MiniItem({ item }: { item: ClothingItem }) {
  return (
    <View style={styles.miniItem}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.photo} />
      ) : (
        <View style={[styles.garmentShape, { backgroundColor: colorFamilyHex[item.colorFamily] }, garmentShapeStyle(item.category)]}>
          <Ionicons name={iconFor(item.category)} size={24} color="rgba(247,242,232,0.82)" />
        </View>
      )}
    </View>
  );
}

function getTodayItems(wardrobe: ClothingItem[]) {
  const top = wardrobe.find((item) => item.category === "top");
  const bottom = wardrobe.find((item) => item.category === "bottom");
  const shoes = wardrobe.find((item) => item.category === "shoes");
  const accessory = wardrobe.find((item) => item.category === "accessory");
  return [top, bottom, shoes, accessory].filter(Boolean) as ClothingItem[];
}

function formatWeatherLine(weather?: CurrentWeather) {
  if (!weather) return "Local weather pending";
  return `${weather.condition}, ${weather.temperatureF}°F`;
}

function iconFor(category: ClothingCategory) {
  const icons: Record<ClothingCategory, keyof typeof Ionicons.glyphMap> = {
    top: "shirt-outline",
    bottom: "reorder-four-outline",
    shoes: "footsteps-outline",
    outerwear: "body-outline",
    accessory: "watch-outline",
  };
  return icons[category];
}

function label(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function categoryDotStyle(category: ClothingCategory) {
  const dotColors: Record<ClothingCategory, string> = {
    top: colors.sage,
    bottom: colors.sageDark,
    outerwear: colors.gold,
    shoes: colors.tan,
    accessory: "#7A4E24",
  };
  return { backgroundColor: dotColors[category] };
}

function flatLayPieceStyle(category: ClothingCategory) {
  if (category === "bottom") return styles.flatLayBottom;
  if (category === "shoes") return styles.flatLayShoes;
  if (category === "accessory") return styles.flatLayAccessory;
  return null;
}

function garmentShapeStyle(category: ClothingCategory) {
  if (category === "bottom") return styles.garmentBottom;
  if (category === "shoes") return styles.garmentShoe;
  if (category === "accessory") return styles.garmentAccessory;
  return null;
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
  content: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 16,
    gap: 13,
  },
  header: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  wordmark: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 23,
    letterSpacing: 0.3,
  },
  wordmarkCream: {
    color: colors.cream,
  },
  wordmarkGold: {
    color: colors.sage,
  },
  bellButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    paddingTop: 1,
  },
  greeting: {
    color: colors.text,
    fontSize: 21,
    lineHeight: 25,
    fontWeight: "800",
  },
  greetingSub: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 3,
  },
  todayCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(191,169,124,0.12)",
    backgroundColor: colors.surface,
    padding: 12,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 17,
    fontWeight: "800",
  },
  sectionSub: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 15,
    marginTop: 2,
  },
  flatLay: {
    height: 150,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.productMat,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  flatLayPiece: {
    position: "absolute",
    left: 24,
    bottom: 14,
    width: 92,
    height: 110,
    alignItems: "center",
    justifyContent: "center",
  },
  flatLayBottom: {
    left: 110,
    bottom: 16,
    width: 66,
    height: 112,
  },
  flatLayShoes: {
    left: 158,
    bottom: 10,
    width: 86,
    height: 52,
  },
  flatLayAccessory: {
    left: 230,
    bottom: 50,
    width: 46,
    height: 70,
  },
  photo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  garmentShape: {
    width: "82%",
    height: "82%",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.26)",
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
  },
  garmentBottom: {
    width: "58%",
    height: "92%",
    borderRadius: 14,
  },
  garmentShoe: {
    width: "94%",
    height: "56%",
    borderRadius: 18,
  },
  garmentAccessory: {
    width: "68%",
    height: "68%",
    borderRadius: 22,
  },
  wardrobeCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(191,169,124,0.12)",
    backgroundColor: colors.surface,
    padding: 12,
    gap: 10,
  },
  wardrobeTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemCount: {
    color: colors.text,
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "300",
    marginTop: 4,
  },
  donut: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 12,
    borderTopColor: colors.sage,
    borderRightColor: "#D6D7B9",
    borderBottomColor: colors.gold,
    borderLeftColor: colors.sageDark,
    alignItems: "center",
    justifyContent: "center",
  },
  donutHole: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
  },
  breakdown: {
    gap: 4,
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 17,
  },
  breakdownLabelRow: {
    width: 92,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakdownLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  rule: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(239,231,216,0.08)",
  },
  breakdownCount: {
    width: 28,
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
  },
  suggestedCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(191,169,124,0.12)",
    backgroundColor: colors.surface,
    padding: 12,
    gap: 8,
  },
  matchText: {
    color: colors.sage,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 1,
  },
  suggestedBody: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  suggestedItems: {
    flexDirection: "row",
    gap: 8,
    flex: 1,
  },
  miniItem: {
    width: 48,
    height: 58,
    borderRadius: 8,
    backgroundColor: colors.productMat,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  scoreRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: colors.sage,
    alignItems: "center",
    justifyContent: "center",
  },
  score: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
});
