import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";

import { BottomTab, BottomTabBar } from "./src/components/BottomTabBar";
import { mockWardrobe } from "./src/data/mockWardrobe";
import { ClothingItem } from "./src/models/clothing";
import { AddFromLinkScreen } from "./src/screens/AddFromLinkScreen";
import { AddItemScreen } from "./src/screens/AddItemScreen";
import { ClosetScreen } from "./src/screens/ClosetScreen";
import { ColorGuideScreen } from "./src/screens/ColorGuideScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { ItemDetailsScreen } from "./src/screens/ItemDetailsScreen";
import { OutfitBuilderScreen } from "./src/screens/OutfitBuilderScreen";
import { OutfitsScreen } from "./src/screens/OutfitsScreen";
import { deleteStoredImage, loadWardrobe, saveWardrobe } from "./src/storage/wardrobeStore";
import { colors } from "./src/theme/colors";

type Screen =
  | BottomTab
  | "itemDetails"
  | "editItem"
  | "builder"
  | "colorGuide"
  | "addLink";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [activeTab, setActiveTab] = useState<BottomTab>("home");
  const [wardrobe, setWardrobe] = useState<ClothingItem[]>(mockWardrobe);
  const [selectedItem, setSelectedItem] = useState<ClothingItem>(mockWardrobe[0]);
  const [builderSeed, setBuilderSeed] = useState<ClothingItem[]>([
    mockWardrobe[0],
    mockWardrobe[1],
    mockWardrobe[7],
  ]);

  useEffect(() => {
    let mounted = true;
    loadWardrobe()
      .then((items) => {
        if (!mounted) return;
        setWardrobe(items);
        setSelectedItem(items[0] ?? mockWardrobe[0]);
        setBuilderSeed(getDefaultBuilderSeed(items));
      })
      .catch((error) => {
        console.warn("Could not load wardrobe", error);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const persistWardrobe = async (items: ClothingItem[]) => {
    setWardrobe(items);
    await saveWardrobe(items);
  };

  const addItem = async (item: ClothingItem) => {
    const nextWardrobe = [item, ...wardrobe];
    await persistWardrobe(nextWardrobe);
    setSelectedItem(item);
    setActiveTab("closet");
    setScreen("closet");
  };

  const updateItem = async (item: ClothingItem) => {
    const previous = wardrobe.find((entry) => entry.id === item.id);
    const nextWardrobe = wardrobe.map((entry) => (entry.id === item.id ? item : entry));
    await persistWardrobe(nextWardrobe);
    if (previous?.imageUrl && previous.imageUrl !== item.imageUrl) {
      await deleteStoredImage(previous.imageUrl);
    }
    setSelectedItem(item);
    setBuilderSeed((current) => current.map((entry) => (entry.id === item.id ? item : entry)));
    setScreen("itemDetails");
  };

  const deleteItem = async (item: ClothingItem) => {
    const nextWardrobe = wardrobe.filter((entry) => entry.id !== item.id);
    await persistWardrobe(nextWardrobe);
    await deleteStoredImage(item.imageUrl);
    const fallback = nextWardrobe[0] ?? mockWardrobe[0];
    setSelectedItem(fallback);
    setBuilderSeed((current) => current.filter((entry) => entry.id !== item.id));
    setActiveTab("closet");
    setScreen("closet");
  };

  const showTabs = ["home", "closet", "add", "outfits", "profile"].includes(screen);
  const route = useMemo(() => {
    switch (screen) {
      case "home":
        return (
          <HomeScreen
            wardrobe={wardrobe}
            onOpenBuilder={() => setScreen("builder")}
            onOpenColorGuide={() => setScreen("colorGuide")}
          />
        );
      case "closet":
        return (
          <ClosetScreen
            wardrobe={wardrobe}
            onOpenItem={(item) => {
              setSelectedItem(item);
              setScreen("itemDetails");
            }}
            onBuild={(items) => {
              setBuilderSeed(items);
              setScreen("builder");
            }}
          />
        );
      case "add":
        return <AddItemScreen onOpenLink={() => setScreen("addLink")} onClose={() => setScreen(activeTab)} onSave={addItem} />;
      case "editItem":
        return (
          <AddItemScreen
            editingItem={selectedItem}
            onOpenLink={() => setScreen("addLink")}
            onClose={() => setScreen("itemDetails")}
            onSave={updateItem}
          />
        );
      case "outfits":
        return <OutfitsScreen wardrobe={wardrobe} onOpenBuilder={() => setScreen("builder")} />;
      case "profile":
        return <ColorGuideScreen item={selectedItem} onBack={() => setScreen("home")} />;
      case "itemDetails":
        return (
          <ItemDetailsScreen
            item={selectedItem}
            onBack={() => setScreen(activeTab)}
            onEdit={() => setScreen("editItem")}
            onDelete={() => deleteItem(selectedItem)}
            onOpenColorGuide={() => setScreen("colorGuide")}
          />
        );
      case "builder":
        return (
          <OutfitBuilderScreen
            wardrobe={wardrobe}
            initialItems={builderSeed}
            onClose={() => setScreen(activeTab)}
            onOpenColorGuide={(item) => {
              setSelectedItem(item);
              setScreen("colorGuide");
            }}
          />
        );
      case "colorGuide":
        return <ColorGuideScreen item={selectedItem} onBack={() => setScreen(activeTab)} />;
      case "addLink":
        return <AddFromLinkScreen onClose={() => setScreen("add")} />;
      default:
        return null;
    }
  }, [activeTab, builderSeed, screen, selectedItem, wardrobe]);

  const handleTabPress = (tab: BottomTab) => {
    setActiveTab(tab);
    setScreen(tab);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.appShell}>{route}</View>
      {showTabs ? <BottomTabBar activeTab={activeTab} onTabPress={handleTabPress} /> : null}
    </SafeAreaView>
  );
}

function getDefaultBuilderSeed(items: ClothingItem[]) {
  const top = items.find((item) => item.category === "top");
  const bottom = items.find((item) => item.category === "bottom");
  const shoes = items.find((item) => item.category === "shoes");
  return [top, bottom, shoes].filter(Boolean) as ClothingItem[];
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  appShell: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
