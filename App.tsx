import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { mockWardrobe } from "./src/data/mockWardrobe";
import { ClothingItem } from "./src/models/clothing";
import { SavedOutfit } from "./src/models/outfit";
import { AddFromLinkScreen } from "./src/screens/AddFromLinkScreen";
import { AddItemScreen } from "./src/screens/AddItemScreen";
import { ClosetScreen } from "./src/screens/ClosetScreen";
import { ColorGuideScreen } from "./src/screens/ColorGuideScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { ItemDetailsScreen } from "./src/screens/ItemDetailsScreen";
import { OutfitBuilderScreen } from "./src/screens/OutfitBuilderScreen";
import { OutfitsScreen } from "./src/screens/OutfitsScreen";
import { evaluateCompatibility } from "./src/lib/matchingEngine";
import { loadSavedOutfits, saveOutfits } from "./src/storage/outfitStore";
import { deleteStoredImage, loadWardrobe, saveWardrobe } from "./src/storage/wardrobeStore";
import { colors } from "./src/theme/colors";

type RootStackParamList = {
  MainTabs: undefined;
  AddItem: { editingItemId?: string } | undefined;
  AddFromLink: undefined;
  ItemDetails: { itemId: string };
  OutfitBuilder: { seedIds?: string[]; outfitId?: string } | undefined;
  ColorGuide: { itemId?: string } | undefined;
};

type TabParamList = {
  Home: undefined;
  Closet: undefined;
  Add: undefined;
  Outfits: undefined;
  Guide: undefined;
};

