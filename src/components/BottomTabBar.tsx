import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";

export type BottomTab = "home" | "closet" | "add" | "outfits" | "profile";

const tabs: { key: BottomTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "home", label: "Home", icon: "home-outline" },
  { key: "closet", label: "Closet", icon: "shirt-outline" },
  { key: "add", label: "Add", icon: "add" },
  { key: "outfits", label: "Outfits", icon: "color-wand-outline" },
  { key: "profile", label: "Guide", icon: "color-palette-outline" },
];

type Props = {
  activeTab: BottomTab;
  onTabPress: (tab: BottomTab) => void;
};

export function BottomTabBar({ activeTab, onTabPress }: Props) {
  return (
    <View style={styles.wrap}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const isAdd = tab.key === "add";
        return (
          <Pressable key={tab.key} style={styles.tab} onPress={() => onTabPress(tab.key)}>
            <View style={[styles.iconWrap, isActive && styles.activeIcon, isAdd && styles.addIcon]}>
              <Ionicons name={tab.icon} size={isAdd ? 27 : 20} color={isAdd ? colors.background : isActive ? colors.gold : colors.textMuted} />
            </View>
            <Text style={[styles.label, isActive && styles.activeLabel]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 9,
    paddingBottom: 8,
    paddingHorizontal: 8,
    backgroundColor: "#071015",
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  activeIcon: {
    backgroundColor: "rgba(199,162,74,0.12)",
  },
  addIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginTop: -22,
    backgroundColor: colors.gold,
    borderWidth: 4,
    borderColor: colors.background,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  activeLabel: {
    color: colors.cream,
  },
});
