import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

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

type RootStackParamList = {
  MainTabs: undefined;
  AddItem: { editingItemId?: string } | undefined;
  AddFromLink: undefined;
  ItemDetails: { itemId: string };
  OutfitBuilder: { seedIds?: string[] } | undefined;
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
  addItem: (item: ClothingItem) => Promise<void>;
  updateItem: (item: ClothingItem) => Promise<void>;
  deleteItem: (item: ClothingItem) => Promise<void>;
  getItem: (id?: string) => ClothingItem;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();
const WardrobeContext = createContext<WardrobeContextValue | null>(null);

export default function App() {
  const [wardrobe, setWardrobe] = useState<ClothingItem[]>(mockWardrobe);
  const [selectedItem, setSelectedItem] = useState<ClothingItem>(mockWardrobe[0]);

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
    return () => {
      mounted = false;
    };
  }, []);

  const persistWardrobe = async (items: ClothingItem[]) => {
    setWardrobe(items);
    await saveWardrobe(items);
  };

  const value = useMemo<WardrobeContextValue>(() => {
    const getItem = (id?: string) => wardrobe.find((item) => item.id === id) ?? selectedItem ?? wardrobe[0] ?? mockWardrobe[0];

    return {
      wardrobe,
      selectedItem,
      getItem,
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
        await persistWardrobe(nextWardrobe);
        await deleteStoredImage(item.imageUrl);
        setSelectedItem(nextWardrobe[0] ?? mockWardrobe[0]);
      },
    };
  }, [selectedItem, wardrobe]);

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
  const { wardrobe } = useWardrobe();
  return <OutfitsScreen wardrobe={wardrobe} onOpenBuilder={() => navigation.navigate("OutfitBuilder")} />;
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
  const { wardrobe } = useWardrobe();
  const seedIds = route.params?.seedIds as string[] | undefined;
  const initialItems = seedIds?.length
    ? (seedIds.map((id) => wardrobe.find((item) => item.id === id)).filter(Boolean) as ClothingItem[])
    : getDefaultBuilderSeed(wardrobe);
  return (
    <OutfitBuilderScreen
      wardrobe={wardrobe}
      initialItems={initialItems}
      onClose={() => navigation.goBack()}
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
    height: 72,
    paddingTop: 9,
    paddingBottom: 8,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    marginTop: -20,
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