type WardrobeContextValue = {
  wardrobe: ClothingItem[];
  selectedItem: ClothingItem;
  savedOutfits: SavedOutfit[];
  addItem: (item: ClothingItem) => Promise<void>;
  updateItem: (item: ClothingItem) => Promise<void>;
  deleteItem: (item: ClothingItem) => Promise<void>;
  saveOutfitFromItems: (items: ClothingItem[]) => Promise<SavedOutfit>;
  getSavedOutfit: (id?: string) => SavedOutfit | undefined;
  getItem: (id?: string) => ClothingItem;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();
const WardrobeContext = createContext<WardrobeContextValue | null>(null);

export default function App() {
  const [wardrobe, setWardrobe] = useState<ClothingItem[]>(mockWardrobe);
  const [selectedItem, setSelectedItem] = useState<ClothingItem>(mockWardrobe[0]);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);

  useEffect(() => {
    let mounted = true;
    loadWardrobe()
      .then((items) => {
        if (!mounted) return;
        setWardrobe(items);
        setSelectedItem(items[0] ?? mockWardrobe[0]);
      })
      .catch((error) => {
        console.warn("Could not load wardrobe", error);
      });
    loadSavedOutfits()
      .then((outfits) => {
        if (!mounted) return;
        setSavedOutfits(outfits);
      })
      .catch((error) => {
        console.warn("Could not load outfits", error);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const persistWardrobe = async (items: ClothingItem[]) => {
    setWardrobe(items);
    await saveWardrobe(items);
  };

  const persistOutfits = async (outfits: SavedOutfit[]) => {
    setSavedOutfits(outfits);
    await saveOutfits(outfits);
  };

  const value = useMemo<WardrobeContextValue>(() => {
    const getItem = (id?: string) => wardrobe.find((item) => item.id === id) ?? selectedItem ?? wardrobe[0] ?? mockWardrobe[0];
    const getSavedOutfit = (id?: string) => savedOutfits.find((outfit) => outfit.id === id);

    return {
      wardrobe,
      selectedItem,
      savedOutfits,
      getItem,
      getSavedOutfit,
      addItem: async (item) => {
        const nextWardrobe = [item, ...wardrobe];
        await persistWardrobe(nextWardrobe);
        setSelectedItem(item);
      },
      updateItem: async (item) => {
        const previous = wardrobe.find((entry) => entry.id === item.id);
        const nextWardrobe = wardrobe.map((entry) => (entry.id === item.id ? item : entry));
        await persistWardrobe(nextWardrobe);
        if (previous?.imageUrl && previous.imageUrl !== item.imageUrl) {
          await deleteStoredImage(previous.imageUrl);
        }
        setSelectedItem(item);
      },
      deleteItem: async (item) => {
        const nextWardrobe = wardrobe.filter((entry) => entry.id !== item.id);
        const nextOutfits = savedOutfits
          .map((outfit) => ({
            ...outfit,
            itemIds: outfit.itemIds.filter((id) => id !== item.id),
            updatedAt: new Date().toISOString(),
          }))
          .filter((outfit) => outfit.itemIds.length > 0);
        await persistWardrobe(nextWardrobe);
        await persistOutfits(nextOutfits);
        await deleteStoredImage(item.imageUrl);
        setSelectedItem(nextWardrobe[0] ?? mockWardrobe[0]);
      },
      saveOutfitFromItems: async (items) => {
        const result = evaluateCompatibility(items);
        const now = new Date().toISOString();
        const name = createOutfitName(items);
        const outfit: SavedOutfit = {
          id: `outfit-${Date.now()}`,
          name,
          itemIds: items.map((item) => item.id),
          favorite: result.score >= 85,
          createdAt: now,
          updatedAt: now,
        };
        await persistOutfits([outfit, ...savedOutfits]);
        return outfit;
      },
    };
  }, [savedOutfits, selectedItem, wardrobe]);

  return (
    <SafeAreaProvider>
      <WardrobeContext.Provider value={value}>
        <NavigationContainer>
          <StatusBar style="light" />
          <RootStack.Navigator
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <RootStack.Screen name="MainTabs" component={MainTabs} />
            <RootStack.Screen name="AddItem" component={AddItemRoute} options={{ presentation: "modal" }} />
            <RootStack.Screen name="AddFromLink" component={AddFromLinkRoute} options={{ presentation: "modal" }} />
            <RootStack.Screen name="ItemDetails" component={ItemDetailsRoute} />
            <RootStack.Screen name="OutfitBuilder" component={OutfitBuilderRoute} options={{ presentation: "modal" }} />
            <RootStack.Screen name="ColorGuide" component={ColorGuideRoute} />
          </RootStack.Navigator>
        </NavigationContainer>
      </WardrobeContext.Provider>
    </SafeAreaProvider>
  );
}

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.cream,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen name="Home" component={HomeRoute} options={{ tabBarIcon: tabIcon("home-outline") }} />
      <Tabs.Screen name="Closet" component={ClosetRoute} options={{ tabBarIcon: tabIcon("shirt-outline") }} />
      <Tabs.Screen
        name="Add"
        component={AddPlaceholderRoute}
        options={{
          tabBarIcon: ({ focused }) => <AddTabIcon focused={focused} />,
          tabBarLabel: "Add",
        }}
        listeners={({ navigation }) => ({
          tabPress: (event) => {
            event.preventDefault();
            navigation.getParent()?.navigate("AddItem");
          },
        })}
      />
      <Tabs.Screen name="Outfits" component={OutfitsRoute} options={{ tabBarIcon: tabIcon("color-wand-outline") }} />
      <Tabs.Screen name="Guide" component={GuideRoute} options={{ tabBarIcon: tabIcon("color-palette-outline") }} />
    </Tabs.Navigator>
  );
}

function HomeRoute({ navigation }: any) {
  const { wardrobe } = useWardrobe();
  return (
    <HomeScreen
      wardrobe={wardrobe}
      onOpenBuilder={() => navigation.navigate("OutfitBuilder")}
      onOpenColorGuide={() => navigation.navigate("ColorGuide")}
    />
  );
}

function ClosetRoute({ navigation }: any) {
  const { wardrobe } = useWardrobe();
  return (
    <ClosetScreen
      wardrobe={wardrobe}
      onOpenItem={(item) => navigation.navigate("ItemDetails", { itemId: item.id })}
      onBuild={(items) => navigation.navigate("OutfitBuilder", { seedIds: items.map((item) => item.id) })}
    />
  );
}

function OutfitsRoute({ navigation }: any) {
  const { savedOutfits, wardrobe } = useWardrobe();
  return (
    <OutfitsScreen
      wardrobe={wardrobe}
      savedOutfits={savedOutfits}
      onOpenBuilder={() => navigation.navigate("OutfitBuilder")}
      onOpenOutfit={(outfit) => navigation.navigate("OutfitBuilder", { outfitId: outfit.id })}
    />
  );
}

function GuideRoute({ navigation }: any) {
  const { selectedItem } = useWardrobe();
  return <ColorGuideScreen item={selectedItem} onBack={() => navigation.navigate("Home")} />;
}

function AddPlaceholderRoute() {
  return <View style={{ flex: 1, backgroundColor: colors.background }} />;
}

function AddItemRoute({ navigation, route }: any) {
  const { addItem, getItem, updateItem } = useWardrobe();
  const editingItem = route.params?.editingItemId ? getItem(route.params.editingItemId) : undefined;
  return (
    <AddItemScreen
      editingItem={editingItem}
      onOpenLink={() => navigation.navigate("AddFromLink")}
      onClose={() => navigation.goBack()}
      onSave={async (item) => {
        if (editingItem) {
          await updateItem(item);
          navigation.replace("ItemDetails", { itemId: item.id });
        } else {
          await addItem(item);
          navigation.goBack();
          navigation.navigate("MainTabs", { screen: "Closet" });
        }
      }}
    />
  );
}

function AddFromLinkRoute({ navigation }: any) {
  return <AddFromLinkScreen onClose={() => navigation.goBack()} />;
}

function ItemDetailsRoute({ navigation, route }: any) {
  const { deleteItem, getItem } = useWardrobe();
  const item = getItem(route.params?.itemId);
  return (
    <ItemDetailsScreen
      item={item}
      onBack={() => navigation.goBack()}
      onEdit={() => navigation.navigate("AddItem", { editingItemId: item.id })}
      onDelete={async () => {
        await deleteItem(item);
        navigation.goBack();
      }}
      onOpenColorGuide={() => navigation.navigate("ColorGuide", { itemId: item.id })}
    />
  );
}

function OutfitBuilderRoute({ navigation, route }: any) {
  const { getSavedOutfit, saveOutfitFromItems, wardrobe } = useWardrobe();
  const seedIds = route.params?.seedIds as string[] | undefined;
  const saved = getSavedOutfit(route.params?.outfitId);
  const initialIds = saved?.itemIds ?? seedIds;
  const initialItems = initialIds?.length
    ? (initialIds.map((id) => wardrobe.find((item) => item.id === id)).filter(Boolean) as ClothingItem[])
    : getDefaultBuilderSeed(wardrobe);
  return (
    <OutfitBuilderScreen
      wardrobe={wardrobe}
      initialItems={initialItems}
      onClose={() => navigation.goBack()}
      onSaveOutfit={async (items) => {
        const outfit = await saveOutfitFromItems(items);
        Alert.alert("Outfit saved", `${outfit.name} is now in your outfits.`);
        navigation.goBack();
        navigation.navigate("MainTabs", { screen: "Outfits" });
      }}
      onOpenColorGuide={(item) => navigation.navigate("ColorGuide", { itemId: item.id })}
    />
  );
}

function ColorGuideRoute({ navigation, route }: any) {
  const { getItem } = useWardrobe();
  return <ColorGuideScreen item={getItem(route.params?.itemId)} onBack={() => navigation.goBack()} />;
}

function useWardrobe() {
  const context = useContext(WardrobeContext);
  if (!context) {
    throw new Error("useWardrobe must be used inside WardrobeContext.");
  }
  return context;
}

function getDefaultBuilderSeed(items: ClothingItem[]) {
  const top = items.find((item) => item.category === "top");
  const bottom = items.find((item) => item.category === "bottom");
  const shoes = items.find((item) => item.category === "shoes");
  return [top, bottom, shoes].filter(Boolean) as ClothingItem[];
}

function createOutfitName(items: ClothingItem[]) {
  const families = Array.from(new Set(items.map((item) => item.colorFamily))).slice(0, 3);
  if (families.length > 0) {
    return `${families.map((family) => family.charAt(0).toUpperCase() + family.slice(1)).join(", ")} Outfit`;
  }
  return "Saved Outfit";
}

function tabIcon(icon: keyof typeof Ionicons.glyphMap) {
  return ({ color, focused }: { color: string; focused: boolean }) => (
    <View style={[styles.iconWrap, focused && styles.activeIcon]}>
      <Ionicons name={icon} size={20} color={focused ? colors.gold : color} />
    </View>
  );
}

function AddTabIcon({ focused }: { focused: boolean }) {
  return (
    <View style={[styles.addIcon, focused && styles.addIconActive]}>
      <Ionicons name="add" size={27} color={colors.background} />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 66,
    paddingTop: 7,
    paddingBottom: 6,
    backgroundColor: "#071015",
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
    width: 46,
    height: 46,
    borderRadius: 23,
    marginTop: -18,
    backgroundColor: colors.gold,
    borderWidth: 4,
    borderColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  addIconActive: {
    backgroundColor: colors.cream,
  },
});
