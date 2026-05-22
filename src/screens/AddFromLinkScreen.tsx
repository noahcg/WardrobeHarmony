import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppHeader } from "../components/AppHeader";
import { PrimaryButton } from "../components/PrimaryButton";
import { colors } from "../theme/colors";

type Props = {
  onClose: () => void;
};

export function AddFromLinkScreen({ onClose }: Props) {
  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.screen}>
        <AppHeader title="Add from Link" leftIcon="close" onLeftPress={onClose} />
        <View style={styles.content}>
          <View style={styles.inputWrap}>
            <Ionicons name="link-outline" size={20} color={colors.textMuted} />
            <TextInput placeholder="Paste product URL" placeholderTextColor={colors.textDim} style={styles.input} />
            <Ionicons name="create-outline" size={19} color={colors.gold} />
          </View>
          <PrimaryButton label="Import" icon="cloud-download-outline" />
          <View style={styles.preview}>
            <View style={styles.model}>
              <Ionicons name="person-outline" size={92} color={colors.cream} />
            </View>
            <Text style={styles.title}>Product preview</Text>
            <Text style={styles.muted}>Mock import card for a future scraper or manual review flow.</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, gap: 16 },
  inputWrap: {
    height: 54,
    borderRadius: 27,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: { flex: 1, color: colors.text, fontSize: 15 },
  preview: {
    minHeight: 380,
    borderRadius: 32,
    padding: 22,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  model: {
    width: 188,
    height: 260,
    borderRadius: 48,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  title: { color: colors.text, fontSize: 20, fontWeight: "800" },
  muted: { color: colors.textMuted, fontSize: 13, textAlign: "center", lineHeight: 19 },
});
